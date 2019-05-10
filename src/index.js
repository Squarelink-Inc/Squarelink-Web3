/* eslint-disable */
import connectToChild from 'penpal/lib/connectToChild'
import styles from './styles'
import axios from 'axios'

const API = `http://localhost:3007`

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=450,height=700,left=-500,top=150`

export default class Squarelink {
  constructor(client_id, network = 'mainnet', options = {}) {
    this.client_id = client_id
    this.network = network || 'mainnet'
    this.options = options
    //this.url = 'http://localhost:8082/msg?client_id=560346b97085cb98cdc9&msg=wjdilajdilwajdilwajg'
  }

  async getAddresses() {
    let url = `http://localhost:8082/authorize?client_id=${this.client_id}&scope=[wallets:read]&response_type=token&widget=true`
    let access_token = (await this._popup(url)).result
    return axios.get(`${API}/wallets`, {
      params: {
        access_token
      }
    }).then(({ data }) => {
      let addresses = data.wallets.map(w => w.address)
      return Promise.resolve(addresses)
    })
  }

  async signTx({ value, to, data }) {
    let url = `http://localhost:8082/tx?widget=true&client_id=${this.client_id}&to=${to}&value=${value || '0'}`
    if (data) url = `${url}&data=${data}`
    return (await this._popup(url)).result
  }

  _popup(url) {
    return new Promise((resolve, reject) => {
      const popup = window.open(url, 'Squarelink', POPUP_PARAMS)
      popup.focus()
      let self = this
      window.addEventListener('message', function(e) {
        if (e.data.origin === 'squarelink') {
          popup.close()
          window.removeEventListener('message', function() {})
          resolve({ ...e.data, origin: undefined })
        }
      }, false)
    })
  }
}
