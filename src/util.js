/* eslint-disable */
import { VERSION } from './config'
import { SqlkError } from './error'
import getPopup from './popup'

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
      if (xhr.status === 403) {
        reject(new SqlkError(`You are not authorized to access that resource`))
      } else if (xhr.status !== 200) {
        reject(new SqlkError(`Issue connecting to Squarelink servers`))
      } else {
        resolve(JSON.parse(xhr.response))
      }
    }
    xhr.onerror = function() {
      reject(new SqlkError(`Issue connecting to Squarelink servers`))
    }
  })
}

/**
 * Creates Squarelink popup and returns posted result
 * @param {string} url
 */
 export const _popup = function(url) {
   return new Promise(async (resolve, reject) => {
     const { popup, iframe, error } = await getPopup(url)
     if (error) return resolve({ error: 'Window closed' })

     var result = false

     if (popup) {
       // Poll to check if popup has been closed
       var popupTick = setInterval(function() {
         if (result) {
           clearInterval(popupTick)
         } else if (popup.closed) {
           result = true
           window.removeEventListener('message', function() {})
           clearInterval(popupTick)
           resolve({ error: 'Window closed' })
           const preloader = document.getElementById('squarelink-preloader-container')
           preloader.parentNode.removeChild(preloader)
         }
       }, 1)
     }

     if (iframe) {
       iframe.onClosed = (error) => {
         if (!result) {
           result = true
           window.removeEventListener('message', function() {})
           resolve({ error: error || 'Window closed' })
         }
       }
     }

     window.addEventListener('message', function(e) {
       const { origin, height, type } = e.data
       if (type === 'onload') return
       if (origin === 'squarelink' && !result) {
         result = true
         window.removeEventListener('message', function() {})
         if (popup) {
           popup.close()
           const preloader = document.getElementById('squarelink-preloader-container')
           preloader.parentNode.removeChild(preloader)
         } else {
           iframe.close()
         }
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
    else if (!network.url.match(/(wss|https){1}?:(\/?\/?)[^\s]+/))
      throw new SqlkError('We do not currently support insecure (http://, ws://) RPC connections. Try updating squarelink to its latest version!')
    else if (network.chainId && (network.chainId !== parseInt(network.chainId) || network.chainId < 0 || network.chainId > 500000))
      throw new SqlkError('Please provide a valid Chain ID')
    else if (network.skipCache !== undefined && typeof network.skipCache !== 'boolean')
      throw new SqlkError('the `skipCache` paramter must be a boolean')
  } else if (!this.NETWORKS[network]) {
    throw new SqlkError('Invalid network provided')
  } else if (!!this.NETWORKS[network].sdkVersion) {
    const { sdkVersion } = this.NETWORKS[network]
    let sdkParts = VERSION.split('.')
    let netParts = sdkVersion.split('.')
    for (let i = 0; i < 3; i++) {
      if (parseInt(sdkParts[i]) > parseInt(netParts[i])) return
      if (parseInt(sdkParts[i]) < parseInt(netParts[i])) {
        throw new SqlkError(`You need to update Squarelink to squarelink@${sdkVersion} to use that network`)
      }
    }
  }
}

/**
 * Notifies developer that their app won't work if on an insecure origin
 */
export const _validateSecureOrigin = function() {
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  const isSecureOrigin = location.protocol === 'https:'
  const isChromeExt = location.protocol === 'chrome-extension:'
  const isSecure = isLocalhost || isSecureOrigin || isChromeExt

  if (!isSecure) {
    throw new SqlkError(`Access to the Squarelink Web3 Engine is restricted to secure origins.\nIf this is a development environment please use http://localhost:${
      location.port
    } instead.\nOtherwise, please use an SSL certificate.`)
  }
}

/**
 * Gets RPC info from network parameter
 * @param {string|object} network
 */
export const _getRPCInfo = function(network) {
  var rpcUrl
  var skipCache = true
  if (typeof network === 'object') {
    rpcUrl = network.url
    skipCache = network.skipCache !== undefined ? network.skipCache : true
  } else {
    let netInfo = this.NETWORKS[network]
    rpcUrl = netInfo.rpcUrl
    skipCache = netInfo.skipCache !== undefined ? netInfo.skipCache : true
  }
  const protocol = rpcUrl.split(':')[0].toLowerCase()
  switch (protocol) {
    case 'http':
    case 'https':
      return {
        rpcUrl,
        skipCache,
        connectionType: 'http'
      }
    case 'ws':
    case 'wss':
      return {
        rpcUrl,
        skipCache,
        connectionType: 'ws'
      }
    default:
      throw new SqlkError(`Unrecognized protocol in "${rpcUrl}"`)
  }
}

/**
 * Get the current network version
 * @param {string|object} network
 */
export const _getNetVersion = function(network) {
  if (typeof network === 'object') return network.chainId || null
  return this.NETWORKS[network].chainId
}
