/*!
    name: vue-happy-scroll
    version: 2.1.1
    author: tangdaohai@outlook.com
    github: https://github.com/tangdaohai/vue-happy-scroll#readme
  */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
	typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
	(factory((global['happy-scroll'] = {}),global.Vue$));
}(this, (function (exports,Vue$) { 'use strict';

Vue$ = Vue$ && Vue$.hasOwnProperty('default') ? Vue$['default'] : Vue$;

/**
 * 绑定事件
 *
 * @export
 * @param {any} dom
 * @param {any} eventType
 * @param {any} callback
 */
function on(dom, eventType, callback) {
  if (document.addEventListener) {
    dom.addEventListener(eventType, callback);
  } else {
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
function off(dom, eventType, callback) {
  if (document.addEventListener) {
    dom.removeEventListener(eventType, callback);
  } else {
    dom.detachEvent('on' + eventType, callback);
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
var generateThrottle = function generateThrottle(throttleTime) {
  var time = Date.now();
  return function (now) {
    // 如果没有设置节流时间， 使用默认配置的时间 14毫秒
    if (now - time > (throttleTime || 14)) {
      time = now;
      return true;
    }
  };
};

/**
 * 防反跳。func函数在最后一次调用时刻的wait毫秒之后执行！
 * @param func 执行函数
 * @param wait 时间间隔
 * @param immediate 为true，debounce会在wai 时间间隔的开始调用这个函数
 * @returns {Function}
 */
var debounce = function debounce(func, wait, immediate) {
  var timeout, args, context, timestamp, result;

  var later = function later() {
    var last = new Date().getTime() - timestamp; // timestamp会实时更新

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function () {
    context = this;
    args = arguments;
    timestamp = new Date().getTime();
    var callNow = immediate && !timeout;

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }
    return result;
  };
};

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var HappyScrollStrip = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "stripContainer", staticClass: "happy-scroll-strip", class: [_vm.horizontal ? 'happy-scroll-strip--horizontal' : 'happy-scroll-strip--vertical'], style: [_vm.initLocation], on: { "!wheel": function wheel($event) {
          $event.stopPropagation();return _vm.handlerWheel($event);
        } } }, [_c('div', { ref: "strip", staticClass: "happy-scroll-bar", style: [_vm.translate, _defineProperty({}, _vm.config.sizeAttr, _vm.length + 'px'), _vm.initSize, { background: _vm.color }, { opacity: _vm.isOpacity }], on: { "mousedown": function mousedown($event) {
          $event.stopPropagation();return _vm.handlerMouseDown($event);
        } } })]);
  }, staticRenderFns: [],
  name: 'happy-scroll-strip',
  props: {
    // 是否作为横向
    horizontal: Boolean,
    // 使竖向滚动条在居左
    left: Boolean,
    // 使横向滚动条居右
    top: Boolean,
    move: {
      type: Number,
      default: 0
    },
    // 滚动条的宽(对于横向时为高度)
    size: {
      type: [Number, String],
      default: 4
    },
    // 竖向的 滚动条的最小长度，当滚动条长度随元素比例缩小到一定程度时不再缩小。
    minLengthV: {
      type: Number,
      default: 40
    },
    // 横向的 滚动条的最小长度，当滚动条长度随元素比例缩小到一定程度时不再缩小。
    minLengthH: {
      type: Number,
      default: 40
    },
    // 滚动条的背景色
    color: {
      type: String,
      default: 'rgba(51,51,51,0.2)'
    },
    // 鼠标移动的节流函数时间, 表示该时间内鼠标移动的回调保障在该时间内只执行一次
    throttle: {
      type: Number,
      default: 14 // 默认14毫秒
    }
  },
  data: function data() {
    return {
      config: {},
      // 标记鼠标按下后开始移动的状态. 鼠标按下为true 抬起为 false
      startMove: false,
      // 为document绑定事件, 此状态值为了避免重复绑定
      binded: false,
      // 滚动条的宽或者高
      length: 0,
      // 滚动条空白区域 与 (用户内容元素的高度 - 视图区域的高度) 的比例
      percentage: 0,
      // 滚动条最大的偏移量。这个值等于滚动条容器 减去 滚动条 的空白区域
      maxOffset: 0,
      // 记录当前的偏移量，用于触发 滚动到头部和尾部的事件
      currentOffset: 0,
      // 鼠标移动的节流函数
      moveThrottle: generateThrottle(this.throttle)
    };
  },

  watch: {
    currentOffset: function currentOffset(newVal) {
      if (newVal === 0) {
        // 触发事件
        this.emitLocationEvent('start', 0);
      } else if (newVal === this.maxOffset) {
        this.emitLocationEvent('end', newVal / this.percentage);
      }
    }
  },
  computed: {
    // 初始化滚动条的大小 (横向时为高度，竖向时为宽度)
    initSize: function initSize() {
      return _defineProperty({}, this.horizontal ? 'height' : 'width', this.size + 'px');
    },

    // 当 percentage 大于等于 1 时，说明不需要显示滚动条
    isOpacity: function isOpacity() {
      return this.percentage < 1 ? 1 : 0;
    },

    /**
     * 变化滚动条的位置，scroll主体内容，滚动时，滚动条跟着联动
     */
    translate: function translate() {
      var offset = this.move * this.percentage;

      if (!this.$refs.stripContainer) return;

      if (offset < 0) {
        offset = 0;
      }
      if (offset > this.maxOffset) {
        offset = this.maxOffset;
      }
      this.currentOffset = offset;
      return {
        transform: this.config.translate + '(' + offset + 'px)'
      };
    },

    // 初始化滚动条位置
    initLocation: function initLocation() {
      if (this.horizontal) {
        return this.top ? { top: 0, bottom: 'auto' } : '';
      }
      return this.left ? { left: 0, right: 'auto' } : '';
    }
  },
  methods: {
    // 触发滚动条滚动到顶部或底部的事件
    emitLocationEvent: function emitLocationEvent(type, outsideOffset) {
      var direction = this.horizontal ? 'horizontal' : 'vertical';
      this.$emit(direction + '-' + type, outsideOffset);
    },

    /**
     * scrollSize 如果是竖向滚动条，则为 用户内容元素的 scrollHeight, 横向的则作为 用户内容元素的 scrollWidth
     * clientSize 可视区域的 clientHeight clientWidth. 横竖的原理同scrollSize
     */
    computeStrip: function computeStrip(scrollSize, clientSize) {
      // const container = this.$refs.stripContainer // 滚动条的容器
      var currentSize = this.$refs.stripContainer[this.config.client];
      /**
       * 滚动条长度。
       *
       * clientSize / scrollSize 是表示视图范围与用户内容元素的比例
       * 用此比例来决定 滚动条的长度 滚动条容器 * 比例 = 滚动条长度
       * 但是当用户内容元素无限大的时候，可能会导致滚动条无限小，所以会设置最小长度
       */
      this.length = currentSize * (clientSize / scrollSize);
      var minLength = this.horizontal ? this.minLengthH : this.minLengthV;
      if (minLength < 1) {
        // 按百分比处理
        minLength = currentSize * minLength;
      }
      // 判断是否滚动条长度是否已经小于了设置的最小长度
      this.length = this.length < minLength ? minLength : this.length;
      // 滚动条容器 - 滚动条长度 = 剩余的空间
      var space = this.maxOffset = currentSize - this.length;
      /**
       * 这里计算一个比例
       * 已高度举例子:
       * 使用 剩余空间 除以 (用户内容元素的高度 - 视图区域的高度)
       * 可以把 视图区域的高度 比作 滚动条的长度 用户内容元素的高度 比作 滚动条容器的高度
       * 所以使用两者剩余空间的比例，来计算 当滚动条滑动1px的时候 用户内容元素应该滑动多少 px，当用户内容元素移动时 来计算 滚动条应该移动多少px
       */
      this.percentage = space / (scrollSize - clientSize);
    },
    bindEvents: function bindEvents() {
      // 已绑定过了 不再重复绑定
      if (this.binded) return;
      on(document, 'mouseup', this.handlerMouseUp);
      on(document, 'mousemove', this.handlerMove);
      this.binded = true;
    },

    // 鼠标按下事件
    handlerMouseDown: function handlerMouseDown(event) {
      // 只有鼠标左键可以拖动
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      // 标记开始拖拽滚动条
      this.startMove = true;
      // 记录鼠标起始的位置
      this.axis = event[this.config.clientAxis];

      // 给document绑定 mouseup与mousemove
      this.bindEvents();

      return false;
    },
    handlerMouseUp: function handlerMouseUp() {
      // 鼠标抬起, 结束拖拽状态
      this.startMove = false;
    },
    handlerMove: function handlerMove(event) {
      // 如果不是在鼠标按下的状态 || 节流控制，在指定时间内只执行一次
      if (!this.startMove || !this.moveThrottle(Date.now())) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      var parentRect = this.$refs.stripContainer.getBoundingClientRect();
      var rect = this.$refs.strip.getBoundingClientRect();
      // 相对于滚动条容器的offset
      var contrastParentOffset = rect[this.config.direction] - parentRect[this.config.direction];
      /**
       * offset = 鼠标移动的偏移量 + 滚动条当前的偏移量
       * offset为滚动条需要移动到的位置
       * event[this.config.clientAxis] - this.axis = 鼠标移动后与移动前的偏移量
       */
      var offset = event[this.config.clientAxis] - this.axis + contrastParentOffset;
      // 更新鼠标偏移量的值
      this.axis = event[this.config.clientAxis];

      this.changeOffset(offset);
    },

    // 鼠标滚轮滚动事件
    handlerWheel: function handlerWheel(event) {
      var parentRect = this.$refs.stripContainer.getBoundingClientRect();
      var rect = this.$refs.strip.getBoundingClientRect();
      // 滚动条相对于容器的offset
      var contrastParentOffset = rect[this.config.direction] - parentRect[this.config.direction];
      // 滚动条最终要设置的偏移量    event[this.config.wheelDelta] => 获取鼠标滚轮的滚动值
      var offset = contrastParentOffset + event[this.config.wheelDelta];

      this.changeOffset(offset, event);
    },
    changeOffset: function changeOffset(offset, event) {
      // 防止滚动条越界
      if (offset < 0) {
        offset = 0;
      }

      // 防止滚动条越界
      if (offset > this.maxOffset) {
        offset = this.maxOffset;
      }

      if (event && offset > 0 && offset < this.maxOffset) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      this.currentOffset = offset;
      // 偏移
      this.$refs.strip.style.transform = this.config.translate + '(' + offset + 'px)';

      // 告诉scroll.vue 滚动条移动的偏移量
      this.$emit('change', offset / this.percentage);
    }
  },
  created: function created() {
    var configs = {
      // 水平的属性配置
      h: {
        sizeAttr: 'width',
        client: 'clientWidth',
        clientAxis: 'clientX',
        translate: 'translateX',
        direction: 'left',
        wheelDelta: 'deltaX'
      },
      // 垂直的属性配置
      v: {
        sizeAttr: 'height', // 滚动条的高度
        client: 'clientHeight', // 滚动条容器的可视高度
        clientAxis: 'clientY', // 拖动滚动条时，鼠标移动的Y轴坐标值
        translate: 'translateY', // 上下移动滚动条的位置
        direction: 'top', // 滚动条容器的top值, 会与 clientY 发生计算
        wheelDelta: 'deltaY' // 在滚动条容器中滚动 鼠标滚轮 时， 滚动量的值
      }

      // 根据方向初始化对应的属性配置
    };this.config = this.horizontal ? configs['h'] : configs['v'];
  },
  destroyed: function destroyed() {
    off(document, 'mouseup', this.handlerClickUp);
    off(document, 'mousemove', this.handlerMove);
  }
};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var collectionUtils = createCommonjsModule(function (module) {
"use strict";

var utils = module.exports = {};

/**
 * Loops through the collection and calls the callback for each element. if the callback returns truthy, the loop is broken and returns the same value.
 * @public
 * @param {*} collection The collection to loop through. Needs to have a length property set and have indices set from 0 to length - 1.
 * @param {function} callback The callback to be called for each element. The element will be given as a parameter to the callback. If this callback returns truthy, the loop is broken and the same value is returned.
 * @returns {*} The value that a callback has returned (if truthy). Otherwise nothing.
 */
utils.forEach = function(collection, callback) {
    for(var i = 0; i < collection.length; i++) {
        var result = callback(collection[i]);
        if(result) {
            return result;
        }
    }
};
});

"use strict";

var elementUtils = function(options) {
    var getState = options.stateHandler.getState;

    /**
     * Tells if the element has been made detectable and ready to be listened for resize events.
     * @public
     * @param {element} The element to check.
     * @returns {boolean} True or false depending on if the element is detectable or not.
     */
    function isDetectable(element) {
        var state = getState(element);
        return state && !!state.isDetectable;
    }

    /**
     * Marks the element that it has been made detectable and ready to be listened for resize events.
     * @public
     * @param {element} The element to mark.
     */
    function markAsDetectable(element) {
        getState(element).isDetectable = true;
    }

    /**
     * Tells if the element is busy or not.
     * @public
     * @param {element} The element to check.
     * @returns {boolean} True or false depending on if the element is busy or not.
     */
    function isBusy(element) {
        return !!getState(element).busy;
    }

    /**
     * Marks the object is busy and should not be made detectable.
     * @public
     * @param {element} element The element to mark.
     * @param {boolean} busy If the element is busy or not.
     */
    function markBusy(element, busy) {
        getState(element).busy = !!busy;
    }

    return {
        isDetectable: isDetectable,
        markAsDetectable: markAsDetectable,
        isBusy: isBusy,
        markBusy: markBusy
    };
};

"use strict";

var listenerHandler = function(idHandler) {
    var eventListeners = {};

    /**
     * Gets all listeners for the given element.
     * @public
     * @param {element} element The element to get all listeners for.
     * @returns All listeners for the given element.
     */
    function getListeners(element) {
        var id = idHandler.get(element);

        if (id === undefined) {
            return [];
        }

        return eventListeners[id] || [];
    }

    /**
     * Stores the given listener for the given element. Will not actually add the listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The callback that the element has added.
     */
    function addListener(element, listener) {
        var id = idHandler.get(element);

        if(!eventListeners[id]) {
            eventListeners[id] = [];
        }

        eventListeners[id].push(listener);
    }

    function removeListener(element, listener) {
        var listeners = getListeners(element);
        for (var i = 0, len = listeners.length; i < len; ++i) {
            if (listeners[i] === listener) {
              listeners.splice(i, 1);
              break;
            }
        }
    }

    function removeAllListeners(element) {
      var listeners = getListeners(element);
      if (!listeners) { return; }
      listeners.length = 0;
    }

    return {
        get: getListeners,
        add: addListener,
        removeListener: removeListener,
        removeAllListeners: removeAllListeners
    };
};

"use strict";

var idGenerator = function() {
    var idCount = 1;

    /**
     * Generates a new unique id in the context.
     * @public
     * @returns {number} A unique id in the context.
     */
    function generate() {
        return idCount++;
    }

    return {
        generate: generate
    };
};

"use strict";

var idHandler = function(options) {
    var idGenerator     = options.idGenerator;
    var getState        = options.stateHandler.getState;

    /**
     * Gets the resize detector id of the element.
     * @public
     * @param {element} element The target element to get the id of.
     * @returns {string|number|null} The id of the element. Null if it has no id.
     */
    function getId(element) {
        var state = getState(element);

        if (state && state.id !== undefined) {
            return state.id;
        }

        return null;
    }

    /**
     * Sets the resize detector id of the element. Requires the element to have a resize detector state initialized.
     * @public
     * @param {element} element The target element to set the id of.
     * @returns {string|number|null} The id of the element.
     */
    function setId(element) {
        var state = getState(element);

        if (!state) {
            throw new Error("setId required the element to have a resize detection state.");
        }

        var id = idGenerator.generate();

        state.id = id;

        return id;
    }

    return {
        get: getId,
        set: setId
    };
};

"use strict";

/* global console: false */

/**
 * Reporter that handles the reporting of logs, warnings and errors.
 * @public
 * @param {boolean} quiet Tells if the reporter should be quiet or not.
 */
var reporter = function(quiet) {
    function noop() {
        //Does nothing.
    }

    var reporter = {
        log: noop,
        warn: noop,
        error: noop
    };

    if(!quiet && window.console) {
        var attachFunction = function(reporter, name) {
            //The proxy is needed to be able to call the method with the console context,
            //since we cannot use bind.
            reporter[name] = function reporterProxy() {
                var f = console[name];
                if (f.apply) { //IE9 does not support console.log.apply :)
                    f.apply(console, arguments);
                } else {
                    for (var i = 0; i < arguments.length; i++) {
                        f(arguments[i]);
                    }
                }
            };
        };

        attachFunction(reporter, "log");
        attachFunction(reporter, "warn");
        attachFunction(reporter, "error");
    }

    return reporter;
};

var browserDetector = createCommonjsModule(function (module) {
"use strict";

var detector = module.exports = {};

detector.isIE = function(version) {
    function isAnyIeVersion() {
        var agent = navigator.userAgent.toLowerCase();
        return agent.indexOf("msie") !== -1 || agent.indexOf("trident") !== -1 || agent.indexOf(" edge/") !== -1;
    }

    if(!isAnyIeVersion()) {
        return false;
    }

    if(!version) {
        return true;
    }

    //Shamelessly stolen from https://gist.github.com/padolsey/527683
    var ieVersion = (function(){
        var undef,
            v = 3,
            div = document.createElement("div"),
            all = div.getElementsByTagName("i");

        do {
            div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->";
        }
        while (all[0]);

        return v > 4 ? v : undef;
    }());

    return version === ieVersion;
};

detector.isLegacyOpera = function() {
    return !!window.opera;
};
});

var utils_1 = createCommonjsModule(function (module) {
"use strict";

var utils = module.exports = {};

utils.getOption = getOption;

function getOption(options, name, defaultValue) {
    var value = options[name];

    if((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
    }

    return value;
}
});

"use strict";



var batchProcessor = function batchProcessorMaker(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var asyncProcess    = utils_1.getOption(options, "async", true);
    var autoProcess     = utils_1.getOption(options, "auto", true);

    if(autoProcess && !asyncProcess) {
        reporter && reporter.warn("Invalid options combination. auto=true and async=false is invalid. Setting async=true.");
        asyncProcess = true;
    }

    var batch = Batch();
    var asyncFrameHandler;
    var isProcessing = false;

    function addFunction(level, fn) {
        if(!isProcessing && autoProcess && asyncProcess && batch.size() === 0) {
            // Since this is async, it is guaranteed to be executed after that the fn is added to the batch.
            // This needs to be done before, since we're checking the size of the batch to be 0.
            processBatchAsync();
        }

        batch.add(level, fn);
    }

    function processBatch() {
        // Save the current batch, and create a new batch so that incoming functions are not added into the currently processing batch.
        // Continue processing until the top-level batch is empty (functions may be added to the new batch while processing, and so on).
        isProcessing = true;
        while (batch.size()) {
            var processingBatch = batch;
            batch = Batch();
            processingBatch.process();
        }
        isProcessing = false;
    }

    function forceProcessBatch(localAsyncProcess) {
        if (isProcessing) {
            return;
        }

        if(localAsyncProcess === undefined) {
            localAsyncProcess = asyncProcess;
        }

        if(asyncFrameHandler) {
            cancelFrame(asyncFrameHandler);
            asyncFrameHandler = null;
        }

        if(localAsyncProcess) {
            processBatchAsync();
        } else {
            processBatch();
        }
    }

    function processBatchAsync() {
        asyncFrameHandler = requestFrame(processBatch);
    }

    function cancelFrame(listener) {
        // var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.clearTimeout;
        var cancel = clearTimeout;
        return cancel(listener);
    }

    function requestFrame(callback) {
        // var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) { return window.setTimeout(fn, 20); };
        var raf = function(fn) { return setTimeout(fn, 0); };
        return raf(callback);
    }

    return {
        add: addFunction,
        force: forceProcessBatch
    };
};

function Batch() {
    var batch       = {};
    var size        = 0;
    var topLevel    = 0;
    var bottomLevel = 0;

    function add(level, fn) {
        if(!fn) {
            fn = level;
            level = 0;
        }

        if(level > topLevel) {
            topLevel = level;
        } else if(level < bottomLevel) {
            bottomLevel = level;
        }

        if(!batch[level]) {
            batch[level] = [];
        }

        batch[level].push(fn);
        size++;
    }

    function process() {
        for(var level = bottomLevel; level <= topLevel; level++) {
            var fns = batch[level];

            for(var i = 0; i < fns.length; i++) {
                var fn = fns[i];
                fn();
            }
        }
    }

    function getSize() {
        return size;
    }

    return {
        add: add,
        process: process,
        size: getSize
    };
}

"use strict";

var prop = "_erd";

function initState(element) {
    element[prop] = {};
    return getState(element);
}

function getState(element) {
    return element[prop];
}

function cleanState(element) {
    delete element[prop];
}

var stateHandler = {
    initState: initState,
    getState: getState,
    cleanState: cleanState
};

/**
 * Resize detection strategy that injects objects to elements in order to detect resize events.
 * Heavily inspired by: http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 */

"use strict";



var object = function(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var batchProcessor  = options.batchProcessor;
    var getState        = options.stateHandler.getState;

    if(!reporter) {
        throw new Error("Missing required dependency: reporter.");
    }

    /**
     * Adds a resize event listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
     */
    function addListener(element, listener) {
        if(!getObject(element)) {
            throw new Error("Element is not detectable by this strategy.");
        }

        function listenerProxy() {
            listener(element);
        }

        if(browserDetector.isIE(8)) {
            //IE 8 does not support object, but supports the resize event directly on elements.
            getState(element).object = {
                proxy: listenerProxy
            };
            element.attachEvent("onresize", listenerProxy);
        } else {
            var object = getObject(element);
            object.contentDocument.defaultView.addEventListener("resize", listenerProxy);
        }
    }

    /**
     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
     * @private
     * @param {object} options Optional options object.
     * @param {element} element The element to make detectable
     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
     */
    function makeDetectable(options, element, callback) {
        if (!callback) {
            callback = element;
            element = options;
            options = null;
        }

        options = options || {};
        function injectObject(element, callback) {
            var OBJECT_STYLE = "display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; padding: 0; margin: 0; opacity: 0; z-index: -1000; pointer-events: none;";

            //The target element needs to be positioned (everything except static) so the absolute positioned object will be positioned relative to the target element.

            // Position altering may be performed directly or on object load, depending on if style resolution is possible directly or not.
            var positionCheckPerformed = false;

            // The element may not yet be attached to the DOM, and therefore the style object may be empty in some browsers.
            // Since the style object is a reference, it will be updated as soon as the element is attached to the DOM.
            var style = window.getComputedStyle(element);
            var width = element.offsetWidth;
            var height = element.offsetHeight;

            getState(element).startSize = {
                width: width,
                height: height
            };

            function mutateDom() {
                function alterPositionStyles() {
                    if(style.position === "static") {
                        element.style.position = "relative";

                        var removeRelativeStyles = function(reporter, element, style, property) {
                            function getNumericalValue(value) {
                                return value.replace(/[^-\d\.]/g, "");
                            }

                            var value = style[property];

                            if(value !== "auto" && getNumericalValue(value) !== "0") {
                                reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                                element.style[property] = 0;
                            }
                        };

                        //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                        //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                        removeRelativeStyles(reporter, element, style, "top");
                        removeRelativeStyles(reporter, element, style, "right");
                        removeRelativeStyles(reporter, element, style, "bottom");
                        removeRelativeStyles(reporter, element, style, "left");
                    }
                }

                function onObjectLoad() {
                    // The object has been loaded, which means that the element now is guaranteed to be attached to the DOM.
                    if (!positionCheckPerformed) {
                        alterPositionStyles();
                    }

                    /*jshint validthis: true */

                    function getDocument(element, callback) {
                        //Opera 12 seem to call the object.onload before the actual document has been created.
                        //So if it is not present, poll it with an timeout until it is present.
                        //TODO: Could maybe be handled better with object.onreadystatechange or similar.
                        if(!element.contentDocument) {
                            setTimeout(function checkForObjectDocument() {
                                getDocument(element, callback);
                            }, 100);

                            return;
                        }

                        callback(element.contentDocument);
                    }

                    //Mutating the object element here seems to fire another load event.
                    //Mutating the inner document of the object element is fine though.
                    var objectElement = this;

                    //Create the style element to be added to the object.
                    getDocument(objectElement, function onObjectDocumentReady(objectDocument) {
                        //Notify that the element is ready to be listened to.
                        callback(element);
                    });
                }

                // The element may be detached from the DOM, and some browsers does not support style resolving of detached elements.
                // The alterPositionStyles needs to be delayed until we know the element has been attached to the DOM (which we are sure of when the onObjectLoad has been fired), if style resolution is not possible.
                if (style.position !== "") {
                    alterPositionStyles(style);
                    positionCheckPerformed = true;
                }

                //Add an object element as a child to the target element that will be listened to for resize events.
                var object = document.createElement("object");
                object.style.cssText = OBJECT_STYLE;
                object.tabIndex = -1;
                object.type = "text/html";
                object.onload = onObjectLoad;

                //Safari: This must occur before adding the object to the DOM.
                //IE: Does not like that this happens before, even if it is also added after.
                if(!browserDetector.isIE()) {
                    object.data = "about:blank";
                }

                element.appendChild(object);
                getState(element).object = object;

                //IE: This must occur after adding the object to the DOM.
                if(browserDetector.isIE()) {
                    object.data = "about:blank";
                }
            }

            if(batchProcessor) {
                batchProcessor.add(mutateDom);
            } else {
                mutateDom();
            }
        }

        if(browserDetector.isIE(8)) {
            //IE 8 does not support objects properly. Luckily they do support the resize event.
            //So do not inject the object and notify that the element is already ready to be listened to.
            //The event handler for the resize event is attached in the utils.addListener instead.
            callback(element);
        } else {
            injectObject(element, callback);
        }
    }

    /**
     * Returns the child object of the target element.
     * @private
     * @param {element} element The target element.
     * @returns The object element of the target.
     */
    function getObject(element) {
        return getState(element).object;
    }

    function uninstall(element) {
        if(browserDetector.isIE(8)) {
            element.detachEvent("onresize", getState(element).object.proxy);
        } else {
            element.removeChild(getObject(element));
        }
        delete getState(element).object;
    }

    return {
        makeDetectable: makeDetectable,
        addListener: addListener,
        uninstall: uninstall
    };
};

/**
 * Resize detection strategy that injects divs to elements in order to detect resize events on scroll events.
 * Heavily inspired by: https://github.com/marcj/css-element-queries/blob/master/src/ResizeSensor.js
 */

"use strict";

var forEach$1 = collectionUtils.forEach;

var scroll = function(options) {
    options             = options || {};
    var reporter        = options.reporter;
    var batchProcessor  = options.batchProcessor;
    var getState        = options.stateHandler.getState;
    var idHandler       = options.idHandler;

    if (!batchProcessor) {
        throw new Error("Missing required dependency: batchProcessor");
    }

    if (!reporter) {
        throw new Error("Missing required dependency: reporter.");
    }

    //TODO: Could this perhaps be done at installation time?
    var scrollbarSizes = getScrollbarSizes();

    // Inject the scrollbar styling that prevents them from appearing sometimes in Chrome.
    // The injected container needs to have a class, so that it may be styled with CSS (pseudo elements).
    var styleId = "erd_scroll_detection_scrollbar_style";
    var detectionContainerClass = "erd_scroll_detection_container";
    injectScrollStyle(styleId, detectionContainerClass);

    function getScrollbarSizes() {
        var width = 500;
        var height = 500;

        var child = document.createElement("div");
        child.style.cssText = "position: absolute; width: " + width*2 + "px; height: " + height*2 + "px; visibility: hidden; margin: 0; padding: 0;";

        var container = document.createElement("div");
        container.style.cssText = "position: absolute; width: " + width + "px; height: " + height + "px; overflow: scroll; visibility: none; top: " + -width*3 + "px; left: " + -height*3 + "px; visibility: hidden; margin: 0; padding: 0;";

        container.appendChild(child);

        document.body.insertBefore(container, document.body.firstChild);

        var widthSize = width - container.clientWidth;
        var heightSize = height - container.clientHeight;

        document.body.removeChild(container);

        return {
            width: widthSize,
            height: heightSize
        };
    }

    function injectScrollStyle(styleId, containerClass) {
        function injectStyle(style, method) {
            method = method || function (element) {
                document.head.appendChild(element);
            };

            var styleElement = document.createElement("style");
            styleElement.innerHTML = style;
            styleElement.id = styleId;
            method(styleElement);
            return styleElement;
        }

        if (!document.getElementById(styleId)) {
            var containerAnimationClass = containerClass + "_animation";
            var containerAnimationActiveClass = containerClass + "_animation_active";
            var style = "/* Created by the element-resize-detector library. */\n";
            style += "." + containerClass + " > div::-webkit-scrollbar { display: none; }\n\n";
            style += "." + containerAnimationActiveClass + " { -webkit-animation-duration: 0.1s; animation-duration: 0.1s; -webkit-animation-name: " + containerAnimationClass + "; animation-name: " + containerAnimationClass + "; }\n";
            style += "@-webkit-keyframes " + containerAnimationClass +  " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }\n";
            style += "@keyframes " + containerAnimationClass +          " { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }";
            injectStyle(style);
        }
    }

    function addAnimationClass(element) {
        element.className += " " + detectionContainerClass + "_animation_active";
    }

    function addEvent(el, name, cb) {
        if (el.addEventListener) {
            el.addEventListener(name, cb);
        } else if(el.attachEvent) {
            el.attachEvent("on" + name, cb);
        } else {
            return reporter.error("[scroll] Don't know how to add event listeners.");
        }
    }

    function removeEvent(el, name, cb) {
        if (el.removeEventListener) {
            el.removeEventListener(name, cb);
        } else if(el.detachEvent) {
            el.detachEvent("on" + name, cb);
        } else {
            return reporter.error("[scroll] Don't know how to remove event listeners.");
        }
    }

    function getExpandElement(element) {
        return getState(element).container.childNodes[0].childNodes[0].childNodes[0];
    }

    function getShrinkElement(element) {
        return getState(element).container.childNodes[0].childNodes[0].childNodes[1];
    }

    /**
     * Adds a resize event listener to the element.
     * @public
     * @param {element} element The element that should have the listener added.
     * @param {function} listener The listener callback to be called for each resize event of the element. The element will be given as a parameter to the listener callback.
     */
    function addListener(element, listener) {
        var listeners = getState(element).listeners;

        if (!listeners.push) {
            throw new Error("Cannot add listener to an element that is not detectable.");
        }

        getState(element).listeners.push(listener);
    }

    /**
     * Makes an element detectable and ready to be listened for resize events. Will call the callback when the element is ready to be listened for resize changes.
     * @private
     * @param {object} options Optional options object.
     * @param {element} element The element to make detectable
     * @param {function} callback The callback to be called when the element is ready to be listened for resize changes. Will be called with the element as first parameter.
     */
    function makeDetectable(options, element, callback) {
        if (!callback) {
            callback = element;
            element = options;
            options = null;
        }

        options = options || {};

        function debug() {
            if (options.debug) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift(idHandler.get(element), "Scroll: ");
                if (reporter.log.apply) {
                    reporter.log.apply(null, args);
                } else {
                    for (var i = 0; i < args.length; i++) {
                        reporter.log(args[i]);
                    }
                }
            }
        }

        function isDetached(element) {
            function isInDocument(element) {
                return element === element.ownerDocument.body || element.ownerDocument.body.contains(element);
            }

            if (!isInDocument(element)) {
                return true;
            }

            // FireFox returns null style in hidden iframes. See https://github.com/wnr/element-resize-detector/issues/68 and https://bugzilla.mozilla.org/show_bug.cgi?id=795520
            if (getComputedStyle(element) === null) {
                return true;
            }

            return false;
        }

        function isUnrendered(element) {
            // Check the absolute positioned container since the top level container is display: inline.
            var container = getState(element).container.childNodes[0];
            var style = getComputedStyle(container);
            return !style.width || style.width.indexOf("px") === -1; //Can only compute pixel value when rendered.
        }

        function getStyle() {
            // Some browsers only force layouts when actually reading the style properties of the style object, so make sure that they are all read here,
            // so that the user of the function can be sure that it will perform the layout here, instead of later (important for batching).
            var elementStyle            = getComputedStyle(element);
            var style                   = {};
            style.position              = elementStyle.position;
            style.width                 = element.offsetWidth;
            style.height                = element.offsetHeight;
            style.top                   = elementStyle.top;
            style.right                 = elementStyle.right;
            style.bottom                = elementStyle.bottom;
            style.left                  = elementStyle.left;
            style.widthCSS              = elementStyle.width;
            style.heightCSS             = elementStyle.height;
            return style;
        }

        function storeStartSize() {
            var style = getStyle();
            getState(element).startSize = {
                width: style.width,
                height: style.height
            };
            debug("Element start size", getState(element).startSize);
        }

        function initListeners() {
            getState(element).listeners = [];
        }

        function storeStyle() {
            debug("storeStyle invoked.");
            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            var style = getStyle();
            getState(element).style = style;
        }

        function storeCurrentSize(element, width, height) {
            getState(element).lastWidth = width;
            getState(element).lastHeight  = height;
        }

        function getExpandChildElement(element) {
            return getExpandElement(element).childNodes[0];
        }

        function getWidthOffset() {
            return 2 * scrollbarSizes.width + 1;
        }

        function getHeightOffset() {
            return 2 * scrollbarSizes.height + 1;
        }

        function getExpandWidth(width) {
            return width + 10 + getWidthOffset();
        }

        function getExpandHeight(height) {
            return height + 10 + getHeightOffset();
        }

        function getShrinkWidth(width) {
            return width * 2 + getWidthOffset();
        }

        function getShrinkHeight(height) {
            return height * 2 + getHeightOffset();
        }

        function positionScrollbars(element, width, height) {
            var expand          = getExpandElement(element);
            var shrink          = getShrinkElement(element);
            var expandWidth     = getExpandWidth(width);
            var expandHeight    = getExpandHeight(height);
            var shrinkWidth     = getShrinkWidth(width);
            var shrinkHeight    = getShrinkHeight(height);
            expand.scrollLeft   = expandWidth;
            expand.scrollTop    = expandHeight;
            shrink.scrollLeft   = shrinkWidth;
            shrink.scrollTop    = shrinkHeight;
        }

        function injectContainerElement() {
            var container = getState(element).container;

            if (!container) {
                container                   = document.createElement("div");
                container.className         = detectionContainerClass;
                container.style.cssText     = "visibility: hidden; display: inline; width: 0px; height: 0px; z-index: -1; overflow: hidden; margin: 0; padding: 0;";
                getState(element).container = container;
                addAnimationClass(container);
                element.appendChild(container);

                var onAnimationStart = function () {
                    getState(element).onRendered && getState(element).onRendered();
                };

                addEvent(container, "animationstart", onAnimationStart);

                // Store the event handler here so that they may be removed when uninstall is called.
                // See uninstall function for an explanation why it is needed.
                getState(element).onAnimationStart = onAnimationStart;
            }

            return container;
        }

        function injectScrollElements() {
            function alterPositionStyles() {
                var style = getState(element).style;

                if(style.position === "static") {
                    element.style.position = "relative";

                    var removeRelativeStyles = function(reporter, element, style, property) {
                        function getNumericalValue(value) {
                            return value.replace(/[^-\d\.]/g, "");
                        }

                        var value = style[property];

                        if(value !== "auto" && getNumericalValue(value) !== "0") {
                            reporter.warn("An element that is positioned static has style." + property + "=" + value + " which is ignored due to the static positioning. The element will need to be positioned relative, so the style." + property + " will be set to 0. Element: ", element);
                            element.style[property] = 0;
                        }
                    };

                    //Check so that there are no accidental styles that will make the element styled differently now that is is relative.
                    //If there are any, set them to 0 (this should be okay with the user since the style properties did nothing before [since the element was positioned static] anyway).
                    removeRelativeStyles(reporter, element, style, "top");
                    removeRelativeStyles(reporter, element, style, "right");
                    removeRelativeStyles(reporter, element, style, "bottom");
                    removeRelativeStyles(reporter, element, style, "left");
                }
            }

            function getLeftTopBottomRightCssText(left, top, bottom, right) {
                left = (!left ? "0" : (left + "px"));
                top = (!top ? "0" : (top + "px"));
                bottom = (!bottom ? "0" : (bottom + "px"));
                right = (!right ? "0" : (right + "px"));

                return "left: " + left + "; top: " + top + "; right: " + right + "; bottom: " + bottom + ";";
            }

            debug("Injecting elements");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            alterPositionStyles();

            var rootContainer = getState(element).container;

            if (!rootContainer) {
                rootContainer = injectContainerElement();
            }

            // Due to this WebKit bug https://bugs.webkit.org/show_bug.cgi?id=80808 (currently fixed in Blink, but still present in WebKit browsers such as Safari),
            // we need to inject two containers, one that is width/height 100% and another that is left/top -1px so that the final container always is 1x1 pixels bigger than
            // the targeted element.
            // When the bug is resolved, "containerContainer" may be removed.

            // The outer container can occasionally be less wide than the targeted when inside inline elements element in WebKit (see https://bugs.webkit.org/show_bug.cgi?id=152980).
            // This should be no problem since the inner container either way makes sure the injected scroll elements are at least 1x1 px.

            var scrollbarWidth          = scrollbarSizes.width;
            var scrollbarHeight         = scrollbarSizes.height;
            var containerContainerStyle = "position: absolute; flex: none; overflow: hidden; z-index: -1; visibility: hidden; width: 100%; height: 100%; left: 0px; top: 0px;";
            var containerStyle          = "position: absolute; flex: none; overflow: hidden; z-index: -1; visibility: hidden; " + getLeftTopBottomRightCssText(-(1 + scrollbarWidth), -(1 + scrollbarHeight), -scrollbarHeight, -scrollbarWidth);
            var expandStyle             = "position: absolute; flex: none; overflow: scroll; z-index: -1; visibility: hidden; width: 100%; height: 100%;";
            var shrinkStyle             = "position: absolute; flex: none; overflow: scroll; z-index: -1; visibility: hidden; width: 100%; height: 100%;";
            var expandChildStyle        = "position: absolute; left: 0; top: 0;";
            var shrinkChildStyle        = "position: absolute; width: 200%; height: 200%;";

            var containerContainer      = document.createElement("div");
            var container               = document.createElement("div");
            var expand                  = document.createElement("div");
            var expandChild             = document.createElement("div");
            var shrink                  = document.createElement("div");
            var shrinkChild             = document.createElement("div");

            // Some browsers choke on the resize system being rtl, so force it to ltr. https://github.com/wnr/element-resize-detector/issues/56
            // However, dir should not be set on the top level container as it alters the dimensions of the target element in some browsers.
            containerContainer.dir              = "ltr";

            containerContainer.style.cssText    = containerContainerStyle;
            containerContainer.className        = detectionContainerClass;
            container.className                 = detectionContainerClass;
            container.style.cssText             = containerStyle;
            expand.style.cssText                = expandStyle;
            expandChild.style.cssText           = expandChildStyle;
            shrink.style.cssText                = shrinkStyle;
            shrinkChild.style.cssText           = shrinkChildStyle;

            expand.appendChild(expandChild);
            shrink.appendChild(shrinkChild);
            container.appendChild(expand);
            container.appendChild(shrink);
            containerContainer.appendChild(container);
            rootContainer.appendChild(containerContainer);

            function onExpandScroll() {
                getState(element).onExpand && getState(element).onExpand();
            }

            function onShrinkScroll() {
                getState(element).onShrink && getState(element).onShrink();
            }

            addEvent(expand, "scroll", onExpandScroll);
            addEvent(shrink, "scroll", onShrinkScroll);

            // Store the event handlers here so that they may be removed when uninstall is called.
            // See uninstall function for an explanation why it is needed.
            getState(element).onExpandScroll = onExpandScroll;
            getState(element).onShrinkScroll = onShrinkScroll;
        }

        function registerListenersAndPositionElements() {
            function updateChildSizes(element, width, height) {
                var expandChild             = getExpandChildElement(element);
                var expandWidth             = getExpandWidth(width);
                var expandHeight            = getExpandHeight(height);
                expandChild.style.width     = expandWidth + "px";
                expandChild.style.height    = expandHeight + "px";
            }

            function updateDetectorElements(done) {
                var width           = element.offsetWidth;
                var height          = element.offsetHeight;

                debug("Storing current size", width, height);

                // Store the size of the element sync here, so that multiple scroll events may be ignored in the event listeners.
                // Otherwise the if-check in handleScroll is useless.
                storeCurrentSize(element, width, height);

                // Since we delay the processing of the batch, there is a risk that uninstall has been called before the batch gets to execute.
                // Since there is no way to cancel the fn executions, we need to add an uninstall guard to all fns of the batch.

                batchProcessor.add(0, function performUpdateChildSizes() {
                    if (!getState(element)) {
                        debug("Aborting because element has been uninstalled");
                        return;
                    }

                    if (!areElementsInjected()) {
                        debug("Aborting because element container has not been initialized");
                        return;
                    }

                    if (options.debug) {
                        var w = element.offsetWidth;
                        var h = element.offsetHeight;

                        if (w !== width || h !== height) {
                            reporter.warn(idHandler.get(element), "Scroll: Size changed before updating detector elements.");
                        }
                    }

                    updateChildSizes(element, width, height);
                });

                batchProcessor.add(1, function updateScrollbars() {
                    if (!getState(element)) {
                        debug("Aborting because element has been uninstalled");
                        return;
                    }

                    if (!areElementsInjected()) {
                        debug("Aborting because element container has not been initialized");
                        return;
                    }

                    positionScrollbars(element, width, height);
                });

                if (done) {
                    batchProcessor.add(2, function () {
                        if (!getState(element)) {
                            debug("Aborting because element has been uninstalled");
                            return;
                        }

                        if (!areElementsInjected()) {
                          debug("Aborting because element container has not been initialized");
                          return;
                        }

                        done();
                    });
                }
            }

            function areElementsInjected() {
                return !!getState(element).container;
            }

            function notifyListenersIfNeeded() {
                function isFirstNotify() {
                    return getState(element).lastNotifiedWidth === undefined;
                }

                debug("notifyListenersIfNeeded invoked");

                var state = getState(element);

                // Don't notify the if the current size is the start size, and this is the first notification.
                if (isFirstNotify() && state.lastWidth === state.startSize.width && state.lastHeight === state.startSize.height) {
                    return debug("Not notifying: Size is the same as the start size, and there has been no notification yet.");
                }

                // Don't notify if the size already has been notified.
                if (state.lastWidth === state.lastNotifiedWidth && state.lastHeight === state.lastNotifiedHeight) {
                    return debug("Not notifying: Size already notified");
                }


                debug("Current size not notified, notifying...");
                state.lastNotifiedWidth = state.lastWidth;
                state.lastNotifiedHeight = state.lastHeight;
                forEach$1(getState(element).listeners, function (listener) {
                    listener(element);
                });
            }

            function handleRender() {
                debug("startanimation triggered.");

                if (isUnrendered(element)) {
                    debug("Ignoring since element is still unrendered...");
                    return;
                }

                debug("Element rendered.");
                var expand = getExpandElement(element);
                var shrink = getShrinkElement(element);
                if (expand.scrollLeft === 0 || expand.scrollTop === 0 || shrink.scrollLeft === 0 || shrink.scrollTop === 0) {
                    debug("Scrollbars out of sync. Updating detector elements...");
                    updateDetectorElements(notifyListenersIfNeeded);
                }
            }

            function handleScroll() {
                debug("Scroll detected.");

                if (isUnrendered(element)) {
                    // Element is still unrendered. Skip this scroll event.
                    debug("Scroll event fired while unrendered. Ignoring...");
                    return;
                }

                var width = element.offsetWidth;
                var height = element.offsetHeight;

                if (width !== element.lastWidth || height !== element.lastHeight) {
                    debug("Element size changed.");
                    updateDetectorElements(notifyListenersIfNeeded);
                } else {
                    debug("Element size has not changed (" + width + "x" + height + ").");
                }
            }

            debug("registerListenersAndPositionElements invoked.");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            getState(element).onRendered = handleRender;
            getState(element).onExpand = handleScroll;
            getState(element).onShrink = handleScroll;

            var style = getState(element).style;
            updateChildSizes(element, style.width, style.height);
        }

        function finalizeDomMutation() {
            debug("finalizeDomMutation invoked.");

            if (!getState(element)) {
                debug("Aborting because element has been uninstalled");
                return;
            }

            var style = getState(element).style;
            storeCurrentSize(element, style.width, style.height);
            positionScrollbars(element, style.width, style.height);
        }

        function ready() {
            callback(element);
        }

        function install() {
            debug("Installing...");
            initListeners();
            storeStartSize();

            batchProcessor.add(0, storeStyle);
            batchProcessor.add(1, injectScrollElements);
            batchProcessor.add(2, registerListenersAndPositionElements);
            batchProcessor.add(3, finalizeDomMutation);
            batchProcessor.add(4, ready);
        }

        debug("Making detectable...");

        if (isDetached(element)) {
            debug("Element is detached");

            injectContainerElement();

            debug("Waiting until element is attached...");

            getState(element).onRendered = function () {
                debug("Element is now attached");
                install();
            };
        } else {
            install();
        }
    }

    function uninstall(element) {
        var state = getState(element);

        if (!state) {
            // Uninstall has been called on a non-erd element.
            return;
        }

        // Uninstall may have been called in the following scenarios:
        // (1) Right between the sync code and async batch (here state.busy = true, but nothing have been registered or injected).
        // (2) In the ready callback of the last level of the batch by another element (here, state.busy = true, but all the stuff has been injected).
        // (3) After the installation process (here, state.busy = false and all the stuff has been injected).
        // So to be on the safe side, let's check for each thing before removing.

        // We need to remove the event listeners, because otherwise the event might fire on an uninstall element which results in an error when trying to get the state of the element.
        state.onExpandScroll && removeEvent(getExpandElement(element), "scroll", state.onExpandScroll);
        state.onShrinkScroll && removeEvent(getShrinkElement(element), "scroll", state.onShrinkScroll);
        state.onAnimationStart && removeEvent(state.container, "animationstart", state.onAnimationStart);

        state.container && element.removeChild(state.container);
    }

    return {
        makeDetectable: makeDetectable,
        addListener: addListener,
        uninstall: uninstall
    };
};

"use strict";

var forEach                 = collectionUtils.forEach;









//Detection strategies.



function isCollection(obj) {
    return Array.isArray(obj) || obj.length !== undefined;
}

function toArray(collection) {
    if (!Array.isArray(collection)) {
        var array = [];
        forEach(collection, function (obj) {
            array.push(obj);
        });
        return array;
    } else {
        return collection;
    }
}

function isElement(obj) {
    return obj && obj.nodeType === 1;
}

/**
 * @typedef idHandler
 * @type {object}
 * @property {function} get Gets the resize detector id of the element.
 * @property {function} set Generate and sets the resize detector id of the element.
 */

/**
 * @typedef Options
 * @type {object}
 * @property {boolean} callOnAdd    Determines if listeners should be called when they are getting added.
                                    Default is true. If true, the listener is guaranteed to be called when it has been added.
                                    If false, the listener will not be guarenteed to be called when it has been added (does not prevent it from being called).
 * @property {idHandler} idHandler  A custom id handler that is responsible for generating, setting and retrieving id's for elements.
                                    If not provided, a default id handler will be used.
 * @property {reporter} reporter    A custom reporter that handles reporting logs, warnings and errors.
                                    If not provided, a default id handler will be used.
                                    If set to false, then nothing will be reported.
 * @property {boolean} debug        If set to true, the the system will report debug messages as default for the listenTo method.
 */

/**
 * Creates an element resize detector instance.
 * @public
 * @param {Options?} options Optional global options object that will decide how this instance will work.
 */
var elementResizeDetector = function(options) {
    options = options || {};

    //idHandler is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var idHandler$$1;

    if (options.idHandler) {
        // To maintain compatability with idHandler.get(element, readonly), make sure to wrap the given idHandler
        // so that readonly flag always is true when it's used here. This may be removed next major version bump.
        idHandler$$1 = {
            get: function (element) { return options.idHandler.get(element, true); },
            set: options.idHandler.set
        };
    } else {
        var idGenerator$$1 = idGenerator();
        var defaultIdHandler = idHandler({
            idGenerator: idGenerator$$1,
            stateHandler: stateHandler
        });
        idHandler$$1 = defaultIdHandler;
    }

    //reporter is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var reporter$$1 = options.reporter;

    if(!reporter$$1) {
        //If options.reporter is false, then the reporter should be quiet.
        var quiet = reporter$$1 === false;
        reporter$$1 = reporter(quiet);
    }

    //batchProcessor is currently not an option to the listenTo function, so it should not be added to globalOptions.
    var batchProcessor$$1 = getOption(options, "batchProcessor", batchProcessor({ reporter: reporter$$1 }));

    //Options to be used as default for the listenTo function.
    var globalOptions = {};
    globalOptions.callOnAdd     = !!getOption(options, "callOnAdd", true);
    globalOptions.debug         = !!getOption(options, "debug", false);

    var eventListenerHandler    = listenerHandler(idHandler$$1);
    var elementUtils$$1            = elementUtils({
        stateHandler: stateHandler
    });

    //The detection strategy to be used.
    var detectionStrategy;
    var desiredStrategy = getOption(options, "strategy", "object");
    var strategyOptions = {
        reporter: reporter$$1,
        batchProcessor: batchProcessor$$1,
        stateHandler: stateHandler,
        idHandler: idHandler$$1
    };

    if(desiredStrategy === "scroll") {
        if (browserDetector.isLegacyOpera()) {
            reporter$$1.warn("Scroll strategy is not supported on legacy Opera. Changing to object strategy.");
            desiredStrategy = "object";
        } else if (browserDetector.isIE(9)) {
            reporter$$1.warn("Scroll strategy is not supported on IE9. Changing to object strategy.");
            desiredStrategy = "object";
        }
    }

    if(desiredStrategy === "scroll") {
        detectionStrategy = scroll(strategyOptions);
    } else if(desiredStrategy === "object") {
        detectionStrategy = object(strategyOptions);
    } else {
        throw new Error("Invalid strategy name: " + desiredStrategy);
    }

    //Calls can be made to listenTo with elements that are still being installed.
    //Also, same elements can occur in the elements list in the listenTo function.
    //With this map, the ready callbacks can be synchronized between the calls
    //so that the ready callback can always be called when an element is ready - even if
    //it wasn't installed from the function itself.
    var onReadyCallbacks = {};

    /**
     * Makes the given elements resize-detectable and starts listening to resize events on the elements. Calls the event callback for each event for each element.
     * @public
     * @param {Options?} options Optional options object. These options will override the global options. Some options may not be overriden, such as idHandler.
     * @param {element[]|element} elements The given array of elements to detect resize events of. Single element is also valid.
     * @param {function} listener The callback to be executed for each resize event for each element.
     */
    function listenTo(options, elements, listener) {
        function onResizeCallback(element) {
            var listeners = eventListenerHandler.get(element);
            forEach(listeners, function callListenerProxy(listener) {
                listener(element);
            });
        }

        function addListener(callOnAdd, element, listener) {
            eventListenerHandler.add(element, listener);

            if(callOnAdd) {
                listener(element);
            }
        }

        //Options object may be omitted.
        if(!listener) {
            listener = elements;
            elements = options;
            options = {};
        }

        if(!elements) {
            throw new Error("At least one element required.");
        }

        if(!listener) {
            throw new Error("Listener required.");
        }

        if (isElement(elements)) {
            // A single element has been passed in.
            elements = [elements];
        } else if (isCollection(elements)) {
            // Convert collection to array for plugins.
            // TODO: May want to check so that all the elements in the collection are valid elements.
            elements = toArray(elements);
        } else {
            return reporter$$1.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
        }

        var elementsReady = 0;

        var callOnAdd = getOption(options, "callOnAdd", globalOptions.callOnAdd);
        var onReadyCallback = getOption(options, "onReady", function noop() {});
        var debug = getOption(options, "debug", globalOptions.debug);

        forEach(elements, function attachListenerToElement(element) {
            if (!stateHandler.getState(element)) {
                stateHandler.initState(element);
                idHandler$$1.set(element);
            }

            var id = idHandler$$1.get(element);

            debug && reporter$$1.log("Attaching listener to element", id, element);

            if(!elementUtils$$1.isDetectable(element)) {
                debug && reporter$$1.log(id, "Not detectable.");
                if(elementUtils$$1.isBusy(element)) {
                    debug && reporter$$1.log(id, "System busy making it detectable");

                    //The element is being prepared to be detectable. Do not make it detectable.
                    //Just add the listener, because the element will soon be detectable.
                    addListener(callOnAdd, element, listener);
                    onReadyCallbacks[id] = onReadyCallbacks[id] || [];
                    onReadyCallbacks[id].push(function onReady() {
                        elementsReady++;

                        if(elementsReady === elements.length) {
                            onReadyCallback();
                        }
                    });
                    return;
                }

                debug && reporter$$1.log(id, "Making detectable...");
                //The element is not prepared to be detectable, so do prepare it and add a listener to it.
                elementUtils$$1.markBusy(element, true);
                return detectionStrategy.makeDetectable({ debug: debug }, element, function onElementDetectable(element) {
                    debug && reporter$$1.log(id, "onElementDetectable");

                    if (stateHandler.getState(element)) {
                        elementUtils$$1.markAsDetectable(element);
                        elementUtils$$1.markBusy(element, false);
                        detectionStrategy.addListener(element, onResizeCallback);
                        addListener(callOnAdd, element, listener);

                        // Since the element size might have changed since the call to "listenTo", we need to check for this change,
                        // so that a resize event may be emitted.
                        // Having the startSize object is optional (since it does not make sense in some cases such as unrendered elements), so check for its existance before.
                        // Also, check the state existance before since the element may have been uninstalled in the installation process.
                        var state = stateHandler.getState(element);
                        if (state && state.startSize) {
                            var width = element.offsetWidth;
                            var height = element.offsetHeight;
                            if (state.startSize.width !== width || state.startSize.height !== height) {
                                onResizeCallback(element);
                            }
                        }

                        if(onReadyCallbacks[id]) {
                            forEach(onReadyCallbacks[id], function(callback) {
                                callback();
                            });
                        }
                    } else {
                        // The element has been unisntalled before being detectable.
                        debug && reporter$$1.log(id, "Element uninstalled before being detectable.");
                    }

                    delete onReadyCallbacks[id];

                    elementsReady++;
                    if(elementsReady === elements.length) {
                        onReadyCallback();
                    }
                });
            }

            debug && reporter$$1.log(id, "Already detecable, adding listener.");

            //The element has been prepared to be detectable and is ready to be listened to.
            addListener(callOnAdd, element, listener);
            elementsReady++;
        });

        if(elementsReady === elements.length) {
            onReadyCallback();
        }
    }

    function uninstall(elements) {
        if(!elements) {
            return reporter$$1.error("At least one element is required.");
        }

        if (isElement(elements)) {
            // A single element has been passed in.
            elements = [elements];
        } else if (isCollection(elements)) {
            // Convert collection to array for plugins.
            // TODO: May want to check so that all the elements in the collection are valid elements.
            elements = toArray(elements);
        } else {
            return reporter$$1.error("Invalid arguments. Must be a DOM element or a collection of DOM elements.");
        }

        forEach(elements, function (element) {
            eventListenerHandler.removeAllListeners(element);
            detectionStrategy.uninstall(element);
            stateHandler.cleanState(element);
        });
    }

    return {
        listenTo: listenTo,
        removeListener: eventListenerHandler.removeListener,
        removeAllListeners: eventListenerHandler.removeAllListeners,
        uninstall: uninstall
    };
};

function getOption(options, name, defaultValue) {
    var value = options[name];

    if((value === undefined || value === null) && defaultValue !== undefined) {
        return defaultValue;
    }

    return value;
}

// @FIXME 需要一个更优的解决方案
var Vue$1 = Vue$;
if (typeof window !== 'undefined' && window.Vue) {
  Vue$1 = window.Vue;
}
var HappyScroll = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "happy-scroll", staticClass: "happy-scroll" }, [_c('div', { ref: "container", staticClass: "happy-scroll-container", style: [_vm.initSize], on: { "scroll": function scroll($event) {
          $event.stopPropagation();return _vm.onScroll($event);
        } } }, [_c('div', { ref: "content", staticClass: "happy-scroll-content", style: [_vm.contentBorderStyle] }, [_vm._t("default")], 2)]), !_vm.hideVertical ? _c('happy-scroll-strip', _vm._g(_vm._b({ ref: "stripY", attrs: { "throttle": _vm.throttle, "move": _vm.moveY }, on: { "change": _vm.slideYChange } }, 'happy-scroll-strip', _vm.$attrs, false), _vm.$listeners)) : _vm._e(), !_vm.hideHorizontal ? _c('happy-scroll-strip', _vm._g(_vm._b({ ref: "stripX", attrs: { "horizontal": "", "throttle": _vm.throttle, "move": _vm.moveX }, on: { "change": _vm.slideXChange } }, 'happy-scroll-strip', _vm.$attrs, false), _vm.$listeners)) : _vm._e()], 1);
  }, staticRenderFns: [],
  name: 'happy-scroll',
  inheritAttrs: false,
  components: {
    HappyScrollStrip: HappyScrollStrip
  },
  props: {
    // 设置竖向滚动条的位置
    scrollTop: {
      type: [Number, String],
      default: 0
    },
    // 设置横向滚动条的位置
    scrollLeft: {
      type: [Number, String],
      default: 0
    },
    // 是否隐藏竖向滚动条
    hideVertical: Boolean,
    // 是否隐藏横向滚动条
    hideHorizontal: Boolean,
    // 鼠标移动的节流函数时间, 表示该时间内鼠标移动的回调保障在该时间内只执行一次
    throttle: {
      type: Number,
      default: 14 // 默认14毫秒
    },
    // 是否开启监控视图大小发生变化
    resize: Boolean,
    // (当resize=true时生效)当视图宽高变小时(内容减少) 滚动条移动到 -> start(竖向时表示最上边，横向时表示最左边)、end、默认保持不变
    smallerMoveH: {
      type: String,
      default: ''
    },
    smallerMoveV: {
      type: String,
      default: ''
    },
    // (当resize=true时生效)当视图宽高变大时(内容增多)
    biggerMoveH: {
      type: String,
      default: ''
    },
    biggerMoveV: {
      type: String,
      default: ''
    }
  },
  data: function data() {
    return {
      // 视图元素的容器的宽高，在mounted之后会计算该属性
      initSize: {},
      // 横向的
      moveX: +this.scrollLeft, // slot dom元素滚动的位置
      // 竖向的
      moveY: +this.scrollTop,
      // 监听scroll事件的节流函数
      scrollThrottle: generateThrottle(this.throttle),
      // 浏览器滚动条所占空间的大小, 默认为15px
      browserHSize: 0,
      browserVSize: 0,
      // 滚动条的模式，表示占用宽度还是悬浮在元素上(macOS系统可以设置滚动条悬浮在元素上，不会占用元素的空间)
      isScrollNotUseSpace: undefined
    };
  },

  watch: {
    // 监听（鼠标滑轮或者触摸板滑动） 滑动到指定位置
    scrollTop: function scrollTop(newVal) {
      this.$refs.container.scrollTop = this.moveY = +newVal;
    },
    scrollLeft: function scrollLeft(newVal) {
      this.$refs.container.scrollLeft = this.moveX = +newVal;
    },

    // 监听动态开启或关闭对应的滚动条
    hideVertical: function hideVertical(newVal) {
      if (!newVal) {
        // 如果将禁用修改为启用，等子组件渲染后 再计算比例
        this.$nextTick(this.computeStripY);
      }
    },
    hideHorizontal: function hideHorizontal(newVal) {
      if (!newVal) {
        // 如果将禁用修改为启用，等子组件渲染后 再计算比例
        this.$nextTick(this.computeStripX);
      }
    }
  },
  computed: {
    // content 元素的border样式
    contentBorderStyle: function contentBorderStyle() {
      if (this.isScrollNotUseSpace === undefined) {
        return {};
      }

      return {
        'border-right': 20 - this.browserHSize + 'px solid transparent',
        'border-bottom': 20 - this.browserVSize + 'px solid transparent'
      };
    }
  },
  methods: {
    // 模拟的滚动条位置发生了变动，修改 dom 对应的位置
    slideYChange: function slideYChange(newVal) {
      this.$refs.container.scrollTop = newVal;
      // this.$refs.container.scrollTop 会在渲染之后被自动调整，所以这里重新取值
      this.$emit('update:scrollTop', this.$refs.container.scrollTop);
    },
    slideXChange: function slideXChange(newVal) {
      this.$refs.container.scrollLeft = newVal;
      this.$emit('update:scrollLeft', this.$refs.container.scrollLeft);
    },

    // 监听dom元素的滚动事件，通知strip，将bar移动到对应位置
    onScroll: function onScroll(e) {
      // 节流
      if (!this.scrollThrottle(Date.now())) return false;
      this.moveY = e.target.scrollTop;
      this.moveX = e.target.scrollLeft;
      this.updateSyncScroll();
    },

    // 初始化，获取浏览器滚动条的大小
    initBrowserSize: function initBrowserSize() {
      if (this.isScrollNotUseSpace === undefined) {
        return;
      }

      if (this.isScrollNotUseSpace === true) {
        this.browserHSize = 0;
        this.browserVSize = 0;
      } else {
        // 获取当前浏览器滚动条的宽高
        this.browserHSize = this.$refs.container.offsetWidth - this.$refs.container.clientWidth;
        // 横向滚动的高度
        this.browserVSize = this.$refs.container.offsetHeight - this.$refs.container.clientHeight;
      }
    },

    // 计算横向滚动条宽度度与元素宽度百分比
    computeStripX: function computeStripX() {
      if (this.hideHorizontal) {
        // 没有开启横向滚动条
        return;
      }
      var clientEle = this.$refs['happy-scroll'];
      var slotEle = this.$slots.default[0]['elm'];
      this.$refs.stripX.computeStrip(slotEle.scrollWidth, clientEle.clientWidth);
    },

    // 计算横向滚动条高度与元素高度百分比
    computeStripY: function computeStripY() {
      if (this.hideVertical) {
        // 没有开启竖向滚动条
        return;
      }
      var clientEle = this.$refs['happy-scroll'];
      var slotEle = this.$slots.default[0]['elm'];
      // 竖向滚动条高度与元素高度百分比
      this.$refs.stripY.computeStrip(slotEle.scrollHeight, clientEle.clientHeight);
    },

    // slot视图大小变化时的监听
    resizeListener: function resizeListener() {
      var _this = this;

      // 没开启监听reszie方法
      if (!this.resize) return;

      // 监听slot视图元素resize
      var elementResizeDetector$$1 = elementResizeDetector({
        strategy: 'scroll',
        callOnAdd: false
      });

      // 记录视图上次宽高的变化
      var ele = this.$slots.default[0]['elm'];
      var lastHeight = ele.clientHeight;
      var lastWidth = ele.clientWidth;
      elementResizeDetector$$1.listenTo(ele, function (element) {
        // 初始化百分比
        _this.computeStripX();
        _this.computeStripY();
        _this.initBrowserSize();
        // 获取竖向滚动条变小或者变大的移动策略
        var moveTo = void 0;
        if (element.clientHeight < lastHeight) {
          // 高度变小
          moveTo = _this.smallerMoveH.toLocaleLowerCase();
        }
        if (element.clientHeight > lastHeight) {
          // 高度变大
          moveTo = _this.biggerMoveH.toLocaleLowerCase();
        }

        if (moveTo === 'start') {
          // 竖向滚动条移动到顶部
          _this.moveY = 0;
          _this.slideYChange(_this.moveY);
        }
        if (moveTo === 'end') {
          // 竖向滚动条移动到底部
          _this.moveY = element.clientHeight;
          _this.slideYChange(_this.moveY);
        }

        // 记录此次的高度，用于下次变化后的比较
        lastHeight = element.clientHeight;

        // 获取横向向滚动条变小或者变大的移动策略
        moveTo = '';
        if (element.clientWidth < lastWidth) {
          // 宽度变小
          moveTo = _this.smallerMoveV.toLocaleLowerCase();
        }
        if (element.clientWidth > lastWidth) {
          // 宽度变大
          moveTo = _this.biggerMoveV.toLocaleLowerCase();
        }
        if (moveTo === 'start') {
          // 横向滚动条移动到最左边
          _this.moveX = 0;
          _this.slideXChange(_this.moveX);
        }
        if (moveTo === 'end') {
          // 竖向滚动条移动到最右边
          _this.moveX = element.clientWidth;
          _this.slideXChange(_this.moveX);
        }

        // 记录此次的宽度，用于下次变化后的比较
        lastWidth = element.clientWidth;
      });
    },

    // 设置滚动条元素的宽度
    setContainerSize: function setContainerSize() {
      // 根据最外层div，初始化内部容器的宽高，包含滚动条的宽高
      this.initSize = {
        width: this.$refs['happy-scroll'].clientWidth + 20 + 'px',
        height: this.$refs['happy-scroll'].clientHeight + 20 + 'px'
      };
    },

    // 判断浏览器滚动条的模式
    checkScrollMode: function checkScrollMode() {
      // eslint-disable-next-line
      if (Vue$1._happyJS._isScrollNotUseSpace !== undefined) {
        // 如果不是undefined，说明已经判断过了
        return;
      }

      var ele = this.$slots.default[0]['elm'];
      var container = this.$refs.container;
      // 如果视图元素的实际高度(宽度)大于可视高度(宽度)，则可以肯定会出现滚动条了，否则还没有出现，不做判断
      if (ele.offsetHeight > container.clientHeight || ele.offsetWidth > container.clientWidth) {
        // 可以肯定出现滚动条了，可以判断滚动条的模式
        if (container.offsetWidth > container.clientWidth || container.offsetHeight > container.clientHeight) {
          // 滚动条一直存在的模式
          // eslint-disable-next-line
          Vue$1._happyJS._isScrollNotUseSpace = false;
        } else {
          // eslint-disable-next-line
          Vue$1._happyJS._isScrollNotUseSpace = true;
        }
        // eslint-disable-next-line
        this.isScrollNotUseSpace = Vue$1._happyJS._isScrollNotUseSpace;
      }
    }
  },
  beforeCreate: function beforeCreate() {
    // eslint-disable-next-line
    var happyJS = Vue$1._happyJS = Vue$1._happyJS || {};
    /**
     * 判断当前浏览器滚动条存在的方式
     * true. 滚动时滚动条才会出现，悬浮在元素之上，不占用宽度(默认为此模式，但可以通过css隐藏滚动条，也属于不占用空间的模式，不过Firefox除外)
     * false. 系统滚动条始终存在，所以会占用宽度 (占用视图宽度的模式，windows下默认为此方式)
     */
    this.isScrollNotUseSpace = happyJS._isScrollNotUseSpace;
  },
  created: function created() {
    // @FIXME 更新滚动事件，因为需要使用 this.throttle 变量，所以声明在 created 中
    this.updateSyncScroll = debounce(function () {
      this.$emit('update:scrollTop', this.moveY);
      this.$emit('update:scrollLeft', this.moveX);
    }, this.throttle);
  },
  mounted: function mounted() {
    var _this2 = this;

    // 计算最外层宽高，设置滚动条元素的宽高
    this.setContainerSize();
    this.$nextTick(function () {
      // 使滚动条进行计算比例
      _this2.computeStripX();
      _this2.computeStripY();
      // 判断当前浏览器滚动条的模式，依据slot元素高度，如果高度大于视图高度，则出现滚动条了，此时再判断滚动条的模式
      _this2.checkScrollMode();
      // 获取当前浏览器滚动条的宽高
      _this2.initBrowserSize();

      _this2.$nextTick(function () {
        // 因为 initBrowserSize 会有增加 20px border 的操作，所以需要等待这20px渲染完成后再进行操作
        // 将视图dom移动到设定的位置
        _this2.scrollTop && (_this2.$refs.container.scrollTop = +_this2.scrollTop);
        _this2.scrollLeft && (_this2.$refs.container.scrollLeft = +_this2.scrollLeft);
      });
    });

    // 监听slot视图变化, 方法内部会判断是否设置了开启监听resize
    this.resizeListener();

    // 监听滚动条宽度变化，有滚动条 -> 无滚动条, 在mounted中监听是为了确保$refs可调用
    this.$watch('browserHSize', this.setContainerSize);
    this.$watch('browserVSize', this.setContainerSize);
  }
};

var version = "2.1.1";

// 如果vue是全局变量,使用自动全局安装。
if (typeof window !== 'undefined' && window.Vue) {
  // eslint-disable-next-line
  Vue.component('happy-scroll', HappyScroll);
}

var index = {
  install: function install(Vue) {
    Vue.component('happy-scroll', HappyScroll);
  },

  version: version
};

exports['default'] = index;
exports.HappyScroll = HappyScroll;
exports.version = version;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=happy-scroll.js.map
