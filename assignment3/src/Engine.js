import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import CameraController from './CameraController.js';

export default class Engine {
  constructor(canvas) {
    this.canvas = canvas;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x0a0a1a);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.008);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);

    // Camera controller
    this.cameraController = new CameraController(this.camera, canvas);

    // Ambient light
    this.scene.add(new THREE.AmbientLight(0x222244, 0.5));

    // Stars background
    this._createStars();

    // Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Clock
    this.clock = new THREE.Clock();
    this.elapsed = 0;

    // State
    this.sun = null;
    this.selectedBody = null;
    this.onSelect = null;

    // Touch tap detection state
    this._touchStartPos = null;
    this._touchStartTime = 0;

    // Events
    canvas.addEventListener('click', this._onClick.bind(this));
    canvas.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: true });
    canvas.addEventListener('touchend', this._onTouchEnd.bind(this), { passive: true });
    window.addEventListener('resize', this._onResize.bind(this));
  }

  _createStars() {
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.8 });
    this.scene.add(new THREE.Points(starGeo, starMat));
  }

  setSun(sun) {
    if (this.sun) {
      this.scene.remove(this.sun.group);
    }
    this.sun = sun;
    this.scene.add(sun.group);
    sun._buildRays();
  }

  _onClick(e) {
    if (this.cameraController.isDragging()) return;
    if (e.button !== 0) return;
    this._doRaycast(e.clientX, e.clientY);
  }

  _onTouchStart(e) {
    if (e.touches.length === 1) {
      this._touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      this._touchStartTime = performance.now();
    }
  }

  _onTouchEnd(e) {
    if (!this._touchStartPos) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this._touchStartPos.x;
    const dy = touch.clientY - this._touchStartPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const elapsed = performance.now() - this._touchStartTime;

    this._touchStartPos = null;

    // Tap: short duration, minimal movement
    if (dist < 15 && elapsed < 300) {
      this._doRaycast(touch.clientX, touch.clientY);
    }
  }

  _doRaycast(clientX, clientY) {
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = [];
    this.scene.traverse((obj) => {
      if (obj.isMesh && obj.userData.body) {
        meshes.push(obj);
      }
    });

    const intersects = this.raycaster.intersectObjects(meshes, false);
    if (intersects.length > 0) {
      const body = intersects[0].object.userData.body;
      this.selectedBody = body;
      if (this.onSelect) this.onSelect(body);
    } else {
      this.selectedBody = null;
      if (this.onSelect) this.onSelect(null);
    }
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    // Update all LineMaterial resolutions for fat lines
    this.scene.traverse((obj) => {
      if (obj.material instanceof LineMaterial) {
        obj.material.resolution.set(w, h);
      }
    });
  }

  start() {
    const animate = () => {
      requestAnimationFrame(animate);

      const dt = this.clock.getDelta();
      this.elapsed += dt;

      this.cameraController.update();

      if (this.sun) {
        this.sun.update(dt, this.elapsed);
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
}
