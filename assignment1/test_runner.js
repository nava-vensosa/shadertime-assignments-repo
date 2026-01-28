#!/usr/bin/env node
/* test_runner.js — Node.js headless unit test runner for pure logic modules */

var passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { passed++; console.log('\x1b[32m PASS\x1b[0m ' + msg); }
  else      { failed++; console.log('\x1b[31m FAIL\x1b[0m ' + msg); }
}

function approx(a, b, eps) { return Math.abs(a - b) < (eps || 0.001); }

// --- Load modules by evaluating source (they attach to global/var) ---
var fs = require('fs');
var path = require('path');
var dir = __dirname;

function load(f) {
  var code = fs.readFileSync(path.join(dir, f), 'utf8');
  // Use Function() so `var` declarations become local, but we
  // need them global — use eval in this scope instead
  eval(code);
  // Hoist the key exports to global for later modules
  if (typeof State !== 'undefined') global.State = State;
  if (typeof Vertex !== 'undefined') global.Vertex = Vertex;
  if (typeof Edges !== 'undefined') global.Edges = Edges;
  if (typeof StepUp !== 'undefined') global.StepUp = StepUp;
  if (typeof Projection !== 'undefined') global.Projection = Projection;
  if (typeof Rotation !== 'undefined') global.Rotation = Rotation;
}

load('state.js');
load('vertex.js');
load('edges.js');
load('stepup.js');
load('projection.js');
load('rotation.js');

console.log('=== UNIT TESTS (Node.js) ===\n');

// -- Vertex --
State.reset();
Vertex.add(10, 20);
assert(Vertex.count() === 1, 'Vertex.add increments count to 1');
assert(State.vertices2D[0].x === 10 && State.vertices2D[0].y === 20,
  'Vertex stores correct coords');
assert(State.vertices2D[0].index === 0, 'First vertex index is 0');

Vertex.add(30, 40);
assert(Vertex.count() === 2, 'Vertex count is 2 after second add');
assert(State.vertices2D[1].index === 1, 'Second vertex index is 1');

Vertex.clear();
assert(Vertex.count() === 0, 'Vertex.clear resets count to 0');

// -- Edges.pairs --
var a = {x:0,y:0}, b = {x:1,y:0}, c = {x:1,y:1};
var p = Edges.pairs([a, b, c]);
assert(p.length === 3, 'Edges.pairs returns 3 pairs for 3 verts');
assert(p[0][0] === a && p[0][1] === b, 'Pair 0 is [a,b]');
assert(p[1][0] === b && p[1][1] === c, 'Pair 1 is [b,c]');
assert(p[2][0] === c && p[2][1] === a, 'Pair 2 is [c,a]');

var p1 = Edges.pairs([a]);
assert(p1.length === 1 && p1[0][0] === a && p1[0][1] === a,
  'Edges.pairs with 1 vert returns self-loop');

var p0 = Edges.pairs([]);
assert(p0.length === 0, 'Edges.pairs with 0 verts returns empty');

// -- StepUp.zAmount --
var triVerts = [{x:0,y:0},{x:3,y:4},{x:6,y:0}];
var z = StepUp.zAmount(triVerts);
assert(approx(z, 32/6, 0.01), 'StepUp.zAmount triangle ≈ 5.333 (got ' + z.toFixed(3) + ')');

var twoVerts = [{x:0,y:0},{x:10,y:0}];
assert(approx(StepUp.zAmount(twoVerts), 10, 0.01),
  'StepUp.zAmount for 2 verts at distance 10 = 10');

assert(StepUp.zAmount([{x:0,y:0}]) === 0,
  'StepUp.zAmount with 1 vert returns 0');

assert(StepUp.zAmount([]) === 0,
  'StepUp.zAmount with 0 verts returns 0');

// -- StepUp._dist --
assert(approx(StepUp._dist({x:0,y:0}, {x:3,y:4}), 5, 0.001),
  '_dist 2D: (0,0)→(3,4) = 5');
assert(approx(StepUp._dist({x:0,y:0,z:0}, {x:1,y:2,z:2}), 3, 0.001),
  '_dist 3D: (0,0,0)→(1,2,2) = 3');
assert(approx(StepUp._dist({x:1,y:0,z:0,w:0}, {x:0,y:0,z:0,w:0}), 1, 0.001),
  '_dist 4D: unit along x = 1');

// -- StepUp.extrude3D --
var src = [{x:1,y:2},{x:3,y:4}];
var cloned = StepUp.extrude3D(src, 5);
assert(cloned.length === 2, 'extrude3D returns same count');
assert(cloned[0].x === 1 && cloned[0].y === 2 && cloned[0].z === -5,
  'extrude3D offsets z by -depth');
assert(cloned[1].x === 3 && cloned[1].y === 4 && cloned[1].z === -5,
  'extrude3D second vertex correct');

