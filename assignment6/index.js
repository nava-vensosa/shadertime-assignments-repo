import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Config ---
const TEX_SIZE = 256;
const PARTICLE_COUNT = TEX_SIZE * TEX_SIZE;
const ROOM_SIZE = 6;
const HALF = ROOM_SIZE / 2;

const TORCHES = [
  {
    pos: new THREE.Vector3(-HALF + 0.15, -0.8, -HALF + 0.15),
    color: new THREE.Color(1.0, 0.55, 0.1),
    emissive: 0xff6600,
    lightColor: 0xff7733,
  },
  {
    pos: new THREE.Vector3(HALF - 0.15, 0.5, -HALF + 0.15),
    color: new THREE.Color(0.2, 0.4, 1.0),
    emissive: 0x2266ff,
    lightColor: 0x3377ff,
  },
  {
    pos: new THREE.Vector3(-HALF + 0.15, -0.1, HALF - 0.15),
    color: new THREE.Color(0.7, 0.2, 1.0),
    emissive: 0x8822ff,
    lightColor: 0x9933ff,
  },
];

// --- Load shaders ---
async function loadShader(url) {
  const res = await fetch(url);
  return res.text();
}

const [renderVert, renderFrag, emissionVert, emissionFrag] = await Promise.all([
  loadShader('shaders/render.vert'),
  loadShader('shaders/render.frag'),
  loadShader('shaders/emission.vert'),
  loadShader('shaders/emission.frag'),
]);

// --- Renderer, Scene, Camera ---
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.autoClear = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping = true;

// --- Room ---
function createRoom() {
  const geo = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, ROOM_SIZE);
  geo.attributes.normal.array.forEach((_, i, arr) => { arr[i] *= -1; });
  const idx = geo.index.array;
  for (let i = 0; i < idx.length; i += 3) {
    const tmp = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = tmp;
  }
  const mat = new THREE.MeshStandardMaterial({
    color: 0x222222, roughness: 0.95, metalness: 0.0, side: THREE.FrontSide,
  });
  scene.add(new THREE.Mesh(geo, mat));
}
createRoom();

// --- Torches ---
function createTorch(torch) {
  const group = new THREE.Group();
  const stemGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x6b3a1f, roughness: 0.9 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, -0.1, 0);
  group.add(stem);

  const topGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const topMat = new THREE.MeshStandardMaterial({
    color: torch.emissive, emissive: torch.emissive, emissiveIntensity: 2.0, roughness: 0.5,
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.set(0, 0.3, 0);
  group.add(top);

  group.position.copy(torch.pos);
  scene.add(group);

  const light = new THREE.PointLight(torch.lightColor, 3.0, ROOM_SIZE * 1.5, 2);
  light.position.copy(torch.pos).add(new THREE.Vector3(0, 0.4, 0));
  scene.add(light);
}
TORCHES.forEach(createTorch);
scene.add(new THREE.AmbientLight(0x080808));

// --- Generate fog particles: uniform fill with stratified jitter ---
function generateParticles() {
  const data = new Float32Array(PARTICLE_COUNT * 4);
  const margin = 0.1;
  const lo = -HALF + margin;
  const hi = HALF - margin;
  const span = hi - lo;

  // Approximate cube root for even 3D distribution
  const side = Math.ceil(Math.cbrt(PARTICLE_COUNT));

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = i % side;
    const iy = Math.floor(i / side) % side;
    const iz = Math.floor(i / (side * side)) % side;

    // Stratified: grid cell center + jitter
    const x = lo + (ix + Math.random()) / side * span;
    const y = lo + (iy + Math.random()) / side * span;
    const z = lo + (iz + Math.random()) / side * span;

    const i4 = i * 4;
    data[i4] = x;
    data[i4 + 1] = y;
    data[i4 + 2] = z;
    data[i4 + 3] = 1.0;
  }

  return data;
}

console.log('Generating fog particles...');
const posData = generateParticles();
console.log('Done.');

