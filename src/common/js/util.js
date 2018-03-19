// 数组 打乱
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
export function shuffle(arr) {
  let arrCode = arr.slice()
  for (let i = 0; i < arrCode.length; i++) {
    let j = getRandomInt(0, i)
    let t = arrCode[i]
    arrCode[i] = arrCode[j]
    arrCode[j] = t
  }
  return arrCode
}

export function debounce(func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
