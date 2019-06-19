/* eslint-disable */
import { RPC_ENDPOINT } from './config'
import { SqlkError } from './error'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=425,height=700,left=-500,top=150`

const NETWORKS = [
  'mainnet',
  'kovan',
  'rinkeby',
  'ropsten'
]

export const _serialize = function(obj) {
  return encodeURIComponent(JSON.stringify(obj))
}

export const _fetch = function(url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url)
    xhr.send()
    xhr.onload = function() {
      if (xhr.status != 200) {
        reject(new SqlkError(`Issue fetching user's accounts`))
      } else {
        resolve(JSON.parse(xhr.response))
      }
    }
    xhr.onerror = function() {
      reject(new SqlkError(`Issue fetching user's accounts`))
    }
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

export const _validateSecureOrigin = function() {
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const isSecureOrigin = location.protocol === 'https:';
  const isSecure = isLocalhost || isSecureOrigin;

  if (!isSecure) {
    throw new SqlkError(`Access to the Squarelink Web3 Engine is restricted to secure origins.\nIf this is a development environment please use http://localhost:${
      location.port
    } instead.\nOtherwise, please use an SSL certificate.`)
  }
}
