/* state.js — single shared application state */

var State = {
  dimension: 2,        // 2 | 3 | 4
  vertices2D: [],      // [{index, x, y}]
  closed: false,       // true after Close is pressed
  vertices3D: null,    // [{x,y,z}] — clone offset along Z
  vertices4D: null,    // [{x,y,z,w}] — all 4D verts (originals + clones)
  edges4D: null,       // edge pair indices for 4D wireframe
  extrusionDepth: 0,   // z-amount from step-up
  extrusionDepth4D: 0, // w-amount from second step-up
  rotationAngle: 0,    // accumulates each frame
  buttonFlash: {
    clear: 0,
    close: 0,
    stepup: 0
  }
};

State.reset = function() {
  State.dimension = 2;
  State.vertices2D = [];
  State.closed = false;
  State.vertices3D = null;
  State.vertices4D = null;
  State.edges4D = null;
  State.extrusionDepth = 0;
  State.extrusionDepth4D = 0;
  State.rotationAngle = 0;
  State.buttonFlash = { clear: 0, close: 0, stepup: 0 };
};
