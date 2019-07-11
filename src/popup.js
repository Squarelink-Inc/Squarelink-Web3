import Iframe from './iframe'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=375,height=350,left=-500,top=150`

const getPopup = ({ url, params }) => {
  var popup = window.open('', '_blank', POPUP_PARAMS)
  if (!popup || popup.closed || typeof popup.closed=='undefined') {
    try { popup.close() } catch (err) {}
    return Promise.resolve({ iframe: new Iframe(url, params) })
  }
  return _loadPopup({ url, popup, params })
}

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
        resolve({ popup })
        window.removeEventListener('message', function() {})
      }
    }, false)
  })

export default getPopup
