/* edges.js — edge computation and drawing */

var Edges = {
  /** Return [[v0,v1],[v1,v2],...,[vN,v0]] polygon winding pairs */
  pairs: function(verts) {
    var p = [];
    for (var i = 0; i < verts.length; i++) {
      p.push([verts[i], verts[(i + 1) % verts.length]]);
    }
    return p;
  },

  /** Draw edges as thin transparent fluorescent green lines (2D or 3D) */
  drawEdges: function(pairs, is3D) {
    stroke(57, 255, 20, 220);
    strokeWeight(2.5);
    noFill();
    for (var i = 0; i < pairs.length; i++) {
      var a = pairs[i][0];
      var b = pairs[i][1];
      if (is3D) {
        line(a.x, a.y, a.z || 0, b.x, b.y, b.z || 0);
      } else {
        line(a.x, a.y, 0, b.x, b.y, 0);
      }
    }
  },

  /** Draw connecting edges between two corresponding vertex arrays */
  drawBetween: function(vertsA, vertsB) {
    stroke(57, 255, 20, 220);
    strokeWeight(2.5);
    noFill();
    var len = Math.min(vertsA.length, vertsB.length);
    for (var i = 0; i < len; i++) {
      var a = vertsA[i];
      var b = vertsB[i];
      line(a.x, a.y, a.z || 0, b.x, b.y, b.z || 0);
    }
  }
};
