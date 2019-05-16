<template>
  <div class="hello">
    <h4 class="title">Display a list of your wallets using the eth_getAccounts method</h4>
    <a href="javascript:void(0)" @click="getAccounts">
      <img src="https://squarelink.com/img/sign-in.svg" width="240"/>
    </a>

    <a href="javascript:void(0)" @click="signTx">
      <img src="https://squarelink.com/img/sign-tx.svg" width="240"/>
    </a>

    <a href="javascript:void(0)" @click="signMsg">
      <img src="https://squarelink.com/img/sign-msg.svg?v=3" width="240"/>
    </a>

    <a href="javascript:void(0)" @click="getCoinbase">Get Coinbase</a>

    <p>{{result}}</p>

  </div>
</template>

<script>
/* eslint-disable */
import Squarelink from '../../../src/index'
import Web3 from 'web3'

export default {
  name: 'HelloWorld',
  data() {
    return {
      result: ''
    }
  },
  mounted() {
    var sqlk = new Squarelink('560346b97085cb98cdc9', 'ropsten')
    window.web3 = new Web3(sqlk.getProvider())
  },
  methods: {
    async getAccounts() {
      window.web3.eth.getAccounts().then(accounts => {
        this.result = accounts
      }).catch(err => {
        console.log(err)
      })
    },
    async signTx() {
      window.web3.eth.sendTransaction({
        to: '0xed19abdc33e92c809376b742d48ed1d935d4faef',
        from: 0,
        value: '10000000000',
        gasPrice: '80000000000'
      }).then(res => {
        this.result = res
      }).catch(err => {
        console.log(err)
      })
    },
    async signMsg() {
      console.log(window.web3.signTypedMessage)
      this.result = await window.web3.eth.signTypedMessage('Hello, my name is Alex', '0xc919ac3f8e6ff03349e472d501606fefee300028').catch(err => {
        console.log(err)
      })
    },
    async getCoinbase() {
      this.result = await window.web3.eth.getCoinbase().catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.data {
  width: 500px;
  margin: 0 auto;
}

.error {
  color: red;
}

.title {
  text-align: center;
}
.category{
  text-align: left;
}

a {
  display: block;
}

p {
  margin: 0 auto;
  text-align: center;
  width: 500px;
}
</style>
