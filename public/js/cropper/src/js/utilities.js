import { IN_BROWSER, WINDOW } from './constants';
export const isNaN = Number.isNaN || WINDOW.isNaN;
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}
export function isUndefined(value) {
  return typeof value === 'undefined';
}
export function isObject(value) {
  return typeof value === 'object' && value !== null;
}
const { hasOwnProperty } = Object.prototype;
export function isPlainObject(value) {
  if (!isObject(value)) {
    return false;
  }
  try {
    const { constructor } = value;
    const { prototype } = constructor;
    return constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
  } catch (e) {
    return false;
  }
}
export function isFunction(value) {
  return typeof value === 'function';
}
export function forEach(data, callback) {
  if (data && isFunction(callback)) {
    if (Array.isArray(data) || isNumber(data.length)) {
      const { length } = data;
      let i;
      for (i = 0; i < length; i += 1) {
        if (callback.call(data, data[i], i, data) === false) {
          break;
        }
      }
    } else if (isObject(data)) {
      Object.keys(data).forEach((key) => {
        callback.call(data, data[key], key, data);
      });
    }
  }
  return data;
}
export const assign = Object.assign || function assign(obj, ...args) {
  if (isObject(obj) && args.length > 0) {
    args.forEach((arg) => {
      if (isObject(arg)) {
        Object.keys(arg).forEach((key) => {
          obj[key] = arg[key];
        });
      }
    });
  }
  return obj;
};
const REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/i;
export function normalizeDecimalNumber(value, times = 100000000000) {
  return REGEXP_DECIMALS.test(value) ? (Math.round(value * times) / times) : value;
}
const REGEXP_SUFFIX = /^(?:width|height|left|top|marginLeft|marginTop)$/;
export function setStyle(element, styles) {
  const { style } = element;
  forEach(styles, (value, property) => {
    if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
      value += 'px';
    }
    style[property] = value;
  });
}
export function hasClass(element, value) {
  return element.classList
    ? element.classList.contains(value)
    : element.className.indexOf(value) > -1;
}
export function addClass(element, value) {
  if (!value) {
    return;
  }
  if (isNumber(element.length)) {
    forEach(element, (elem) => {
      addClass(elem, value);
    });
    return;
  }
  if (element.classList) {
    element.classList.add(value);
    return;
  }
  const className = element.className.trim();
  if (!className) {
    element.className = value;
  } else if (className.indexOf(value) < 0) {
    element.className = `${className} ${value}`;
  }
}
export function removeClass(element, value) {
  if (!value) {
    return;
  }
  if (isNumber(element.length)) {
    forEach(element, (elem) => {
      removeClass(elem, value);
    });
    return;
  }
  if (element.classList) {
    element.classList.remove(value);
    return;
  }
  if (element.className.indexOf(value) >= 0) {
    element.className = element.className.replace(value, '');
  }
}
export function toggleClass(element, value, added) {
  if (!value) {
    return;
  }
  if (isNumber(element.length)) {
    forEach(element, (elem) => {
      toggleClass(elem, value, added);
    });
    return;
  }
  if (added) {
    addClass(element, value);
  } else {
    removeClass(element, value);
  }
}
const REGEXP_HYPHENATE = /([a-z\d])([A-Z])/g;
export function hyphenate(value) {
  return value.replace(REGEXP_HYPHENATE, '$1-$2').toLowerCase();
}
export function getData(element, name) {
  if (isObject(element[name])) {
    return element[name];
  }
  if (element.dataset) {
    return element.dataset[name];
  }
  return element.getAttribute(`data-${hyphenate(name)}`);
}
export function setData(element, name, data) {
  if (isObject(data)) {
    element[name] = data;
  } else if (element.dataset) {
    element.dataset[name] = data;
  } else {
    element.setAttribute(`data-${hyphenate(name)}`, data);
  }
}
export function removeData(element, name) {
  if (isObject(element[name])) {
    try {
      delete element[name];
    } catch (e) {
      element[name] = undefined;
    }
  } else if (element.dataset) {
    try {
      delete element.dataset[name];
    } catch (e) {
      element.dataset[name] = undefined;
    }
  } else {
    element.removeAttribute(`data-${hyphenate(name)}`);
  }
}
const REGEXP_SPACES = /\s\s*/;
const onceSupported = (() => {
  let supported = false;
  if (IN_BROWSER) {
    let once = false;
    const listener = () => {};
    const options = Object.defineProperty({}, 'once', {
      get() {
        supported = true;
        return once;
      },
      set(value) {
        once = value;
      },
    });
    WINDOW.addEventListener('test', listener, options);
    WINDOW.removeEventListener('test', listener, options);
  }
  return supported;
})();
export function removeListener(element, type, listener, options = {}) {
  let handler = listener;
  type.trim().split(REGEXP_SPACES).forEach((event) => {
    if (!onceSupported) {
      const { listeners } = element;
      if (listeners && listeners[event] && listeners[event][listener]) {
        handler = listeners[event][listener];
        delete listeners[event][listener];
        if (Object.keys(listeners[event]).length === 0) {
          delete listeners[event];
        }
        if (Object.keys(listeners).length === 0) {
          delete element.listeners;
        }
      }
    }
    element.removeEventListener(event, handler, options);
  });
}
export function addListener(element, type, listener, options = {}) {
  let handler = listener;
  type.trim().split(REGEXP_SPACES).forEach((event) => {
    if (options.once && !onceSupported) {
      const { listeners = {} } = element;
      handler = (...args) => {
        delete listeners[event][listener];
        element.removeEventListener(event, handler, options);
        listener.apply(element, args);
      };
      if (!listeners[event]) {
        listeners[event] = {};
      }
      if (listeners[event][listener]) {
        element.removeEventListener(event, listeners[event][listener], options);
      }
      listeners[event][listener] = handler;
      element.listeners = listeners;
    }
    element.addEventListener(event, handler, options);
  });
}
export function dispatchEvent(element, type, data) {
  let event;
  if (isFunction(Event) && isFunction(CustomEvent)) {
    event = new CustomEvent(type, {
      detail: data,
      bubbles: true,
      cancelable: true,
    });
  } else {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, true, true, data);
  }
  return element.dispatchEvent(event);
}
export function getOffset(element) {
  const box = element.getBoundingClientRect();
  return {
    left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
    top: box.top + (window.pageYOffset - document.documentElement.clientTop),
  };
}
const { location } = WINDOW;
const REGEXP_ORIGINS = /^(https?:)\/\/([^:/?#]+):?(\d*)/i;
export function isCrossOriginURL(url) {
  const parts = url.match(REGEXP_ORIGINS);
  return parts && (
    parts[1] !== location.protocol
    || parts[2] !== location.hostname
    || parts[3] !== location.port
  );
}
export function addTimestamp(url) {
  const timestamp = `timestamp=${(new Date()).getTime()}`;
  return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
}
export function getTransforms({
  rotate,
  scaleX,
  scaleY,
  translateX,
  translateY,
}) {
  const values = [];
  if (isNumber(translateX) && translateX !== 0) {
    values.push(`translateX(${translateX}px)`);
  }
  if (isNumber(translateY) && translateY !== 0) {
    values.push(`translateY(${translateY}px)`);
  }
  if (isNumber(rotate) && rotate !== 0) {
    values.push(`rotate(${rotate}deg)`);
  }
  if (isNumber(scaleX) && scaleX !== 1) {
    values.push(`scaleX(${scaleX})`);
  }
  if (isNumber(scaleY) && scaleY !== 1) {
    values.push(`scaleY(${scaleY})`);
  }
  const transform = values.length ? values.join(' ') : 'none';
  return {
    WebkitTransform: transform,
    msTransform: transform,
    transform,
  };
}
export function getMaxZoomRatio(pointers) {
  const pointers2 = assign({}, pointers);
  const ratios = [];
  forEach(pointers, (pointer, pointerId) => {
    delete pointers2[pointerId];
    forEach(pointers2, (pointer2) => {
      const x1 = Math.abs(pointer.startX - pointer2.startX);
      const y1 = Math.abs(pointer.startY - pointer2.startY);
      const x2 = Math.abs(pointer.endX - pointer2.endX);
      const y2 = Math.abs(pointer.endY - pointer2.endY);
      const z1 = Math.sqrt((x1 * x1) + (y1 * y1));
      const z2 = Math.sqrt((x2 * x2) + (y2 * y2));
      const ratio = (z2 - z1) / z1;
      ratios.push(ratio);
    });
  });
  ratios.sort((a, b) => Math.abs(a) < Math.abs(b));
  return ratios[0];
}
export function getPointer({ pageX, pageY }, endOnly) {
  const end = {
    endX: pageX,
    endY: pageY,
  };
  return endOnly ? end : assign({
    startX: pageX,
    startY: pageY,
  }, end);
}
export function getPointersCenter(pointers) {
  let pageX = 0;
  let pageY = 0;
  let count = 0;
  forEach(pointers, ({ startX, startY }) => {
    pageX += startX;
    pageY += startY;
    count += 1;
  });
  pageX /= count;
  pageY /= count;
  return {
    pageX,
    pageY,
  };
}
export const isFinite = Number.isFinite || WINDOW.isFinite;
export function getAdjustedSizes(
  {
    aspectRatio,
    height,
    width,
  },
  type = 'contain', 
) {
  const isValidNumber = value => isFinite(value) && value > 0;
  if (isValidNumber(width) && isValidNumber(height)) {
    const adjustedWidth = height * aspectRatio;
    if ((type === 'contain' && adjustedWidth > width) || (type === 'cover' && adjustedWidth < width)) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }
  } else if (isValidNumber(width)) {
    height = width / aspectRatio;
  } else if (isValidNumber(height)) {
    width = height * aspectRatio;
  }
  return {
    width,
    height,
  };
}
export function getRotatedSizes({ width, height, degree }) {
  degree = Math.abs(degree) % 180;
  if (degree === 90) {
    return {
      width: height,
      height: width,
    };
  }
  const arc = ((degree % 90) * Math.PI) / 180;
  const sinArc = Math.sin(arc);
  const cosArc = Math.cos(arc);
  const newWidth = (width * cosArc) + (height * sinArc);
  const newHeight = (width * sinArc) + (height * cosArc);
  return degree > 90 ? {
    width: newHeight,
    height: newWidth,
  } : {
    width: newWidth,
    height: newHeight,
  };
}
export function getSourceCanvas(
  image,
  {
    aspectRatio: imageAspectRatio,
    naturalWidth: imageNaturalWidth,
    naturalHeight: imageNaturalHeight,
    rotate = 0,
    scaleX = 1,
    scaleY = 1,
  },
  {
    aspectRatio,
    naturalWidth,
    naturalHeight,
  },
  {
    fillColor = 'transparent',
    imageSmoothingEnabled = true,
    imageSmoothingQuality = 'low',
    maxWidth = Infinity,
    maxHeight = Infinity,
    minWidth = 0,
    minHeight = 0,
  },
) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const maxSizes = getAdjustedSizes({
    aspectRatio,
    width: maxWidth,
    height: maxHeight,
  });
  const minSizes = getAdjustedSizes({
    aspectRatio,
    width: minWidth,
    height: minHeight,
  }, 'cover');
  const width = Math.min(maxSizes.width, Math.max(minSizes.width, naturalWidth));
  const height = Math.min(maxSizes.height, Math.max(minSizes.height, naturalHeight));
  const destMaxSizes = getAdjustedSizes({
    aspectRatio: imageAspectRatio,
    width: maxWidth,
    height: maxHeight,
  });
  const destMinSizes = getAdjustedSizes({
    aspectRatio: imageAspectRatio,
    width: minWidth,
    height: minHeight,
  }, 'cover');
  const destWidth = Math.min(
    destMaxSizes.width,
    Math.max(destMinSizes.width, imageNaturalWidth),
  );
  const destHeight = Math.min(
    destMaxSizes.height,
    Math.max(destMinSizes.height, imageNaturalHeight),
  );
  const params = [
    -destWidth / 2,
    -destHeight / 2,
    destWidth,
    destHeight,
  ];
  canvas.width = normalizeDecimalNumber(width);
  canvas.height = normalizeDecimalNumber(height);
  context.fillStyle = fillColor;
  context.fillRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate((rotate * Math.PI) / 180);
  context.scale(scaleX, scaleY);
  context.imageSmoothingEnabled = imageSmoothingEnabled;
  context.imageSmoothingQuality = imageSmoothingQuality;
  context.drawImage(image, ...params.map(param => Math.floor(normalizeDecimalNumber(param))));
  context.restore();
  return canvas;
}
const { fromCharCode } = String;
export function getStringFromCharCode(dataView, start, length) {
  let str = '';
  let i;
  length += start;
  for (i = start; i < length; i += 1) {
    str += fromCharCode(dataView.getUint8(i));
  }
  return str;
}
const REGEXP_DATA_URL_HEAD = /^data:.*,/;
export function dataURLToArrayBuffer(dataURL) {
  const base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
  const binary = atob(base64);
  const arrayBuffer = new ArrayBuffer(binary.length);
  const uint8 = new Uint8Array(arrayBuffer);
  forEach(uint8, (value, i) => {
    uint8[i] = binary.charCodeAt(i);
  });
  return arrayBuffer;
}
export function arrayBufferToDataURL(arrayBuffer, mimeType) {
  const uint8 = new Uint8Array(arrayBuffer);
  let data = '';
  if (isFunction(uint8.forEach)) {
    uint8.forEach((value) => {
      data += fromCharCode(value);
    });
  } else {
    forEach(uint8, (value) => {
      data += fromCharCode(value);
    });
  }
  return `data:${mimeType};base64,${btoa(data)}`;
}
export function getOrientation(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  let orientation;
  let littleEndian;
  let app1Start;
  let ifdStart;
  if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
    const length = dataView.byteLength;
    let offset = 2;
    while (offset < length) {
      if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
        app1Start = offset;
        break;
      }
      offset += 1;
    }
  }
  if (app1Start) {
    const exifIDCode = app1Start + 4;
    const tiffOffset = app1Start + 10;
    if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
      const endianness = dataView.getUint16(tiffOffset);
      littleEndian = endianness === 0x4949;
      if (littleEndian || endianness === 0x4D4D ) {
        if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
          const firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
          if (firstIFDOffset >= 0x00000008) {
            ifdStart = tiffOffset + firstIFDOffset;
          }
        }
      }
    }
  }
  if (ifdStart) {
    const length = dataView.getUint16(ifdStart, littleEndian);
    let offset;
    let i;
    for (i = 0; i < length; i += 1) {
      offset = ifdStart + (i * 12) + 2;
      if (dataView.getUint16(offset, littleEndian) === 0x0112 ) {
        offset += 8;
        orientation = dataView.getUint16(offset, littleEndian);
        dataView.setUint16(offset, 1, littleEndian);
        break;
      }
    }
  }
  return orientation;
}
export function parseOrientation(orientation) {
  let rotate = 0;
  let scaleX = 1;
  let scaleY = 1;
  switch (orientation) {
    case 2:
      scaleX = -1;
      break;
    case 3:
      rotate = -180;
      break;
    case 4:
      scaleY = -1;
      break;
    case 5:
      rotate = 90;
      scaleY = -1;
      break;
    case 6:
      rotate = 90;
      break;
    case 7:
      rotate = 90;
      scaleX = -1;
      break;
    case 8:
      rotate = -90;
      break;
    default:
  }
  return {
    rotate,
    scaleX,
    scaleY,
  };
}
