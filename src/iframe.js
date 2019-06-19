import styles from './styles'

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
    iframe.style = styles.iframe
    container.appendChild(iframe)
    document.body.appendChild(container)
    window.addEventListener('message', function(e) {
      if (e.data.origin === 'squarelink') {
        window.removeEventListener('message', function() {})
        container.parentNode.removeChild(container)
        resolve({ ...e.data, origin: undefined })
      }
    }, false)
  })
}
