import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import GUI from 'lil-gui';

// Load shader files
async function loadShader(url) {
  const res = await fetch(url);
  return res.text();
}

const [vertexShader, fragmentShader] = await Promise.all([
  loadShader('shaders/remap.vert'),
  loadShader('shaders/remap.frag'),
]);

// Webcam setup
const video = document.createElement('video');
video.autoplay = true;
video.playsInline = true;
video.muted = true;

const stream = await navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
});
video.srcObject = stream;
await video.play();

const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// Three.js setup
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// Fullscreen quad with webcam texture
const quadGeom = new THREE.PlaneGeometry(2, 2);
const quadMat = new THREE.MeshBasicMaterial({ map: videoTexture });
scene.add(new THREE.Mesh(quadGeom, quadMat));

// Custom remap shader definition
const RemapShader = {
  uniforms: {
    tDiffuse: { value: null },
    uColorLeft: { value: new THREE.Color(1, 0, 0) },
    uColorMid: { value: new THREE.Color(0, 1, 0) },
    uColorRight: { value: new THREE.Color(0, 0, 1) },
    uMidPos: { value: 0.5 },
  },
  vertexShader,
  fragmentShader,
};

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const remapPass = new ShaderPass(RemapShader);
remapPass.renderToScreen = true;
composer.addPass(remapPass);

// GUI params
const params = {
  leftColor: '#ff0000',
  midColor: '#00ff00',
  rightColor: '#0000ff',
  midPosition: 0.5,
};

function hexToVec3(hex) {
  const c = new THREE.Color(hex);
  return c;
}

function updateUniforms() {
  remapPass.uniforms.uColorLeft.value.set(params.leftColor);
  remapPass.uniforms.uColorMid.value.set(params.midColor);
  remapPass.uniforms.uColorRight.value.set(params.rightColor);
  remapPass.uniforms.uMidPos.value = params.midPosition;
  drawCustomGradient();
}

// Gradient canvases
const standardCanvas = document.getElementById('gradient-standard');
const customCanvas = document.getElementById('gradient-custom');
standardCanvas.width = 400;
standardCanvas.height = 24;
customCanvas.width = 400;
customCanvas.height = 24;

function drawStandardGradient() {
  const ctx = standardCanvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 400, 0);
  grad.addColorStop(0, 'hsl(0, 100%, 50%)');
  grad.addColorStop(1 / 6, 'hsl(60, 100%, 50%)');
  grad.addColorStop(2 / 6, 'hsl(120, 100%, 50%)');
  grad.addColorStop(3 / 6, 'hsl(180, 100%, 50%)');
  grad.addColorStop(4 / 6, 'hsl(240, 100%, 50%)');
  grad.addColorStop(5 / 6, 'hsl(300, 100%, 50%)');
  grad.addColorStop(1, 'hsl(360, 100%, 50%)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 24);
}

function drawCustomGradient() {
  const ctx = customCanvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 400, 0);
  grad.addColorStop(0, params.leftColor);
  grad.addColorStop(params.midPosition, params.midColor);
  grad.addColorStop(1, params.rightColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 24);
}

drawStandardGradient();
drawCustomGradient();

// lil-gui
const gui = new GUI({ width: 350 });
gui.domElement.style.setProperty('--widget-height', '32px');
gui.domElement.style.fontSize = '14px';

const leftFolder = gui.addFolder('Left Endpoint');
leftFolder.addColor(params, 'leftColor').name('Color').onChange(updateUniforms);

const midFolder = gui.addFolder('Midpoint');
midFolder.addColor(params, 'midColor').name('Color').onChange(updateUniforms);
midFolder.add(params, 'midPosition', 0.01, 0.99, 0.01).name('Position').onChange(updateUniforms);

const rightFolder = gui.addFolder('Right Endpoint');
rightFolder.addColor(params, 'rightColor').name('Color').onChange(updateUniforms);

// Resize handler
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  composer.render();
}
animate();
