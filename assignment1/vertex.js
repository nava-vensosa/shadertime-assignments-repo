/* vertex.js — vertex data structure and operations */

var Vertex = (function() {
  var _nextIndex = 0;

  return {
    add: function(x, y) {
      State.vertices2D.push({ index: _nextIndex++, x: x, y: y });
    },

    clear: function() {
      State.vertices2D = [];
      _nextIndex = 0;
    },

    count: function() {
      return State.vertices2D.length;
    }
  };
})();
