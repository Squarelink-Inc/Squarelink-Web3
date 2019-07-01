/* eslint-disable */
import { RPC_ENDPOINT } from './config'
import { SqlkError } from './error'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=375,height=350,left=-500,top=150`

const NETWORKS = [
  'mainnet',
  'kovan',
  'rinkeby',
  'ropsten'
]

const SCOPES = [
  'wallets:admin',
  'wallets:edit',
  'wallets:create',
  'wallets:remove',
  'wallets:read',
  'user',
  'user:name',
  'user:email',
  'user:security'
]

/**
 * URL-encodes a request object
 * @param {object} obj
 */
export const _serialize = function(obj) {
  return encodeURIComponent(JSON.stringify(obj))
}

/**
 * Creates and executes GET Request
 * @param {string} url
 */
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

/**
 * Creates Squarelink popup and returns posted result
 * @param {string} url
 */
export const _popup = function(url) {
  return new Promise((resolve, reject) => {
    const popup = window.open('', '_blank', POPUP_PARAMS)
    popup.location.href = url
    var result = false
    popup.focus()
    var popupTick = setInterval(function() {
      if (result) {
        clearInterval(popupTick)
      } else if (popup.closed) {
        clearInterval(popupTick)
        resolve({ error: 'Window closed' })
      }
    }, 100)
    window.addEventListener('message', function(e) {
      const { origin, height } = e.data
      if (origin === 'squarelink' && !result) {
        result = true
        window.removeEventListener('message', function() {})
        popup.close()
        resolve({ ...e.data, origin: undefined, height: undefined })
      }
    }, false)
  })
}

/**
 * Validates Squarelink inputs
 * @param {string} client_id
 * @param {string|object} [network]
 * @param {array} [scope]
 */
export const _validateParams = function({ client_id, network, scope }) {
  if (scope) {
    if (!Array.isArray(scope))
      throw new SqlkError(`'scope' must be an Array`)
    for(let i in scope) {
      if (!SCOPES.includes(scope[i]))
        throw new SqlkError(`We do not support the ${scope[i]} scope`)
    }
  }
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

/**
 * Gets RPC endpoint from network parameter
 * @param {string|object} network
 * @param {string} client_id
 */
export const _getRPCEndpoint = function({ network, client_id }) {
  if (typeof network === 'object')
    return network.url
  else
    return `${RPC_ENDPOINT}/${network}/${client_id}`
}

/**
 * Notifies developer that their app won't work if on an insecure origin
 */
export const _validateSecureOrigin = function() {
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  const isSecureOrigin = location.protocol === 'https:'
  const isChromeExt = location.protocol === 'chrome-extension:'
  const isSecure = isLocalhost || isSecureOrigin || isChromExt

  if (!isSecure) {
    throw new SqlkError(`Access to the Squarelink Web3 Engine is restricted to secure origins.\nIf this is a development environment please use http://localhost:${
      location.port
    } instead.\nOtherwise, please use an SSL certificate.`)
  }
}
