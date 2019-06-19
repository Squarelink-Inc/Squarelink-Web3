/* eslint-disable */
import iframe from './iframe'
import { _popup, _serialize, _fetch } from './util'
import { SqlkError } from './error'
import { APP_URL, API_ENDPOINT, VERSION } from './config'

export const _getAccounts = function (client_id) {
  return new Promise(async (resolve, reject) => {
    let url = `${APP_URL}/authorize?client_id=${client_id}&scope=[wallets:read]&response_type=token&widget=true&version=${VERSION}`
    iframe(url).then(({ error, result }) => {
      if (error) reject(new SqlkError(error))
      else {
        _fetch(`${API_ENDPOINT}/wallets?access_token=${result}`).then(async (data) => {
          if (!data.success) reject(new SqlkError(data.message || 'Issue fetching accounts, try again later'))
          else resolve(data.wallets.map(w => w.address))
        }).catch(err => reject(err))
      }
    })
  })
}

export const _signMsg = async function ({ client_id, message, method, account }) {
  let url = `${APP_URL}/msg?client_id=${client_id}&method=${method || 'eth_sign'}&version=${VERSION}`
  if (account)
    url = `${url}&account=${account}`
  if (method === 'eth_signTypedData') {
    url = `${url}&params=${_serialize(message)}`
  } else if (method === 'eth_signTypedData_v3') {
    url = `${url}&paramsV3=${_serialize(message)}`
  } else {
    url = `${url}&msg=${message}`
  }
  return _popup(url).then(({ error, result }) => {
    if (error) throw new SqlkError(error)
    return Promise.resolve(result)
  })
}

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
  let url = `${APP_URL}/tx?widget=true&method=${method}&client_id=${client_id}&version=${VERSION}`
  if (!to) throw new SqlkError('You must provide a recipient `to` for the request')
  url = `${url}&to=${to}`
  if (value) url = `${url}&value=${parseInt(value, 16)}`
  if (from) url = `${url}&from=${from}`
  if (gas) url = `${url}&gas=${parseInt(gas, 16)}`
  if (gasPrice) url = `${url}&gasPrice=${Math.pow(10, -9) * parseInt(gasPrice, 16)}`
  if (nonce) url = `${url}&nonce=${parseInt(nonce, 16)}`
  if (description) url = `${url}&description=${description}`
  if (state) url = `${url}&state=${state}`
  if (data) url = `${url}&data=${data}`
  // set network
  if (typeof network === 'object') {
    url = `${url}&network=custom&rpc_url=${network.url}`
    if (network.chainId) url = `${url}&chain_id=${network.chainId}`
  } else {
    url = `${url}&network=${network}`
  }
  return _popup(url).then(({ error, result }) => {
    if (error) throw new SqlkError(error)
    return Promise.resolve(result)
  })
}
