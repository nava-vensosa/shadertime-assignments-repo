import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Config ---
const ROOM_SIZE = 6;
const HALF = ROOM_SIZE / 2;
const GRID_RES = 64;

const TORCHES = [
  {
    pos: new THREE.Vector3(-HALF + 0.15, -0.8, -HALF + 0.15),
    color: new THREE.Color(1.0, 0.55, 0.1),
    emissive: 0xff6600,
  },
  {
    pos: new THREE.Vector3(HALF - 0.15, 0.5, -HALF + 0.15),
    color: new THREE.Color(0.2, 0.4, 1.0),
    emissive: 0x2266ff,
  },
  {
    pos: new THREE.Vector3(-HALF + 0.15, -0.1, HALF - 0.15),
    color: new THREE.Color(0.7, 0.2, 1.0),
    emissive: 0x8822ff,
  },
];

// --- Load shaders ---
async function loadShader(url) {
  const res = await fetch(url);
  return res.text();
}

const [roomVert, roomFrag] = await Promise.all([
  loadShader('shaders/room.vert'),
  loadShader('shaders/room.frag'),
]);

// --- Renderer, Scene, Camera ---
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1, 5);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.enableDamping = true;

// --- Obstacles ---
const BOX_POSITIONS = [
  [0, -HALF + 0.4, 0],
  [1.5, -HALF + 0.25, -1.0],
  [-1.0, -HALF + 0.6, 1.0],
  [HALF - 0.4, -0.3, HALF - 0.4],
];
const BOX_SIZES = [
  [0.8, 0.8, 0.8],
  [0.5, 0.5, 0.5],
  [0.4, 1.2, 0.4],
  [0.6, 0.6, 0.6],
];

// --- Bake lightmap directly from torch falloff ---
// Instead of generating particles and splatting, we compute the fog light
// analytically: each voxel receives isotropic light from each torch with
// inverse-square falloff, like a fog of fireflies whose density is uniform
// but emission strength depends on proximity to torches.
function bakeLightmap() {
  console.log('Baking fog lightmap...');
  const N = GRID_RES;
  const volumeR = new Float32Array(N * N * N);
  const volumeG = new Float32Array(N * N * N);
  const volumeB = new Float32Array(N * N * N);
  const cellSize = ROOM_SIZE / N;

  for (let z = 0; z < N; z++)
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        // World position of voxel center
        const wx = -HALF + (x + 0.5) * cellSize;
        const wy = -HALF + (y + 0.5) * cellSize;
        const wz = -HALF + (z + 0.5) * cellSize;

        let r = 0, g = 0, b = 0;

        for (const t of TORCHES) {
          const dx = wx - t.pos.x;
          const dy = wy - t.pos.y;
          const dz = wz - t.pos.z;
          const dist2 = dx * dx + dy * dy + dz * dz;
          // Inverse-square falloff with soft knee
          const intensity = 1.0 / (1.0 + dist2);
          r += t.color.r * intensity;
          g += t.color.g * intensity;
          b += t.color.b * intensity;
        }

        const idx = x + y * N + z * N * N;
        volumeR[idx] = r;
        volumeG[idx] = g;
        volumeB[idx] = b;
      }

  // Blur for soft fog diffusion
  function blur(vol) {
    const tmp = new Float32Array(N * N * N);
    for (let z = 0; z < N; z++)
      for (let y = 0; y < N; y++)
        for (let x = 0; x < N; x++) {
          let sum = 0, count = 0;
          for (let dz = -1; dz <= 1; dz++)
            for (let dy = -1; dy <= 1; dy++)
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy, nz = z + dz;
                if (nx >= 0 && nx < N && ny >= 0 && ny < N && nz >= 0 && nz < N) {
                  sum += vol[nx + ny * N + nz * N * N];
                  count++;
                }
              }
          tmp[x + y * N + z * N * N] = sum / count;
        }
    vol.set(tmp);
  }

  for (let pass = 0; pass < 3; pass++) {
    blur(volumeR); blur(volumeG); blur(volumeB);
  }

  // Pack into 2D atlas
  const texW = N * N, texH = N;
  const texData = new Float32Array(texW * texH * 4);
  for (let z = 0; z < N; z++)
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) {
        const volIdx = x + y * N + z * N * N;
        const texX = z * N + x;
        const texIdx = (texX + y * texW) * 4;
        texData[texIdx] = volumeR[volIdx];
        texData[texIdx + 1] = volumeG[volIdx];
        texData[texIdx + 2] = volumeB[volIdx];
        texData[texIdx + 3] = 1.0;
      }

  console.log('Lightmap baked.');
  const tex = new THREE.DataTexture(texData, texW, texH, THREE.RGBAFormat, THREE.FloatType);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

const lightmapTex = bakeLightmap();

// --- Room with lightmap shader ---
const roomUniforms = {
  uLightmapX: { value: lightmapTex },
  uGridRes: { value: GRID_RES },
  uRoomSize: { value: ROOM_SIZE },
  uBaseColor: { value: new THREE.Vector3(0.7, 0.7, 0.7) },
};

function createLitRoom() {
  const geo = new THREE.BoxGeometry(ROOM_SIZE, ROOM_SIZE, ROOM_SIZE);
  geo.attributes.normal.array.forEach((_, i, arr) => { arr[i] *= -1; });
  const idx = geo.index.array;
  for (let i = 0; i < idx.length; i += 3) {
    const tmp = idx[i]; idx[i] = idx[i + 2]; idx[i + 2] = tmp;
  }
  const mat = new THREE.ShaderMaterial({
    uniforms: roomUniforms,
    vertexShader: roomVert,
    fragmentShader: roomFrag,
    side: THREE.FrontSide,
  });
  scene.add(new THREE.Mesh(geo, mat));
}
createLitRoom();

// --- Torches ---
function createTorch(torch) {
  const group = new THREE.Group();
  const stemGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
  const stemMat = new THREE.ShaderMaterial({
    uniforms: { ...roomUniforms, uBaseColor: { value: new THREE.Vector3(0.42, 0.23, 0.12) } },
    vertexShader: roomVert,
    fragmentShader: roomFrag,
  });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, -0.1, 0);
  group.add(stem);

  const topGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const topMat = new THREE.MeshBasicMaterial({ color: torch.emissive });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.set(0, 0.3, 0);
  group.add(top);

  group.position.copy(torch.pos);
  scene.add(group);
}
TORCHES.forEach(createTorch);

// --- Objects ---
for (let i = 0; i < BOX_POSITIONS.length; i++) {
  const geo = new THREE.BoxGeometry(...BOX_SIZES[i]);
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...roomUniforms, uBaseColor: { value: new THREE.Vector3(0.8, 0.8, 0.8) } },
    vertexShader: roomVert,
    fragmentShader: roomFrag,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...BOX_POSITIONS[i]);
  scene.add(mesh);
}

// --- Resize ---
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// --- Animation Loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
