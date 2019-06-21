/* eslint-disable */
import ProviderEngine from 'squarelink-provider-engine'
import CacheSubprovider from 'squarelink-provider-engine/subproviders/cache'
import FixtureSubprovider from 'squarelink-provider-engine/subproviders/fixture'
import FilterSubprovider from 'squarelink-provider-engine/subproviders/filters'
import VmSubprovider from 'squarelink-provider-engine/subproviders/vm'
import HookedWalletSubprovider from 'squarelink-provider-engine/subproviders/hooked-wallet'
import NonceSubprovider from 'squarelink-provider-engine/subproviders/nonce-tracker'
import RpcSubprovider from 'squarelink-provider-engine/subproviders/rpc'
import { VERSION } from './config'
import { _serialize, _validateParams, _getRPCEndpoint, _validateSecureOrigin } from './util'
import { _getAccounts, _signTx, _signMsg } from './walletMethods'
import { SqlkError } from './error'

export default class Squarelink {
  constructor(client_id, network='mainnet') {
    this.client_id = client_id
    _validateSecureOrigin()
    _validateParams({ client_id, network })
    this.network = network
    this.rpcEndpoint = _getRPCEndpoint({ client_id, network })
    this._initEngine()
  }

  getProvider() {
    return this.engine
  }

  changeNetwork(network) {
    const { client_id } = this
    _validateParams({ client_id, network })
    this.network = network
    this.rpcEndpoint = _getRPCEndpoint({ client_id, network })
    this._initEngine()
  }

  _initEngine() {
    var self = this
    this.accounts = []
    var engine = new ProviderEngine()
    engine.isSquarelink = true
    engine.isConnected = () => {
      return true
    }

    engine.send = (payload, callback) => {
      if (typeof payload === 'string') {
        return new Promise((resolve, reject) => {
          engine.sendAsync(
            {
              jsonrpc: '2.0',
              id: 42,
              method: payload,
              params: callback || [],
            },
            (error, response) => {
              if (error) {
                reject(error)
              } else {
                resolve(response.result)
              }
            },
          )
        })
      }

      if (callback) {
        engine.sendAsync(payload, callback)
        return
      }

      let result = null
      switch (payload.method) {
        case 'eth_accounts':
          result = this.accounts.length ? this.accounts : []
          break

        case 'eth_coinbase':
          result = this.accounts.length ? this.accounts[0] : undefined
          break

        /*case 'net_version':
          result = this._network
          break*/

        case 'eth_uninstallFilter':
          engine.sendAsync(payload, _ => _)
          result = true
          break

        default:
          var message = `The Squarelink Web3 object does not support synchronous methods like ${payload.method} without a callback parameter.`
          throw new SqlkError(message)
      }
      return {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        result,
      }
    }


    engine.addProvider(new FixtureSubprovider({
      web3_clientVersion: `Squarelink/${VERSION}/javascript`,
      net_listening: true,
      eth_hashrate: '0x00',
      eth_mining: false,
      eth_syncing: true,
    }))
    engine.addProvider(new CacheSubprovider())
    engine.addProvider(new FilterSubprovider())
    engine.addProvider(new NonceSubprovider())
    engine.addProvider(new VmSubprovider())
    engine.addProvider(new HookedWalletSubprovider({
      getAccounts: async function(cb){
        if (self.accounts.length) cb(null, self.accounts)
        else {
          _getAccounts(self.client_id).then(accounts => {
            self.accounts = accounts
            cb(null, accounts)
          }).catch(err => cb(err, null))
        }
      },
      getCoinbase: async function(cb) {
        this.getAccounts()
          .then((accounts) => cb(null, accounts[0]))
          .catch(err => cb(err, null))
      },
      signTransaction: async function(payload, cb) {
        let { from } = payload
        if (typeof from === 'number')
          from = self.accounts[from]
        _signTx({
          ...payload,
          from,
          method: 'eth_signTransaction',
          client_id: self.client_id,
          network: self.network
        })
        .then(res => cb(null, res))
        .catch(err => {
          console.log(err)
          cb(err, null)
        })
      },
      signMessage: async function(payload, cb) {
        let { from, data, method } = payload
        if (typeof from === 'number')
          from = self.accounts[from]
        _signMsg({
          client_id: self.client_id,
          method: method || 'eth_sign',
          message: data,
          account: from,
        })
        .then(res => cb(null, res))
        .catch(err => cb(err, null))
      },
      signPersonalMessage: async function(payload, cb) {
        this.signMessage({ ...payload, method: 'eth_personalSign' }, (err, res) => {
          if (err) cb(err, null)
          else cb(null, res)
        })
      },
      signTypedMessage: async function(payload, cb) {
        this.signMessage({ ...payload, method: 'eth_signTypedData' }, (err, res) => {
          if (err) cb(err, null)
          else cb(null, res)
        })
      },
      signTypedMessageV3: async function(payload, cb) {
        this.signMessage({ ...payload, method: 'eth_signTypedData_v3' }, (err, res) => {
          if (err) cb(err, null)
          else cb(null, res)
        })
      },
      getGasPrice: async cb => {
        cb(null, '')
      },
    }), 0)

    engine.addProvider(new RpcSubprovider({
      rpcUrl: this.rpcEndpoint,
    }))

    engine.on('error', function(err){
      console.error(err.stack)
    })

    engine.enable = () =>
      new Promise((resolve, reject) => {
        engine.sendAsync({ method: 'eth_accounts' }, (error, response) => {
          if (error) {
            reject(error)
          } else {
            resolve(response.result)
          }
        })
      })

    engine.start()

    this.engine = engine
  }
}
