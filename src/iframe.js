import { IFRAME_URL } from './config'

export default class Iframe {
  /**
   * @param {string} url
   */
  constructor(url, params) {
    this.url = url
    this.params = params
    this.open = true
    this._createIframe()
    this._addCloseListeners()
    this._addMessageListeners()
  }

  close() {
    if (!this.open) return
    this.container.parentNode.removeChild(this.container)
    if (this.onClosed) this.onClosed(this.error)
    this.open = false
  }

  _addCloseListeners() {
    this.container.addEventListener('click', () => { this.close() })
    var self = this
    document.onkeydown = (evt) => {
      evt = evt || window.event
      if (evt.keyCode == 27 && self.open) {
        self.close()
      }
    }
  }

  _addMessageListeners() {
    var self = this
    var paramsSent = false
    window.addEventListener('message', (e) => {
      const { origin, height, type, error } = e.data
      if (origin === 'squarelink-iframe') {
        if (type === 'resize') {
          self.iframe.style = styles.iframe(`${height}px`, 'none')
          return
        } else if (type === 'error') {
          self.error = error
          self.close()
        } else if (type === 'onload' && !paramsSent) {
          paramsSent = true
          this.iframe.contentWindow.postMessage({
            origin: 'squarelink-web3-sdk',
            params: this.params
          }, '*')
        }
      }
    }, false)
  }

  _createIframe() {
    /* INITIALIZE IFRAME CONTAINER */
    const container = document.createElement('div')
    container.id = `squarelink-iframe-container`
    container.style = styles.container

    /* INITIALIZE PRELOADER */
    const preloader = `<div class="squarelink-preloader" id="squarelink-preloader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
    container.innerHTML = preloader

    /* INITIALIZE IFRAME */
    const iframe = document.createElement('iframe')
    iframe.src = `${IFRAME_URL}/?url=${encodeURI(this.url)}`
    iframe.id = `squarelink-iframe`
    iframe.style = styles.iframe()
    iframe.onload = function() {
      const pl = document.getElementById('squarelink-preloader')
      pl.parentNode.removeChild(pl)
    }
    container.appendChild(iframe)
    this.iframe = iframe
    this.container = container

    /* LOAD IFRAME CONTAINER */
    document.body.appendChild(container)
  }
}

const styles = {
  iframe: function (height='200px', border=`3px solid #fff`) {
    return `
      position: absolute;
      height: ${height};
      width: 360px;
      top: 50%;
      left: 50%;
      transform:
      translate(-50%, -50%);
      border: 0px transparent;
      border-radius: 10px;
      -webkit-border-radius: 10px;
      -moz-border-radius: 10px;
      border-radius: 10px;
      -khtml-border-radius: 10px;
      border: ${border};
      z-index: 2147483647;
      box-shadow: 0 10px 30px 4px rgba(0,0,0,.33);
      background: none;
    `
  },
  container: `
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
}
