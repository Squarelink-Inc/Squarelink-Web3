import Iframe from './iframe'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=375,height=350,left=-500,top=150`

const getPopup = ({ url, params }) => {
  var popup = window.open('', '_blank', POPUP_PARAMS)
  if(!popup || popup.closed || typeof popup.closed=='undefined')
    return Promise.resolve({ iframe: new Iframe(url) })
  // Check if popup is blocked on Chrome
  return _chromeCheck({ popup, url, params })
}

const _chromeCheck = ({ popup, url, params }) =>
  new Promise((resolve, reject) => {
    var result = false
    popup.onload = () => {
      setTimeout(() => {
        if (result) return
        result = true
        if (!popup.innerHeight || popup.innerHeight <= 0) {
          popup.close()
          resolve({ iframe: new Iframe(url) })
        } else {
          _loadPopup({ url, popup, params }).then(popup => {
            resolve({ popup })
          })
        }
      }, 1)
    }
  })

const _loadPopup = ({ url, popup, params }) =>
  new Promise((resolve, reject) => {
    popup.location.href = url
    var result = false
    window.addEventListener('message', (e) => {
      if (result) return
      const { origin, type } = e.data
      if (origin === 'squarelink' && type === 'onload') {
        result = true
        popup.postMessage({ origin: 'squarelink-web3-sdk', params }, '*')
        popup.focus()
        resolve(popup)
        window.removeEventListener('message', function() {})
      }
    }, false)
  })

export default getPopup
