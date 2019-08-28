/* eslint-disable */
import ProviderEngine from 'squarelink-provider-engine'
import CacheSubprovider from 'squarelink-provider-engine/subproviders/cache'
import FixtureSubprovider from 'squarelink-provider-engine/subproviders/fixture'
import FilterSubprovider from 'squarelink-provider-engine/subproviders/filters'
import VmSubprovider from 'squarelink-provider-engine/subproviders/vm'
import HookedWalletSubprovider from 'squarelink-provider-engine/subproviders/hooked-wallet'
import NonceSubprovider from 'squarelink-provider-engine/subproviders/nonce-tracker'
import RpcSubprovider from 'squarelink-provider-engine/subproviders/rpc'
import SubscriptionSubprovider from 'squarelink-provider-engine/subproviders/subscriptions'
import WebSocketSubprovider from 'squarelink-provider-engine/subproviders/websocket'

import { VERSION } from './config'
import {
  _serialize,
  _validateParams,
  _getRPCInfo,
  _validateSecureOrigin,
  _getNetVersion,
} from './util'
import { _loadNetworks, _waitForNetworks } from './networks'
import { _getAccounts, _signTx, _signMsg } from './walletMethods'
import { SqlkError } from './error'

export default class Squarelink {
  /**
   * @param {string} clientId - Squarelink Client ID
   * @param {string} [network] - name of the network
   * @param {object} [network]
   * @param {string} [network.url] - the RPC Endpoint
   * @param {string} [network.chainId]
   */
  constructor(client_id, network='mainnet', opts = {}) {
    _loadNetworks.call(this)
    this.client_id = client_id
    this.network = network
    this.scope = opts.scope || []
    this.stopped = true
  }

  /**
   * @returns { Web3Provider } a Web3Provider for use in web3.js
   */
  async getProvider(cb) {
    await _waitForNetworks.call(this)
    const { client_id, network, scope } = this
    _validateSecureOrigin()
    _validateParams.call(this, { client_id, network, scope })
    this.changeNetwork(network)
    // Support callbacks over promises
    if (cb) {
      cb(this.engine)
      return Promise.resolve()
    }
    return Promise.resolve(this.engine)
  }

  /**
   * Change the connected network
   * @param {string} network
   * @param {object} network
   * @param {string} network.url
   * @param {string} network.chainId
   */
  changeNetwork(network) {
    const { client_id } = this
    _validateParams.call(this, { client_id, network })
    this.network = network
    this.net_version = _getNetVersion.call(this, network)
    const { rpcUrl, connectionType, skipCache } = _getRPCInfo.call(this, network)
    this.connectionType = connectionType
    this.rpcUrl = rpcUrl
    this._initEngine(skipCache)
  }

  /* END CUSTOM SQUARELINK METHODS */

  _initEngine(skipCache) {
    var self = this
    this.accounts = []
    var engine = new ProviderEngine({
      setSkipCacheFlag: skipCache,
    })
    engine.isSquarelink = true
    engine.isConnected = () => {
      return true
    }
    engine.send = (payload, callback) => {
      if (typeof payload === 'string') {
        return new Promise((resolve, reject) => {
          engine.sendAsync({
            jsonrpc: '2.0',
            id: 42,
            method: payload,
            params: callback || [],
          }, (error, response) => {
            if (error) {
              reject(error)
            } else {
              resolve(response.result)
            }
          })
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

        case 'net_version':
          result = this.net_version || null
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

    /**
     * START OF MIDDLEWARE DECLARATIONS
     */
    const fixtureSubprovider = new FixtureSubprovider({
      web3_clientVersion: `Squarelink/v${VERSION}/javascript`,
      net_listening: true,
      eth_hashrate: '0x00',
      eth_mining: false,
      eth_syncing: true,
    })
    const nonceSubprovider = new NonceSubprovider()
    const cacheSubprovider = new CacheSubprovider()
    const vmSubprovider = new VmSubprovider()
    /* Squarelink ID/Wallet Management */
    const walletSubprovider = new HookedWalletSubprovider({
      getAccounts: async function(cb){
        if (self.accounts.length) cb(null, self.accounts)
        else {
          _getAccounts(self.client_id, { scope: self.scope }).then(({ email, name, securitySettings, accounts }) => {
            self.accounts = accounts
            self.defaultEmail = email
            self.defaultName = name
            self.defaultSecuritySettings = securitySettings
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
        .then(res => {
          cb(null, res)
        })
        .catch(err => {
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
      }
    })
    /* ADD MIDDELWARE (PRESERVE ORDER) */
    engine.addProvider(fixtureSubprovider)
    engine.addProvider(nonceSubprovider)
    engine.addProvider(cacheSubprovider)
    engine.addProvider(vmSubprovider)
    engine.addProvider(walletSubprovider, 0)

    const { rpcUrl, connectionType } = this
    if (connectionType === 'http') {
      engine.addProvider(new RpcSubprovider({ rpcUrl }))
      engine.addProvider(new SubscriptionSubprovider(), 2)
      engine.addProvider(new FilterSubprovider(), 1)
    } else if (connectionType === 'ws') {
      engine.addProvider(new WebSocketSubprovider({ rpcUrl }))
    }

    /* END OF MIDDLEWARE */

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

  /* CUSTOM SQUARELINK METHODS */

  /**
   * @returns {string} the user's email
   */
  getEmail() {
    if (!this.scope.includes('user') && !this.scope.includes('user:email'))
      throw new SqlkError(`Please enable the user:email scope when initializing Squarelink`)
    return this.defaultEmail
  }

  /**
   * Returns the name of the authenticated user
   * @returns {string} the user's name
   */
  getName() {
    if (!this.scope.includes('user') && !this.scope.includes('user:name'))
      throw new SqlkError(`Please enable the user:name scope when initializing Squarelink`)
    return this.defaultName
  }

  /**
   * @typedef {Object} SquarelinkSecurity
   * @property {string} has2fa
   * @property {string} hasRecovery
   * @property {string} emailVerified
   */
  /**
   * Returns the security settings of the authenticated user
   * @returns {SquarelinkSecurity} security settings
   */
  getSecuritySettings() {
    if (!this.scope.includes('user') && !this.scope.includes('user:security'))
      throw new SqlkError(`Please enable the user:security scope when initializing Squarelink`)
    return this.defaultSecuritySettings
  }
}
