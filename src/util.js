/**
 * 绑定事件
 *
 * @export
 * @param {any} dom
 * @param {any} eventType
 * @param {any} callback
 */
export function on(dom, eventType, callback){
  if(document.addEventListener){
      dom.addEventListener(eventType, callback);
  }else{
      dom.attachEvent('on' + eventType, callback);
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
export function off(dom, eventType, callback){
  if(document.addEventListener){
      dom.removeEventListener(eventType, callback);
  }else{
      dom.detachEvent('on' + eventType, callback);
  }
}
/**
* 节流函数
*
* @export
* @param {any} that
* @param {any} fn
*/
export function throttle(that, fn){
  fn.fnThrottle && clearTimeout(fn.fnThrottle);
  const args = [].slice.call(arguments, 2);
  fn.fnThrottle = setTimeout(function () {
      fn.apply(that, args);
  }, 200);
}
