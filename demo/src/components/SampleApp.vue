<template>
  <div class="hello">
    <h4 class="title">Display a list of your wallets using the eth_getAccounts method</h4>
    <a href="javascript:void(0)" @click="getAccounts">
      <img src="https://squarelink.com/img/sign-in.svg" width="240"/>
    </a>
    <p>{{result}}</p>
    <a href="javascript:void(0)" @click="signTx">
      <img src="https://squarelink.com/img/sign-tx.svg" width="240"/>
    </a>

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
      this.result = await this.sqlk.getAddresses()
    },
    async signTx() {
      this.result = await this.sqlk.signTx({
        to: '0xf40bed2ffee76b5517fc992cc798ece4c55d8f99',
        value: '100000',
        data: '0x0000abcdef0000abcdef0000abcdef0000abcdef0000abcdef0000abcdef0000abcdef'
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

p {
  margin: 0 auto;
  text-align: center;
  width: 500px;
}
</style>
