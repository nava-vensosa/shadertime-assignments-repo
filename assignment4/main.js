import * as THREE from 'three';

// Infrastructure
const A = innerWidth / innerHeight, FW = 4 * A, FH = 4;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-FW, FW, FH, -FH, .1, 100);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('canvas') });
renderer.setSize(innerWidth, innerHeight);

// 1. Import shader files
const [vert, frag] = await Promise.all(
  ['shader.vert', 'shader.frag'].map(f => fetch(f).then(r => r.text()))
);

// 2. Initialize geometry (shared across all 3 instances)
const geo = new THREE.SphereGeometry(1, 8, 6).toNonIndexed();
geo.computeVertexNormals();
const n = geo.attributes.position.count, p = geo.attributes.position.array;
const cent = new Float32Array(n * 3);
for (let i = 0; i < n; i += 3) {
  const cx = (p[i*3]+p[i*3+3]+p[i*3+6])/3;
  const cy = (p[i*3+1]+p[i*3+4]+p[i*3+7])/3;
  const cz = (p[i*3+2]+p[i*3+5]+p[i*3+8])/3;
  cent.set([cx,cy,cz, cx,cy,cz, cx,cy,cz], i * 3);
}
geo.setAttribute('a_centroid', new THREE.BufferAttribute(cent, 3));

// Per-instance attributes (one value per instance, not per vertex)
const redPos  = new THREE.Vector3(-FW+1,  FH-1, 5);
const bluePos = new THREE.Vector3( FW-1, -FH+1, -5);
geo.setAttribute('a_color',   new THREE.InstancedBufferAttribute(
  new Float32Array([1,.1,.1,  .1,.2,1,  1,1,1]), 3));
geo.setAttribute('a_isWhite', new THREE.InstancedBufferAttribute(
  new Float32Array([0, 0, 1]), 1));
const offsetAttr = new THREE.InstancedBufferAttribute(
  new Float32Array([redPos.x,redPos.y,redPos.z,  bluePos.x,bluePos.y,bluePos.z,  0,0,0]), 3);
geo.setAttribute('a_offset', offsetAttr);

// Shared uniforms
const shared = {
  u_cursor:     { value: new THREE.Vector2() },
  u_resolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
  u_halfSize:   { value: new THREE.Vector2(FW, FH) },
  u_falloff:    { value: Math.hypot(FW*2, FH*2) * 2/3 },
  u_redPos:     { value: redPos },
  u_bluePos:    { value: bluePos },
};

// 3. Single material + InstancedMesh
const mat = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3, vertexShader: vert, fragmentShader: frag,
  uniforms: shared,
});
const mesh = new THREE.InstancedMesh(geo, mat, 3);
const identity = new THREE.Matrix4();
for (let i = 0; i < 3; i++) mesh.setMatrixAt(i, identity);
scene.add(mesh);

// Cursor forwarding
window.onmousemove = e =>
  shared.u_cursor.value.set(e.clientX/innerWidth*2-1, -(e.clientY/innerHeight)*2+1);

// Render
let tick = 0;
renderer.setAnimationLoop(() => {
  const t = (Math.sin(tick++ * 0.02) + 1) * 0.5; // 0 → 1, oscillating
  redPos.z  =  5 - 10 * t;  // 5 → -5
  bluePos.z = -5 + 10 * t;  // -5 → 5
  offsetAttr.array[2] = redPos.z;
  offsetAttr.array[5] = bluePos.z;
  offsetAttr.needsUpdate = true;
  renderer.render(scene, camera);
});
