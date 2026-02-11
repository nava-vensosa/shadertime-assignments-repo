import * as THREE from 'three';

export default class TrailRenderer {
  constructor(color, parentGroup, maxPoints = 200) {
    this.points = [];
    this.maxPoints = maxPoints;

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });

    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.maxPoints * 3);
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setDrawRange(0, 0);

    this.line = new THREE.Line(this.geometry, material);
    this.line.frustumCulled = false;
    parentGroup.add(this.line);
  }

  addPoint(worldPos) {
    this.points.push(worldPos.clone());
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
    this._updateGeometry();
  }

  _updateGeometry() {
    const posAttr = this.geometry.getAttribute('position');
    for (let i = 0; i < this.points.length; i++) {
      posAttr.setXYZ(i, this.points[i].x, this.points[i].y, this.points[i].z);
    }
    posAttr.needsUpdate = true;
    this.geometry.setDrawRange(0, this.points.length);
  }

  clear() {
    this.points = [];
    this.geometry.setDrawRange(0, 0);
  }

  dispose() {
    this.line.parent?.remove(this.line);
    this.geometry.dispose();
    this.line.material.dispose();
  }
}