// -- Projection.from4Dto3D --
var v4 = {x: 100, y: 50, z: 30, w: 0};
var p3 = Projection.from4Dto3D(v4, 400);
assert(p3.x === 100 && p3.y === 50 && p3.z === 30,
  'Projection at w=0 is identity');

var v4b = {x: 100, y: 50, z: 30, w: -200};
var p3b = Projection.from4Dto3D(v4b, 400);
var expectedScale = 400 / 600;
assert(approx(p3b.x, 100 * expectedScale, 0.1),
  'Projection at w=-200 scales x correctly (got ' + p3b.x.toFixed(2) + ')');
assert(approx(p3b.y, 50 * expectedScale, 0.1),
  'Projection at w=-200 scales y correctly');
assert(approx(p3b.z, 30 * expectedScale, 0.1),
  'Projection at w=-200 scales z correctly');

// -- Projection.projectAll --
var allP = Projection.projectAll([v4, v4b], 400);
assert(allP.length === 2, 'projectAll returns correct count');
assert(allP[0].x === 100, 'projectAll[0] matches single projection');

// -- Rotation.apply4D --
var rv = [{x: 100, y: 0, z: 0, w: 0}];
var rotated = Rotation.apply4D(rv, Math.PI / 2);
assert(approx(rotated[0].x, 0, 0.1) && approx(rotated[0].w, 100, 0.1),
  'Rotation.apply4D 90° moves x to w');

var rotated2 = Rotation.apply4D(rv, 0);
assert(approx(rotated2[0].x, 100, 0.01) && approx(rotated2[0].w, 0, 0.01),
  'Rotation.apply4D 0° is identity');

var rotatedPi = Rotation.apply4D(rv, Math.PI);
assert(approx(rotatedPi[0].x, -100, 0.1) && approx(rotatedPi[0].w, 0, 0.1),
  'Rotation.apply4D 180° negates x');

// Verify Y and Z are unchanged
assert(rotated[0].y === 0 && rotated[0].z === 0,
  'Rotation.apply4D does not affect y or z');

// -- StepUp.extrude4D --
var front = [{x:0,y:0,z:0},{x:10,y:0,z:0}];
var back  = [{x:0,y:0,z:-5},{x:10,y:0,z:-5}];
var r4 = StepUp.extrude4D(front, back, 7);
assert(r4.verts4D.length === 8, 'extrude4D: 2 verts × 4 layers = 8');
assert(r4.verts4D[0].w === 0, 'Layer A has w=0');
assert(r4.verts4D[4].w === -7, 'Layer B has w=-wDepth');
// Edges: 4 polygon loops (each 2 edges) = 8, z-connects (2 per layer × 2) = 4, w-connects (2 per face × 2) = 4 → 16
assert(r4.edges.length === 16, 'extrude4D edge count = ' + r4.edges.length);

// Verify edge index bounds
var maxIdx = r4.verts4D.length - 1;
var allInBounds = r4.edges.every(function(e) { return e[0] >= 0 && e[0] <= maxIdx && e[1] >= 0 && e[1] <= maxIdx; });
assert(allInBounds, 'All 4D edge indices are within bounds');

// -- StepUp.execute (full cycle) --
State.reset();
Vertex.add(0, 0);
Vertex.add(100, 0);
Vertex.add(100, 100);
Vertex.add(0, 100);
State.closed = true;

// 2D → 3D
StepUp.execute();
assert(State.dimension === 3, 'execute: 2D→3D sets dimension=3');
assert(State.vertices3D !== null, 'execute: vertices3D populated');
assert(State.vertices3D.length === 4, 'execute: 4 clone vertices');
assert(State.extrusionDepth > 0, 'execute: extrusion depth > 0');

// 3D → 4D
StepUp.execute();
assert(State.dimension === 4, 'execute: 3D→4D sets dimension=4');
assert(State.vertices4D !== null, 'execute: vertices4D populated');
assert(State.edges4D !== null, 'execute: edges4D populated');

// 4D → 2D (loop)
StepUp.execute();
assert(State.dimension === 2, 'execute: 4D→2D loops back');
assert(State.vertices3D === null, 'execute: 3D data cleared');
assert(State.vertices4D === null, 'execute: 4D data cleared');
assert(State.vertices2D.length === 4, 'execute: 2D vertices preserved');
assert(State.closed === true, 'execute: closed state preserved');

// -- State.reset --
State.dimension = 4;
State.closed = true;
State.reset();
assert(State.dimension === 2, 'State.reset restores dimension to 2');
assert(State.closed === false, 'State.reset clears closed flag');
assert(State.vertices2D.length === 0, 'State.reset clears vertices');

// -- Rotation.tick --
State.rotationAngle = 0;
Rotation.tick(1000); // 1 second
assert(approx(State.rotationAngle, 0.8, 0.01),
  'Rotation.tick(1000ms) adds ~0.8 rad (got ' + State.rotationAngle.toFixed(3) + ')');

// === Summary ===
console.log('\n=== RESULTS: ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed > 0 ? 1 : 0);
