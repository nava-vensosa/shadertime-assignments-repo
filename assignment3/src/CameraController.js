import * as THREE from 'three';

export default class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Spherical coordinates
    this.radius = 30;
    this.theta = Math.PI / 4;   // azimuthal angle
    this.phi = Math.PI / 3;     // polar angle

    this.minRadius = 5;
    this.maxRadius = 150;
    this.minPhi = 0.1;
    this.maxPhi = Math.PI - 0.1;

    // Damping
    this.zoomDamping = 0.1;
    this.rotateDamping = 0.08;

    this.targetRadius = this.radius;
    this.targetTheta = this.theta;
    this.targetPhi = this.phi;

    // Drag state (mouse + touch)
    this._isDragging = false;
    this._prevMouse = { x: 0, y: 0 };
    this._rotateSpeed = 0.005;

    // Touch pinch state
    this._pinchStartDist = 0;
    this._isPinching = false;

    this._bindEvents();
    this._updatePosition();
  }

  _bindEvents() {
    // Mouse events
    this.domElement.addEventListener('wheel', this._onWheel.bind(this), { passive: false });
    this.domElement.addEventListener('mousedown', this._onMouseDown.bind(this));
    this.domElement.addEventListener('mousemove', this._onMouseMove.bind(this));
    this.domElement.addEventListener('mouseup', this._onMouseUp.bind(this));
    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    // Touch events
    this.domElement.addEventListener('touchstart', this._onTouchStart.bind(this), { passive: false });
    this.domElement.addEventListener('touchmove', this._onTouchMove.bind(this), { passive: false });
    this.domElement.addEventListener('touchend', this._onTouchEnd.bind(this));
  }

  // --- Mouse handlers ---

  _onWheel(e) {
    e.preventDefault();
    const zoomFactor = 1 + e.deltaY * 0.001;
    this.targetRadius = THREE.MathUtils.clamp(
      this.targetRadius * zoomFactor,
      this.minRadius,
      this.maxRadius
    );
  }

  _onMouseDown(e) {
    if (e.button === 2) { // right-click
      this._isDragging = true;
      this._prevMouse.x = e.clientX;
      this._prevMouse.y = e.clientY;
    }
  }

  _onMouseMove(e) {
    if (!this._isDragging) return;

    const dx = e.clientX - this._prevMouse.x;
    const dy = e.clientY - this._prevMouse.y;

    this.targetTheta -= dx * this._rotateSpeed;
    this.targetPhi = THREE.MathUtils.clamp(
      this.targetPhi - dy * this._rotateSpeed,
      this.minPhi,
      this.maxPhi
    );

    this._prevMouse.x = e.clientX;
    this._prevMouse.y = e.clientY;
  }

  _onMouseUp(e) {
    if (e.button === 2) {
      this._isDragging = false;
    }
  }

  // --- Touch handlers ---

  _getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  _onTouchStart(e) {
    e.preventDefault();

    if (e.touches.length === 2) {
      // Two-finger pinch start
      this._isPinching = true;
      this._isDragging = false;
      this._pinchStartDist = this._getTouchDistance(e.touches[0], e.touches[1]);
      this._pinchStartRadius = this.targetRadius;
    } else if (e.touches.length === 1) {
      // Single-finger orbit start
      this._isDragging = true;
      this._isPinching = false;
      this._prevMouse.x = e.touches[0].clientX;
      this._prevMouse.y = e.touches[0].clientY;
    }
  }

  _onTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 2 && this._isPinching) {
      // Pinch zoom
      const dist = this._getTouchDistance(e.touches[0], e.touches[1]);
      const scale = this._pinchStartDist / dist;
      this.targetRadius = THREE.MathUtils.clamp(
        this._pinchStartRadius * scale,
        this.minRadius,
        this.maxRadius
      );
    } else if (e.touches.length === 1 && this._isDragging) {
      // Single-finger orbit
      const dx = e.touches[0].clientX - this._prevMouse.x;
      const dy = e.touches[0].clientY - this._prevMouse.y;

      this.targetTheta -= dx * this._rotateSpeed;
      this.targetPhi = THREE.MathUtils.clamp(
        this.targetPhi - dy * this._rotateSpeed,
        this.minPhi,
        this.maxPhi
      );

      this._prevMouse.x = e.touches[0].clientX;
      this._prevMouse.y = e.touches[0].clientY;
    }
  }

  _onTouchEnd(e) {
    if (e.touches.length < 2) {
      this._isPinching = false;
    }
    if (e.touches.length === 0) {
      this._isDragging = false;
    }
  }

  _updatePosition() {
    const x = this.radius * Math.sin(this.phi) * Math.cos(this.theta);
    const y = this.radius * Math.cos(this.phi);
    const z = this.radius * Math.sin(this.phi) * Math.sin(this.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }

  update() {
    // Smooth damping
    this.radius += (this.targetRadius - this.radius) * this.zoomDamping;
    this.theta += (this.targetTheta - this.theta) * this.rotateDamping;
    this.phi += (this.targetPhi - this.phi) * this.rotateDamping;

    this._updatePosition();
  }

  isDragging() {
    return this._isDragging || this._isPinching;
  }
}
