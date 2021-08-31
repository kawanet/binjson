var binjson = (function(main, exports, init) {
  var loaded = {require: require}; // loaded modules
  var defined = {}; // defined modules
  var bridge = {};
  bridge[main] = exports; // CommonJS bridge
  define.amd = {}; // AMD signature
  init(define);
  return require(main); // load main module

  function require(name) {
    return loaded[name] || (loaded[name] = defined[name]());
  }

  function define(name, deps, fn) {
    defined[name] = function() {
      var exports = loaded.exports = bridge[name] || {};
      var module = loaded.module = {exports: exports};
      fn.apply(null, deps.map(require));
      return module.exports;
    }
  }
})("index", ("undefined" != typeof exports) && exports, function(define) {
  // AMD
}); // END
