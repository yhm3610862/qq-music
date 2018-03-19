export function hasClass(el, className){
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}

export function addClass(el, className){
   if (hasClass(el,className)){
     return
   }

   let newClass = el.className.split(' ')
   newClass.push(className)
   el.className = newClass.join(' ')
}

export function getData(el, name, val) {
  //取元素自定义 属性 index-data
	const prefix = 'data-'
	name = prefix + name
	if(val){
		return el.setAttribute(name, val)
	}else{
    //返回 属性的值 index
		return el.getAttribute(name)
	}
}

let elementStyle = document.createElement('div').style

let vendor = ( () => {
  //css 兼容
  let transformNames = {
    O: 'OTransform',
    Moz: 'MozTransform',
    webkit: 'webkitTransform',
    ms: 'msTransform',
    standard: 'transform'
  }

  for (let key in transformNames) {
    //判断 兼容的 内核
    if (elementStyle[transformNames[key]] !== undefined) {
      return key
    }
  }
  return false
})()
export function prefixStyle (style) {
  // 异常出错
  if (vendor === false) {
    return false
  }
  // 普通无兼容
  if (vendor === 'standard') {
    return style
  }
  // 返回 一个拼接 字符串
  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
