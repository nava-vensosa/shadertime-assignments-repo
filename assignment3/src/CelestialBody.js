import * as THREE from 'three';

let idCounter = 0;

export default class CelestialBody {
  constructor(params = {}) {
    this.id = idCounter++;
    this.name = params.name || 'Body';
    this.clockrate = params.clockrate || 120;
    this.children = [];
    this.parent = null;
    this.mesh = null;
    this.group = new THREE.Group();
    this.group.userData.body = this;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.dispose();
    }
  }

  update(dt, elapsed) {
    for (const child of this.children) {
      child.update(dt, elapsed);
    }
  }

  dispose() {
    for (const child of [...this.children]) {
      child.dispose();
    }
    this.children = [];
    if (this.mesh) {
      this.mesh.geometry?.dispose();
      this.mesh.material?.dispose();
    }
    this.group.parent?.remove(this.group);
  }

  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.mesh?.getWorldPosition(pos);
    return pos;
  }

  toJSON() {
    return {
      name: this.name,
      clockrate: this.clockrate,
    };
  }
}
