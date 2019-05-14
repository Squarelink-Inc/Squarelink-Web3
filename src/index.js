/* eslint-disable */
import ProviderEngine from 'web3-provider-engine'
import CacheSubprovider from 'web3-provider-engine/subproviders/cache'
import FixtureSubprovider from 'web3-provider-engine/subproviders/fixture'
import FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import VmSubprovider from 'web3-provider-engine/subproviders/vm'
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'
import NonceSubprovider from 'web3-provider-engine/subproviders/nonce-tracker'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import {
  _serialize,
  _validateParams,
  _getRPCEndpoint
} from './util'
import {
  API_ENDPOINT,
  APP_URL
} from './config'
import {
  _getAccounts,
  _signTx,
  _signMsg
} from './walletMethods'
import { SqlkError } from './error'

export default class Squarelink {
  constructor(client_id, network='mainnet') {
    this.client_id = client_id
    _validateParams({ client_id, network })
    this.network = network
    this.rpcEndpoint = _getRPCEndpoint({ client_id, network })
    this._initEngine()
    this.defaultAccount = 'wjdialjdwil'
  }

  getProvider() {
    return this.engine
  }

  _initEngine() {
    var self = this
    var engine = new ProviderEngine()

    engine.addProvider({
      setEngine: _ => _,
      handleRequest: async (payload, next, end) => {
        switch(payload.method) {
          case 'eth_signTransaction':
            _signTx({
              ...payload.params[0],
              method: 'signTransaction',
              client_id: self.client_id,
              network: self.network
            })
              .then(res => end(null, res))
              .catch(err => end(err, null))
            break
          case 'eth_sendTransaction':
            _signTx({
              ...payload.params[0],
              method: 'sendTransaction',
              client_id: self.client_id,
              network: self.network
            })
              .then(res => end(null, res))
              .catch(err => end(err, null))
            break
          case 'eth_sign':
            _signMsg({
              client_id: self.client_id,
              method: 'signMessage',
              message: payload.params[1],
              account: payload.params[0],
            })
              .then(res => end(null, res))
              .catch(err => end(err, null))
            break
          default:
            next()
            break
        }
      },
    })

    engine.addProvider(new FixtureSubprovider({
      web3_clientVersion: 'Squarelink/v0.0.1/javascript',
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
        if (self.accounts) cb(null, self.accounts)
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
      }
    }))

    engine.addProvider(new RpcSubprovider({
      rpcUrl: this.rpcEndpoint,
    }))

    engine.on('error', function(err){
      console.error(err.stack)
    })
    engine.start()

    this.engine = engine
  }
}
