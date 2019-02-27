function _isCorrectVal(variable, notBezero) {
  var result = true;
  if (typeof variable === "string") {
    if (
      variable === "" ||
      variable === "undefined" ||
      variable === "null" ||
      variable === "NaN" ||
      variable === "Infinity"
    ) {
      result = false;
    }
  } else if (typeof variable === "number") {
    if (isNaN(variable) || !isFinite(variable)) {
      result = false;
    }
    if (notBezero) return variable > 0;
  } else if (variable === null) {
    result = false;
  } else if (typeof variable === "undefined") {
    result = false;
  } else if (_isObject(variable)) {
    if (_isEmptyObject(variable)) {
      result = false;
    }
  } else if (Array.isArray(variable)) {
    if (variable.length === 0) {
      result = false;
    }
  }
  return result;
}
export const isCorrectVal = _isCorrectVal;

function _isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
export const isObject = _isObject;

function _isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}
export const isEmptyObject = _isEmptyObject;
