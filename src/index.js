const http = process.env.NODE_ENV==='production' ? require('https') : require('http')

const API_ENDPOINT = `http://localhost:3007`

const APP_URL = `http://localhost:8082`

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=450,height=700,left=-500,top=150`

const _serialize = function(obj) {
  var str = []
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
    }
  return str.join('&')
}

const _popup = function(url) {
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

const _request = function(method='GET', url, params) {
  return new Promise((resolve, reject) => {
    if (method === 'GET') {
      http.get(`${url}?${_serialize(params)}`, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
          console.log(data)
        })
        res.on('end', () => {
          resolve(JSON.parse(data))
        })
      }).on('error', (err) => {
        reject(err)
      })
    }
  })
}

export default class Squarelink {
  constructor(client_id, network = 'mainnet', options = {}) {
    this.client_id = client_id
    this.network = network || 'mainnet'
    this.options = options
  }

  getCoinbase() {
    return new Promise(async (resolve, reject) => {
      if (this.accounts) {
        resolve(this.accounts[0])
      } else {
        this.getAccounts().then(accounts => {
          resolve(accounts[0])
        }).catch(err => reject(err))
      }
    })
  }

  getAccounts() {
    return new Promise(async (resolve, reject) => {
      if (this.accounts) {
        resolve(this.accounts)
      } else {
        let url = `${APP_URL}/authorize?client_id=${this.client_id}&scope=[wallets:read]&response_type=token&widget=true`
        let access_token = (await _popup(url)).result
        _request('GET', `${API_ENDPOINT}/wallets`, { access_token }).then((data) => {
          let accounts = data.wallets.map(w => w.address)
          this.accounts = accounts
          resolve(accounts)
        })
      }
    })
  }

  async signMsg({ message, params, method }) {
    let url = `${APP_URL}/msg?client_id=560346b97085cb98cdc9&method=${method || 'signMessage'}`
    if (method === 'signTypedMessage') {
      url = `${url}&params=${_serialize(params)}`
    } else {
      url = `${url}&msg=${message}`
    }
    return (await _popup(url)).result
  }

  async signTx({ value, to, data }) {
    let url = `${APP_URL}/tx?widget=true&method=eth_signTransaction&client_id=${this.client_id}&to=${to}&value=${value || '0'}`
    if (data) url = `${url}&data=${data}`
    return (await _popup(url)).result
  }
}
