export function trace(arg) {
  var now = (window.performance.now() / 1000).toFixed(3);
  console.log(now + ': ', arg);
}

export function uuid() {
  function ko() {
    return Math.floor(Math.random() * 0x10000).toString(16);
  }

  return ko() + ko() + '-' + ko() + '-' + ko() + '-' + ko();
}

export function _str(obj) {
  return JSON.stringify(obj);
}
