
/**
 * 绑定事件
 *
 * @export
 * @param {any} dom
 * @param {any} eventType
 * @param {any} callback
 */
export function on (dom, eventType, callback) {
  if (document.addEventListener) {
    dom.addEventListener(eventType, callback)
  } else {
    dom.attachEvent('on' + eventType, callback)
  }
}

/**
* 解绑事件
*
* @export
* @param {any} dom
* @param {any} eventType
* @param {any} callback
*/
export function off (dom, eventType, callback) {
  if (document.addEventListener) {
    dom.removeEventListener(eventType, callback)
  } else {
    dom.detachEvent('on' + eventType, callback)
  }
}

/**
 * 节流函数生成器
 * 对于调用频繁的地方，可保障在设置时间内只执行1次。
 * 使用方法:
 *
 * const currentThrottle = generateThrottle() //生成一个节流函数
 * currentThrottle(Data.now()) //如果超过了阈值则返回true，否则返回false
 *
 * @param throttleTime 设置此生成器的阈值
 */
export const generateThrottle = function (throttleTime) {
  let time = Date.now()
  return function (now) {
    // 如果没有设置节流时间， 使用默认配置的时间 14毫秒
    if (now - time > (throttleTime || 14)) {
      time = now
      return true
    }
  }
}

/**
 * 防反跳。func函数在最后一次调用时刻的wait毫秒之后执行！
 * @param func 执行函数
 * @param wait 时间间隔
 * @param immediate 为true，debounce会在wai 时间间隔的开始调用这个函数
 * @returns {Function}
 */
export const debounce = function (func, wait, immediate) {
  var timeout, args, context, timestamp, result

  var later = function () {
    var last = new Date().getTime() - timestamp // timestamp会实时更新

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function () {
    context = this
    args = arguments
    timestamp = new Date().getTime()
    var callNow = immediate && !timeout

    if (!timeout) {
      timeout = setTimeout(later, wait)
    }
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }
    return result
  }
}
