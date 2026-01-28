/* stepup.js — z-amount calculation and dimensional extrusion */

var StepUp = {
  /**
   * Compute average edge length for a set of vertices (polygon winding).
   * Works for 2D {x,y}, 3D {x,y,z}, or 4D {x,y,z,w} vertices.
   */
  zAmount: function(verts) {
    if (verts.length < 2) return 0;
    var total = 0;
    var count = 0;
    for (var i = 0; i < verts.length; i++) {
      var prev = verts[(i - 1 + verts.length) % verts.length];
      var next = verts[(i + 1) % verts.length];
      total += StepUp._dist(verts[i], prev);
      total += StepUp._dist(verts[i], next);
      count += 2;
    }
    return total / count;
  },

  /** Euclidean distance supporting 2D/3D/4D */
  _dist: function(a, b) {
    var dx = (a.x || 0) - (b.x || 0);
    var dy = (a.y || 0) - (b.y || 0);
    var dz = (a.z || 0) - (b.z || 0);
    var dw = (a.w || 0) - (b.w || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
  },

  /** Extrude 2D verts along Z by depth → returns 3D clone */
  extrude3D: function(verts2D, depth) {
    var clone = [];
    for (var i = 0; i < verts2D.length; i++) {
      clone.push({
        x: verts2D[i].x,
        y: verts2D[i].y,
        z: -depth  // offset away from camera (negative Z in p5 WEBGL)
      });
    }
    return clone;
  },

  /**
   * Build full 4D vertex set from 3D geometry.
   * Takes front face (z=0) + back face (z=-d), extrudes along W.
   * Returns { verts4D: [...], edges: [[i,j],...] }
   */
  extrude4D: function(front3D, back3D, wDepth) {
    // Layer A: original 3D at w=0
    // Layer B: original 3D at w=-wDepth
    var n = front3D.length;
    var verts = [];

    // Layer A front (indices 0..n-1)
    for (var i = 0; i < n; i++) {
      verts.push({ x: front3D[i].x, y: front3D[i].y, z: front3D[i].z || 0, w: 0 });
    }
    // Layer A back (indices n..2n-1)
    for (var i = 0; i < n; i++) {
      verts.push({ x: back3D[i].x, y: back3D[i].y, z: back3D[i].z, w: 0 });
    }
    // Layer B front (indices 2n..3n-1)
    for (var i = 0; i < n; i++) {
      verts.push({ x: front3D[i].x, y: front3D[i].y, z: front3D[i].z || 0, w: -wDepth });
    }
    // Layer B back (indices 3n..4n-1)
    for (var i = 0; i < n; i++) {
      verts.push({ x: back3D[i].x, y: back3D[i].y, z: back3D[i].z, w: -wDepth });
    }

    var edges = [];
    // Polygon edges within each layer-face
    var offsets = [0, n, 2 * n, 3 * n];
    for (var o = 0; o < offsets.length; o++) {
      for (var i = 0; i < n; i++) {
        edges.push([offsets[o] + i, offsets[o] + (i + 1) % n]);
      }
    }
    // Z-connecting edges (front↔back) in each W-layer
    for (var i = 0; i < n; i++) {
      edges.push([i, n + i]);             // layer A front↔back
      edges.push([2 * n + i, 3 * n + i]); // layer B front↔back
    }
    // W-connecting edges (layerA↔layerB) for each face
    for (var i = 0; i < n; i++) {
      edges.push([i, 2 * n + i]);             // front A↔front B
      edges.push([n + i, 3 * n + i]);         // back A↔back B
    }

    return { verts4D: verts, edges: edges };
  },

  /** Main step-up orchestrator */
  execute: function() {
    if (State.dimension === 2 && State.closed) {
      // 2D → 3D
      var depth = StepUp.zAmount(State.vertices2D);
      State.extrusionDepth = depth;
      // Convert 2D verts to 3D (z=0 for originals)
      var front = [];
      for (var i = 0; i < State.vertices2D.length; i++) {
        front.push({ x: State.vertices2D[i].x, y: State.vertices2D[i].y, z: 0 });
      }
      State.vertices3D = StepUp.extrude3D(State.vertices2D, depth);
      State.dimension = 3;
      State.rotationAngle = 0;

    } else if (State.dimension === 3) {
      // 3D → 4D
      var front = [];
      for (var i = 0; i < State.vertices2D.length; i++) {
        front.push({ x: State.vertices2D[i].x, y: State.vertices2D[i].y, z: 0 });
      }
      var allVerts3D = front.concat(State.vertices3D);
      var wDepth = StepUp.zAmount(allVerts3D);
      State.extrusionDepth4D = wDepth;
      var result = StepUp.extrude4D(front, State.vertices3D, wDepth);
      State.vertices4D = result.verts4D;
      State.edges4D = result.edges;
      State.dimension = 4;
      State.rotationAngle = 0;

    } else if (State.dimension === 4) {
      // 4D → back to 2D (preserve original vertices and closed state)
      State.dimension = 2;
      State.vertices3D = null;
      State.vertices4D = null;
      State.edges4D = null;
      State.extrusionDepth = 0;
      State.extrusionDepth4D = 0;
      State.rotationAngle = 0;
      // Keep vertices2D and closed intact
    }
  }
};
