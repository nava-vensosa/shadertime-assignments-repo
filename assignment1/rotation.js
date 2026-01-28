/* rotation.js — rotation tick and 4D XW-plane rotation */

var Rotation = {
  SPEED: 0.0008,  // radians per millisecond (~0.048 rad/frame at 60fps)

  /** Advance rotation angle by delta time (ms) */
  tick: function(dt) {
    State.rotationAngle += Rotation.SPEED * dt;
  },

  /**
   * Rotate an array of 4D verts in the XW plane by angle.
   * Returns a new array (does not mutate input).
   */
  apply4D: function(verts, angle) {
    var cosA = Math.cos(angle);
    var sinA = Math.sin(angle);
    var out = [];
    for (var i = 0; i < verts.length; i++) {
      var v = verts[i];
      out.push({
        x: v.x * cosA - (v.w || 0) * sinA,
        y: v.y,
        z: v.z || 0,
        w: v.x * sinA + (v.w || 0) * cosA
      });
    }
    return out;
  }
};
