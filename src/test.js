import * as ProviderEngine from 'web3-provider-engine'
import * as RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'
import * as CacheSubprovider from 'web3-provider-engine/subproviders/cache'
import * as FixtureSubprovider from 'web3-provider-engine/subproviders/fixture'
import * as FilterSubprovider from 'web3-provider-engine/subproviders/filters'
import * as VmSubprovider from 'web3-provider-engine/subproviders/vm'
import * as NonceSubprovider from 'web3-provider-engine/subproviders/nonce-tracker'

engine.addProvider(new FixtureSubprovider({
    web3_clientVersion: 'ProviderEngine/v0.0.0/javascript',
    net_listening: true,
    eth_hashrate: '0x00',
    eth_mining: false,
    eth_syncing: true
}))

// cache layer
engine.addProvider(new CacheSubprovider())

// filters
engine.addProvider(new FilterSubprovider())

// pending nonce
engine.addProvider(new NonceSubprovider())

// vm
engine.addProvider(new VmSubprovider())
var web3

// id mgmt
engine.addProvider(
  new HookedWalletSubprovider({
    getAccounts: async cb => {
      const widgetCommunication = (await this.widget).communication
      const { error, result } = await widgetCommunication.getAccounts(this.config)
      if (!error && result) {
        this._selectedAddress = result[0]
      }
      cb(error, result)
    },
    signTransaction: async (txParams, cb) => {
      const widgetCommunication = (await this.widget).communication
      const { error, result } = await widgetCommunication.signTransaction(txParams, this.config)
      cb(error, result)
    },
    signMessage: async (msgParams, cb) => {
      const widgetCommunication = (await this.widget).communication
      const params = Object.assign({}, msgParams, { messageStandard: 'signMessage' })
      const { error, result } = await widgetCommunication.signMessage(params, this.config)
      cb(error, result)
    },
    signPersonalMessage: async (msgParams, cb) => {
      const widgetCommunication = (await this.widget).communication
      const params = Object.assign({}, msgParams, { messageStandard: 'signPersonalMessage' })
      const { error, result } = await widgetCommunication.signMessage(params, this.config)
      cb(error, result)
    },
    signTypedMessage: async (msgParams, cb) => {
      const widgetCommunication = (await this.widget).communication
      const params = Object.assign({}, msgParams, { messageStandard: 'signTypedMessage' })
      const { error, result } = await widgetCommunication.signMessage(params, this.config)
      cb(error, result)
    },
    signTypedMessageV3: async (msgParams, cb) => {
      const widgetCommunication = (await this.widget).communication
      const params = Object.assign({}, msgParams, { messageStandard: 'signTypedMessageV3' })
      const { error, result } = await widgetCommunication.signMessage(params, this.config)
      cb(error, result)
    },
    estimateGas: async (txParams, cb) => {
      const gas = await getTxGas(query, txParams)
      cb(null, gas)
    },
    getGasPrice: async cb => {
      cb(null, '')
    },
  }),
)

web3 = new Web3(provider)

// data source
engine.addProvider(new RpcSubprovider({
  rpcUrl: nodeUrl
}))

// log new blocks
engine.on('block', function (block) {
  console.log('================================')
  console.log('BLOCK CHANGED:', '#' + block.number.toString('hex'), '0x' + block.hash.toString('hex'))
  console.log('================================')
})

// network connectivity error
engine.on('error', function (err) {
    // report connectivity errors
    console.error(err.stack)
})

// start polling for blocks
engine.start()
