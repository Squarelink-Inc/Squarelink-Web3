/**
 * Initializes a Squarelink iframe window
 */
export default (url) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    container.id = `squarelink-iframe-container`
    container.style = styles.container
    const iframe = document.createElement('iframe')
    iframe.src = url
    iframe.id = `squarelink-iframe`
    iframe.style = styles.iframe()
    container.appendChild(iframe)
    document.body.appendChild(container)
    var result = false
    window.addEventListener('message', function(e) {
      const { origin, type, height } = e.data
      if (origin === 'squarelink' && !result) {
        if (type === 'resize') {
          iframe.style = styles.iframe(`${height}px`)
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
  iframe: function (height='150px') {
    return `
      position: absolute;
      height: ${height};
      width: 350px;
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
      border: 3px solid #fff;
      z-index: 2147483647;
      box-shadow: 0 10px 30px 4px rgba(0,0,0,.33);
      background: white;
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
