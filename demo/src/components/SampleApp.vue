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
      <img src="https://squarelink.com/img/sign-msg.svg" width="240"/>
    </a>

    <a href="javascript:void(0)" @click="getCoinbase">Get Coinbase</a>

    <p>{{result}}</p>

  </div>
</template>

<script>
/* eslint-disable */
import Squarelink from '../../../src/index'
//import Web3 from 'web3'

//window.web3 = new Web3(sqlk.getProvider())

export default {
  name: 'HelloWorld',
  data() {
    return {
      result: ''
    }
  },
  mounted() {
    this.sqlk = new Squarelink('560346b97085cb98cdc9')
  },
  methods: {
    async getAccounts() {
      this.result = await this.sqlk.getAccounts()
    },
    async signTx() {
      this.result = await this.sqlk.signTx({
        to: '0xf40bed2ffee76b5517fc992cc798ece4c55d8f99',
        value: '1000000000000',
      })
    },
    async signMsg() {
      this.result = await this.sqlk.signMsg({
        method: 'eth_signMessage',
        message: 'Hello, my name is Alex'
      })
    },
    async getCoinbase() {
      this.result = await this.sqlk.getCoinbase()
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
