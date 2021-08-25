var binjson = (function(init, main) {
  var mod = {require: require};
  var def = {};
  var pre = {};
  if ("undefined" != typeof exports) pre[main] = exports;
  define.amd = true;
  init(define);
  return require(main);

  function require(name) {
    return mod[name] || (mod[name] = def[name]());
  }

  function define(name, deps, fn) {
    def[name] = function() {
      var exports = mod.exports = pre[name] || {};
      var module = mod.module = {exports: exports};
      fn.apply(null, deps.map(require));
      return module.exports;
    }
  }
})(function(define) {
  // AMD
}, "index"); // END
