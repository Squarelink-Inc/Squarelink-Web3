/* eslint-disable */
export const API_ENDPOINT = process.env.NODE_ENV==='production' ? `https://api.squarelink.com` : `http://localhost:3007`

export const APP_URL = process.env.NODE_ENV==='production' ? `https://app.squarelink.com` : `http://localhost:8082`

export const RPC_ENDPOINT = process.env.NODE_ENV==='production' ? `https://web3.squarelink.com` : `http://localhost:3012`

export const VERSION = '0.0.1'
