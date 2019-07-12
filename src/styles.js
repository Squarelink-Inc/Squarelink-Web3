export default `
.squarelink-close {
  position: absolute;
  right: 50px;
  top: 30px;
  width: 10px;
  height: 25px;
  opacity: 0.6;
  z-index: 100;
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
  height: 30px;
  width: 3px;
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
