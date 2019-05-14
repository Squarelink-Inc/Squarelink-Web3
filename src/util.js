/* eslint-disable */
import { RPC_ENDPOINT } from './config'
import { SqlkError } from './error'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=450,height=700,left=-500,top=150`

const NETWORKS = [
  'mainnet',
  'kovan',
  'rinkeby',
  'ropsten'
]

export const _serialize = function(obj) {
  var str = []
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]))
    }
  return str.join('&')
}

export const _popup = function(url) {
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

export const _validateParams = function({ client_id, network }) {
  if (typeof network === 'object') {
    if (!network.url)
      throw new SqlkError('Please provide an RPC endpoint for your custom network')
    else if (!network.url.match(/http[s]?:(\/?\/?)[^\s]+/))
      throw new SqlkError('We do not currently support non-http(s) RPC connections. Try updating squarelink to its latest version!')
    else if (network.chainId && (network.chainId !== parseInt(network.chainId) || network.chainId < 0 || network.chainId > 500000))
      throw new SqlkError('Please provide a valid Chain ID')
  } else {
    if (!NETWORKS.includes(network))
      throw new SqlkError('Invalid network provided')
  }
}

export const _getRPCEndpoint = function({ network, client_id }) {
  if (typeof network === 'object')
    return network.url
  else
    return `${RPC_ENDPOINT}/${network}/${client_id}`
}
