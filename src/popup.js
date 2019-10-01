import Iframe from './iframe'
import headerStyles from './styles'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=375,height=350,left=-500,top=150`

const getPopup = ({ url, params }) => {
  /* INITIALIZE HEADER STYLES */
  const style = document.createElement('style')
  style.innerHTML = headerStyles
  const head = document.head || document.getElementsByTagName('head')[0]
  head.appendChild(style)

  /* INITIALIZE POPUP DIALOG */
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
        _addPageLoader(popup)
        resolve({ popup })
        window.removeEventListener('message', function() {})
      }
    }, false)
  })


const _addPageLoader = (popup) => {
  const container = document.createElement('div')
  container.id = `squarelink-preloader-container`
  container.style = `
    position: fixed;
    height: 100%;
    width: 100%;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 2147483647;
    background: rgba(0,0,0,0.5);
  `
  /* INITIALIZE PRELOADER */
  const preloader = `<div class="squarelink-preloader" id="squarelink-preloader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`

  /* INITIALIZE CLOSE BUTTON */
  const closeButton = '<div class="squarelink-close" id="squarelink-close-button"></div>'

  container.innerHTML = closeButton + preloader
  document.body.appendChild(container)

  document.getElementById('squarelink-close-button').addEventListener('click', () => {
    popup.close()
  })
}

export default getPopup
