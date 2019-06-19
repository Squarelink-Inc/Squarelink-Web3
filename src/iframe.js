/**
 * Initializes a Squarelink iframe window
 */
export default (url) => {
  return new Promise((resolve, reject) => {

    /* INITIALIZE IFRAME CONTAINER */
    const container = document.createElement('div')
    container.id = `squarelink-iframe-container`
    container.style = styles.container

    /* INITIALIZE HEADER STYLES */
    const style = document.createElement('style')
    style.innerHTML = headerStyles
    const head = document.head || document.getElementsByTagName('head')[0]
    head.appendChild(style)

    /* INITIALIZE PRELOADER AND CLOSE BUTTON */
    const preloader = `<div class="squarelink-preloader" id="squarelink-preloader"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>`
    const closeButton = `<div class="squarelink-close" id="squarelink-close-button"></div>`
    container.innerHTML = closeButton + preloader

    /* INITIALIZE IFRAME */
    const iframe = document.createElement('iframe')
    iframe.src = url
    iframe.id = `squarelink-iframe`
    iframe.style = styles.iframe()
    iframe.onload = function() {
      const pl = document.getElementById('squarelink-preloader')
      pl.parentNode.removeChild(pl)
    }
    container.appendChild(iframe)

    /* LOAD IFRAME CONTAINER */
    document.body.appendChild(container)

    var result = false
    /* INITIALIZE WINDOW CLOSE LISTENERS */
    var closeWindow = function() {
      result = true
      resolve({ error: 'Window closed' })
      container.parentNode.removeChild(container)
    }
    const close = document.getElementById('squarelink-close-button')
    close.addEventListener('click', closeWindow)
    container.addEventListener('click', closeWindow)
    document.onkeydown = function(evt) {
      evt = evt || window.event
      if (evt.keyCode == 27) {
        closeWindow()
      }
    }

    /* INITIALIZE IFRAME COMMUNICATION */
    window.addEventListener('message', function(e) {
      const { origin, type, height } = e.data
      if (origin === 'squarelink' && !result) {
        if (type === 'resize') {
          iframe.style = styles.iframe(`${height}px`, '0')
          return
        }
        result = true
        window.removeEventListener('message', function() {})
        container.parentNode.removeChild(container)
        resolve({
          ...e.data,
          origin: undefined,
          height: undefined,
          type: undefined
        })
      }
    }, false)
  })
}

const styles = {
  iframe: function (height='150px', border=`3px solid #fff`) {
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

const headerStyles = `
.squarelink-close {
  position: absolute;
  right: 32px;
  top: 32px;
  width: 32px;
  height: 32px;
  opacity: 0.6;
  z-index: 2147483649;
  cursor: pointer;
  -webkit-transition-duration:0.5s;
  transition-duration:0.5s;
}
.squarelink-close:hover {
  opacity: 1;
}
.squarelink-close:before, .squarelink-close:after {
  position: absolute;
  left: 15px;
  content: ' ';
  height: 33px;
  width: 2px;
  background-color: #fff;
}
.squarelink-close:before {
  transform: rotate(45deg);
}
.squarelink-close:after {
  transform: rotate(-45deg);
}


.squarelink-preloader {
  display: inline-block;
  position: absolute;
  width: 64px;
  height: 64px;
  z-index: 2147483649;
  top: 50%;
  left: 50%;
  transform:
  translate(-50%, -50%);
}
.squarelink-preloader div {
  position: absolute;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #fff;
  animation: squarelink-preloader 1.2s linear infinite;
}
.squarelink-preloader div:nth-child(1) {
  top: 6px;
  left: 6px;
  animation-delay: 0s;
}
.squarelink-preloader div:nth-child(2) {
  top: 6px;
  left: 26px;
  animation-delay: -0.4s;
}
.squarelink-preloader div:nth-child(3) {
  top: 6px;
  left: 45px;
  animation-delay: -0.8s;
}
.squarelink-preloader div:nth-child(4) {
  top: 26px;
  left: 6px;
  animation-delay: -0.4s;
}
.squarelink-preloader div:nth-child(5) {
  top: 26px;
  left: 26px;
  animation-delay: -0.8s;
}
.squarelink-preloader div:nth-child(6) {
  top: 26px;
  left: 45px;
  animation-delay: -1.2s;
}
.squarelink-preloader div:nth-child(7) {
  top: 45px;
  left: 6px;
  animation-delay: -0.8s;
}
.squarelink-preloader div:nth-child(8) {
  top: 45px;
  left: 26px;
  animation-delay: -1.2s;
}
.squarelink-preloader div:nth-child(9) {
  top: 45px;
  left: 45px;
  animation-delay: -1.6s;
}
@keyframes squarelink-preloader {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}`
