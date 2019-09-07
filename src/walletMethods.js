/* eslint-disable */
import { _popup, _serialize, _fetch } from './util'
import { SqlkError } from './error'
import { APP_URL, API_ENDPOINT, VERSION } from './config'
import bn from 'bignumber.js'

/**
 * Get a list of the users Ethereum accounts
 * @param {string} clientId
 * @param {object} opts
 */
export const _getAccounts = function (client_id, opts = {}) {
  let scope = {'wallets:read': 1}
  if (opts.scope && opts.scope.length) {
    opts.scope.forEach(s => scope[s] = 1)
  }
  scope = Object.keys(scope).toString().replace(/ /g, '')
  return new Promise(async (resolve, reject) => {
    let url = `${APP_URL}/authorize?version=${VERSION}`
    let params = {
      version: VERSION,
      client_id,
      scope: `[${scope}]`,
      response_type: 'token',
      widget: true
    }
    _popup({ url, params }).then(({ error, result }) => {
      if (error) reject(new SqlkError(error))
      else {
        let promises = []
        promises.push(_fetch(`${API_ENDPOINT}/wallets?access_token=${result}`).then(async ({ success, wallets }) => {
          if (!success) reject(new SqlkError(data.message || 'Issue fetching accounts, try again later'))
          else {
            return Promise.resolve({
              accounts: ([
                wallets.find(w => w.default),
                ...wallets.filter(w => !w.default)
              ]).map(w => w.address)
            })
          }
        }).catch(err => reject(err)))
        if (scope !== 'wallets:read') {
          promises.push(_fetch(`${API_ENDPOINT}/user?access_token=${result}`).then(async ({ success, ...user }) => {
            if (!success) reject(new SqlkError(data.message || 'Issue fetching user info, try again later'))
            else {
              return Promise.resolve({
                securitySettings: {
                  has2fa: user.has_2fa,
                  hasRecovery: user.has_recovery,
                  emailVerified: user.email_verified
                },
                name: `${user.given_name} ${user.family_name}`,
                email: user.email
              })
            }
          }).catch(err => reject(err)))
        }
        Promise.all(promises).then(results => {
          let result = {}
          results.forEach(r => {
            result = { ...result, ...r }
          })
          resolve(result)
        })

      }
    })
  })
}

/**
 * Request a signed message from a user
 * @param {string} client_id
 * @param {string} message
 * @param {string} method
 * @param {string} account
 */
export const _signMsg = async function ({ client_id, message, method, account }) {
  let url = `${APP_URL}/msg?version=${VERSION}`
  let params = {
    client_id,
    method,
    version: VERSION,
    account,
  }
  if (method === 'eth_signTypedData') {
    params.params = message
  } else if (method === 'eth_signTypedData_v3') {
    params.paramsV3 = message
  } else {
    params.msg = message
  }
  return _popup({ url, params }).then(({ error, result }) => {
    if (error) throw new SqlkError(error)
    return Promise.resolve(result)
  })
}

/**
 * Request a signed transaction from a user
 * @param {string} method
 * @param {string} client_id
 * @param {string} value
 * @param {string} to
 * @param {string} from
 * @param {string} gas
 * @param {string} gasPrice
 * @param {string} nonce
 * @param {string} network
 * @param {string} description
 * @param {string} state
 * @param {string} data
 */
export const _signTx = async function ({
  method,
  client_id,
  value,
  to,
  from,
  gas,
  gasPrice,
  nonce,
  network,
  description,
  state,
  data,
}) {
  if (!to) throw new SqlkError('You must provide a recipient `to` for the request')
  let url = `${APP_URL}/tx?widget=true&version=${VERSION}`
  let params = {
    method,
    client_id,
    version: VERSION,
    widget: true,
    to,
    from,
    data,
    state,
    description,
  }
  if (value) params.value = new bn(value, 16).toString()
  if (gas) params.gas = new bn(gas, 16).toString()
  if (gasPrice) params.gasPrice = new bn(gasPrice, 16).toString()
  if (nonce) params.nonce = new bn(nonce, 16).toString()
  // set network
  if (typeof network === 'object') {
    params.network = 'custom'
    params.rpc_url = network.url
    if (network.chainId) params.chain_id = network.chainId
  } else {
    params.network = network
  }
  return _popup({ url, params }).then(({ error, result }) => {
    if (error) throw new SqlkError(error)
    return Promise.resolve(result)
  })
}
