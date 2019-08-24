/* eslint-disable */

export const VERSION = '<@VERSION@>'

var ENV = '<@ENVIRONMENT@>'

export const API_ENDPOINT = ENV==='production' ? `https://api.squarelink.com` : `http://localhost:3007`

export const APP_URL = ENV=== 'production' ? `https://app.squarelink.com` : `http://localhost:8082`

export const IFRAME_URL = ENV==='production' ? `https://squarelink.com/popup` : `http://localhost:8085/popup`