// --- DataTexture (positions only) ---
const posTex = new THREE.DataTexture(posData, TEX_SIZE, TEX_SIZE, THREE.RGBAFormat, THREE.FloatType);
posTex.needsUpdate = true;
posTex.minFilter = THREE.NearestFilter;
posTex.magFilter = THREE.NearestFilter;

// --- Pass 1: Particle fog → offscreen buffer ---
const particleGeo = new THREE.BufferGeometry();
particleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));

const particleMat = new THREE.ShaderMaterial({
  uniforms: {
    uPositions: { value: posTex },
    uSize: { value: 200.0 },
    uTexSize: { value: new THREE.Vector2(TEX_SIZE, TEX_SIZE) },
    uTorch0: { value: TORCHES[0].pos },
    uTorch1: { value: TORCHES[1].pos },
    uTorch2: { value: TORCHES[2].pos },
    uTorchColor0: { value: new THREE.Vector3(TORCHES[0].color.r, TORCHES[0].color.g, TORCHES[0].color.b) },
    uTorchColor1: { value: new THREE.Vector3(TORCHES[1].color.r, TORCHES[1].color.g, TORCHES[1].color.b) },
    uTorchColor2: { value: new THREE.Vector3(TORCHES[2].color.r, TORCHES[2].color.g, TORCHES[2].color.b) },
  },
  vertexShader: renderVert,
  fragmentShader: renderFrag,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const particles = new THREE.Points(particleGeo, particleMat);
const particleScene = new THREE.Scene();
particleScene.add(particles);

const pr = Math.min(window.devicePixelRatio, 2);
const particleTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * pr, window.innerHeight * pr,
  { format: THREE.RGBAFormat, type: THREE.HalfFloatType }
);

// --- Pass 2: Emission blur ---
const emissionTarget = new THREE.WebGLRenderTarget(
  window.innerWidth * pr, window.innerHeight * pr,
  { format: THREE.RGBAFormat, type: THREE.HalfFloatType }
);

const emissionMat = new THREE.ShaderMaterial({
  uniforms: {
    uParticleBuffer: { value: particleTarget.texture },
    uResolution: { value: new THREE.Vector2(window.innerWidth * pr, window.innerHeight * pr) },
  },
  vertexShader: emissionVert,
  fragmentShader: emissionFrag,
  depthTest: false,
  depthWrite: false,
});

const emissionScene = new THREE.Scene();
const emissionCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
emissionScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), emissionMat));

// --- Pass 3: Composite ---
const compositeMat = new THREE.ShaderMaterial({
  uniforms: { uParticleLight: { value: emissionTarget.texture } },
  vertexShader: `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `,
  fragmentShader: `
    uniform sampler2D uParticleLight;
    varying vec2 vUv;
    void main() {
      vec4 light = texture2D(uParticleLight, vUv);
      gl_FragColor = vec4(light.rgb, 1.0);
    }
  `,
  transparent: true, depthTest: false, depthWrite: false,
  blending: THREE.AdditiveBlending,
});
const compositeScene = new THREE.Scene();
const compositeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
compositeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compositeMat));

// --- Resize ---
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  const pr = Math.min(window.devicePixelRatio, 2);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  particleTarget.setSize(w * pr, h * pr);
  emissionTarget.setSize(w * pr, h * pr);
  emissionMat.uniforms.uResolution.value.set(w * pr, h * pr);
});

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // Pass 1: fog particles → offscreen
  renderer.setRenderTarget(particleTarget);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(particleScene, camera);

  // Pass 2: blur/soften
  renderer.setRenderTarget(emissionTarget);
  renderer.clear();
  renderer.render(emissionScene, emissionCamera);

  // Pass 3: room + composite
  renderer.setRenderTarget(null);
  renderer.setClearColor(0x050505, 1);
  renderer.clear();
  renderer.render(scene, camera);
  renderer.render(compositeScene, compositeCamera);
}

animate();
