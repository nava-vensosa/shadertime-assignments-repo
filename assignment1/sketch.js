/* sketch.js — p5.js main loop */

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  State.reset();
  Buttons.init();
  // Run unit tests if ?test is in the URL
  if (typeof window._runTests === 'function') {
    window._runTests();
  }
}

function draw() {
  background(128);
  Buttons.update();

  if (State.dimension === 2) {
    _draw2D();
  } else if (State.dimension === 3) {
    _draw3D();
  } else if (State.dimension === 4) {
    _draw4D();
  }
}

/* --- 2D rendering --- */

function _draw2D() {
  // Draw vertices as white dots
  push();
  stroke(255);
  strokeWeight(6);
  for (var i = 0; i < State.vertices2D.length; i++) {
    var v = State.vertices2D[i];
    point(v.x, v.y, 0);
  }
  pop();

  // Draw edges if closed
  if (State.closed && State.vertices2D.length >= 2) {
    push();
    var pairs = Edges.pairs(State.vertices2D);
    Edges.drawEdges(pairs, false);
    pop();
  }
}

/* --- 3D rendering --- */

function _draw3D() {
  Rotation.tick(deltaTime);
  rotateY(State.rotationAngle);

  var n = State.vertices2D.length;

  // Build front face verts with z=0
  var front = [];
  for (var i = 0; i < n; i++) {
    front.push({ x: State.vertices2D[i].x, y: State.vertices2D[i].y, z: 0 });
  }
  var back = State.vertices3D;

  // Draw vertices
  push();
  stroke(255);
  strokeWeight(6);
  for (var i = 0; i < n; i++) {
    point(front[i].x, front[i].y, front[i].z);
    point(back[i].x, back[i].y, back[i].z);
  }
  pop();

  // Draw edges
  push();
  var frontPairs = Edges.pairs(front);
  var backPairs = Edges.pairs(back);
  Edges.drawEdges(frontPairs, true);
  Edges.drawEdges(backPairs, true);
  Edges.drawBetween(front, back);
  pop();
}

/* --- 4D rendering --- */

function _draw4D() {
  Rotation.tick(deltaTime);

  // Rotate in XW plane, then project 4D → 3D
  var rotated = Rotation.apply4D(State.vertices4D, State.rotationAngle);
  var projected = Projection.projectAll(rotated, State.extrusionDepth4D * 3);

  // Additional Y-axis tumble for visual depth
  rotateY(State.rotationAngle * 0.3);

  // Draw vertices
  push();
  stroke(255);
  strokeWeight(6);
  for (var i = 0; i < projected.length; i++) {
    var v = projected[i];
    point(v.x, v.y, v.z);
  }
  pop();

  // Draw edges
  push();
  stroke(57, 255, 20, 220);
  strokeWeight(2.5);
  noFill();
  for (var i = 0; i < State.edges4D.length; i++) {
    var e = State.edges4D[i];
    var a = projected[e[0]];
    var b = projected[e[1]];
    line(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  pop();
}

/* --- interaction --- */

function mousePressed() {
  // Don't place vertices if clicking a button
  if (Buttons.isOverAny(mouseX, mouseY)) return;
  // Don't place vertices if not in 2D mode
  if (State.dimension !== 2) return;
  // Don't place vertices if already closed (must Clear first to add more)
  if (State.closed) return;

  // Convert screen coords to WEBGL centre-origin coords
  var wx = mouseX - width / 2;
  var wy = mouseY - height / 2;
  Vertex.add(wx, wy);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
