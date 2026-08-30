// Inspired by https://dashgo.com/

const content1 = document.querySelector('.content1')
const content2 = document.querySelector('.content2')
const content3 = document.querySelector('.content3')
const path1 = document.querySelector('.path2')
const path2 = document.querySelector('.path3')
const path3 = document.querySelector('.path4')
const path1Length = path1.getTotalLength()
const path2Length = path2.getTotalLength()
const path3Length = path3.getTotalLength()
path1.style.strokeDasharray  = path1Length
path1.style.strokeDashoffset = calcDashoffset(window.innerHeight * 0.8, content1, path1Length)

path2.style.strokeDasharray  = path2Length
path2.style.strokeDashoffset = path2Length

path3.style.strokeDasharray  = path3Length
path3.style.strokeDashoffset = path3Length

function calcDashoffset(scrollY, element, length) {
  const ratio = (scrollY - element.offsetTop) / element.offsetHeight
  const value = length - (length * ratio)
  return value < 0 ? 0 : value > length ? length : value
}

function scrollHandler() {
  const scrollY = window.scrollY + (window.innerHeight * 0.8)
  path1.style.strokeDashoffset = calcDashoffset(scrollY, content1, path1Length)
  path2.style.strokeDashoffset = calcDashoffset(scrollY, content2, path2Length)
  path3.style.strokeDashoffset = calcDashoffset(scrollY, content3, path3Length)
}

window.addEventListener('scroll', scrollHandler)