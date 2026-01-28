/* tests.js — unit tests, loaded only when ?test is in the URL */

(function() {
  if (window.location.search.indexOf('test') === -1) return;

  var passed = 0;
  var failed = 0;

  function assert(condition, msg) {
    if (condition) {
      passed++;
      console.log('%c PASS: ' + msg, 'color: #0f0');
    } else {
      failed++;
      console.error('FAIL: ' + msg);
    }
  }

  function approx(a, b, eps) {
    return Math.abs(a - b) < (eps || 0.001);
  }

  /* --- run after p5 setup completes --- */
  window._runTests = function() {
    console.log('%c=== UNIT TESTS ===', 'font-weight:bold;font-size:14px');

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

    // single vert
    var p1 = Edges.pairs([a]);
    assert(p1.length === 1 && p1[0][0] === a && p1[0][1] === a,
      'Edges.pairs with 1 vert returns self-loop');

    // -- StepUp.zAmount --
    // Equilateral-ish: (0,0)→(3,4)→(6,0) has sides 5, ~5.385, ~6.083
    // Each vertex sums dist to prev + dist to next → total / count
    // v0: d(v0,v2)+d(v0,v1) = 6 + 5 = 11
    // v1: d(v1,v0)+d(v1,v2) = 5 + sqrt(9+16) = 5 + 5 = 10  wait...
    // Actually: v0=(0,0) v1=(3,4) v2=(6,0)
    // d(v0,v1)=5, d(v1,v2)=sqrt(9+16)=5, d(v2,v0)=6
    // v0: prev=v2, next=v1 → 6 + 5 = 11
    // v1: prev=v0, next=v2 → 5 + 5 = 10
    // v2: prev=v1, next=v0 → 5 + 6 = 11
    // total = 32, count = 6, avg = 32/6 ≈ 5.333
    var triVerts = [{x:0,y:0},{x:3,y:4},{x:6,y:0}];
    var z = StepUp.zAmount(triVerts);
    assert(approx(z, 32/6, 0.01), 'StepUp.zAmount triangle ≈ 5.333 (got ' + z.toFixed(3) + ')');

    // Two verts: (0,0) and (10,0) → each has prev=next (wraps), dists are both 10
    // v0: d(v0,v1)+d(v0,v1)=20, v1: d(v1,v0)+d(v1,v0)=20, total=40, count=4 → 10
    var twoVerts = [{x:0,y:0},{x:10,y:0}];
    assert(approx(StepUp.zAmount(twoVerts), 10, 0.01),
      'StepUp.zAmount for 2 verts at distance 10 = 10');

    // -- StepUp.extrude3D --
    var src = [{x:1,y:2},{x:3,y:4}];
    var cloned = StepUp.extrude3D(src, 5);
    assert(cloned.length === 2, 'extrude3D returns same count');
    assert(cloned[0].x === 1 && cloned[0].y === 2 && cloned[0].z === -5,
      'extrude3D offsets z by -depth');

    // -- Projection.from4Dto3D --
    var v4 = {x: 100, y: 50, z: 30, w: 0};
    var p3 = Projection.from4Dto3D(v4, 400);
    // w=0 → scale = 400/(400-0) = 1 → no change
    assert(p3.x === 100 && p3.y === 50 && p3.z === 30,
      'Projection at w=0 is identity');

    var v4b = {x: 100, y: 50, z: 30, w: -200};
    var p3b = Projection.from4Dto3D(v4b, 400);
    // scale = 400/(400-(-200)) = 400/600 ≈ 0.6667
    assert(approx(p3b.x, 100 * (400/600), 0.1),
      'Projection at w=-200 scales correctly (got ' + p3b.x.toFixed(2) + ')');

    // -- Rotation.apply4D --
    var rv = [{x: 100, y: 0, z: 0, w: 0}];
    var rotated = Rotation.apply4D(rv, Math.PI / 2);
    // x*cos(90)-w*sin(90) = 0, w=x*sin(90)+w*cos(90)=100
    assert(approx(rotated[0].x, 0, 0.1) && approx(rotated[0].w, 100, 0.1),
      'Rotation.apply4D 90° moves x to w');

    var rotated2 = Rotation.apply4D(rv, 0);
    assert(approx(rotated2[0].x, 100, 0.01) && approx(rotated2[0].w, 0, 0.01),
      'Rotation.apply4D 0° is identity');

    // -- StepUp.extrude4D --
    var front = [{x:0,y:0,z:0},{x:10,y:0,z:0}];
    var back  = [{x:0,y:0,z:-5},{x:10,y:0,z:-5}];
    var r4 = StepUp.extrude4D(front, back, 7);
    assert(r4.verts4D.length === 8, 'extrude4D: 2 verts × 4 layers = 8');
    assert(r4.verts4D[0].w === 0, 'Layer A has w=0');
    assert(r4.verts4D[4].w === -7, 'Layer B has w=-wDepth');
    // Edges: 4 polygon loops × 2 edges + 2 z-connects × 2 layers + 2 w-connects × 2 faces = 8+4+4=16
    assert(r4.edges.length === 16, 'extrude4D edge count: ' + r4.edges.length);

    // -- State.reset --
    State.dimension = 4;
    State.closed = true;
    State.reset();
    assert(State.dimension === 2, 'State.reset restores dimension to 2');
    assert(State.closed === false, 'State.reset clears closed flag');
    assert(State.vertices2D.length === 0, 'State.reset clears vertices');

    // -- Buttons.hitTest (synthetic) --
    // Can't easily test DOM positions in unit test, so skip with note
    console.log('%c SKIP: Buttons.hitTest requires DOM layout', 'color: #ff0');

    // -- Summary --
    console.log('%c=== RESULTS: ' + passed + ' passed, ' + failed + ' failed ===',
      'font-weight:bold;font-size:14px;color:' + (failed ? '#f00' : '#0f0'));

    // Show results on page
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,0,0.85);' +
      'color:' + (failed ? '#f44' : '#0f0') + ';padding:12px 20px;font-family:monospace;' +
      'font-size:14px;border-radius:6px;z-index:100;';
    div.textContent = 'Tests: ' + passed + ' passed, ' + failed + ' failed';
    document.body.appendChild(div);
  };
})();
