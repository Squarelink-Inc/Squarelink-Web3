import Iframe from './iframe'

const POPUP_PARAMS = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=375,height=350,left=-500,top=150`

const getPopup = (url) => {
  var popup = window.open('', '_blank', POPUP_PARAMS)
  if(!popup || popup.closed || typeof popup.closed=='undefined')
    return Promise.resolve({ iframe: new Iframe(url) })
  // Check if popup is blocked on Chrome
  return _chromeCheck({ popup, url })
}

const _chromeCheck = ({ popup, url }) =>
  new Promise((resolve, reject) => {
    popup.onload = () => {
      setTimeout(() => {
        if (popup.screenY === 0 && popup.screenX === 0) {
          popup.close()
          resolve({ iframe: new Iframe(url) })
        } else {
          popup.location.href = url
          popup.focus()
          resolve({ popup })
        }
      }, 1)
    }
  })

export default getPopup
