/* eslint-disable */

export const VERSION = '<@VERSION@>'

var ENV = '<@ENVIRONMENT@>'

export const API_ENDPOINT = ENV==='production' ? `https://api.squarelink.com` : `http://localhost:3007`

export const APP_URL = ENV=== 'production' ? `https://app.squarelink.com` : `http://localhost:8082`

export const IFRAME_URL = ENV==='production' ? `https://app.squarelink.com/popup` : `http://localhost:8082/popup`

export const RPC_ENDPOINT = `https://<@NETWORK@>.infura.io/v3/97d643e0cb664922a7009a6af33b42aa`
