import { _fetch } from './util'
import { NETWORK_LIST } from './config'
import { SqlkError } from './error'

export const _loadNetworks = function () {
  this.loadingNetworks = true
  _fetch(NETWORK_LIST).then(data => {
    this.NETWORKS = data
    this.loadingNetworks = false
  }).catch(err => {
    throw new SqlkError('Issue connecting to Squarelink')
  })
}

export const _waitForNetworks = async function () {
  return new Promise((resolve, reject) => {
    let interval = setInterval(() => {
      if (!this.loadingNetworks) {
        clearInterval(interval)
        resolve()
      }
    }, 1)
  })
}

export const _availableAsSync = JSON.parse(`${process.env.VUE_APP_AVAILABLE_NETWORKS}`)
