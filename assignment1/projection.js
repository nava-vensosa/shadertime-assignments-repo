/* projection.js — 4D to 3D perspective projection */

var Projection = {
  /**
   * Project a 4D point to 3D via perspective division on W.
   * viewDistance controls the camera distance along W axis.
   */
  from4Dto3D: function(v, viewDistance) {
    var d = viewDistance || 400;
    var w = v.w || 0;
    var scale = d / (d - w);
    return {
      x: v.x * scale,
      y: v.y * scale,
      z: (v.z || 0) * scale
    };
  },

  /** Project an array of 4D verts to 3D */
  projectAll: function(verts4D, viewDistance) {
    var out = [];
    for (var i = 0; i < verts4D.length; i++) {
      out.push(Projection.from4Dto3D(verts4D[i], viewDistance));
    }
    return out;
  }
};
