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
