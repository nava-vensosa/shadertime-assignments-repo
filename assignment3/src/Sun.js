import * as THREE from 'three';
import CelestialBody from './CelestialBody.js';
import OrbitalBody from './OrbitalBody.js';

export default class Sun extends CelestialBody {
  constructor(params = {}) {
    super(params);
    this.name = params.name || 'Sun';
    this.clockrate = params.clockrate || 120;
    this.cycles = params.cycles || 16;
    this.next = params.next || null;

    // Sun mesh
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffdd44,
      emissive: 0xffaa00,
      emissiveIntensity: 1.0,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData.body = this;
    this.group.add(this.mesh);

    // Point light from sun
    this.light = new THREE.PointLight(0xffdd88, 2, 200);
    this.group.add(this.light);

    // Rays group
    this.raysGroup = new THREE.Group();
    this.group.add(this.raysGroup);

    // Timing
    this.elapsedBeats = 0;
    this.totalMeasures = 0;
    this.finished = false;
  }

  addPlanet(params = {}) {
    const radius = 4 + this.children.length * 3;
    const planet = new OrbitalBody(
      { ...params, name: params.name || `Planet ${this.children.length + 1}`, clockrate: this.clockrate },
      radius,
      false
    );
    this.addChild(planet);
    planet.attachToParent(this.group);
    return planet;
  }

  _buildRays() {
    // Clear old rays
    while (this.raysGroup.children.length) {
      const child = this.raysGroup.children[0];
      child.geometry?.dispose();
      child.material?.dispose();
      this.raysGroup.remove(child);
    }

    // Cast grey rays through transit subdivisions
    const totalTransits = this.children.reduce((sum, p) => sum + (p.transits || 4), 0);
    const rayCount = Math.max(totalTransits, 8);

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 60, 0, Math.sin(angle) * 60),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0x666666, transparent: true, opacity: 0.15 });
      this.raysGroup.add(new THREE.Line(geo, mat));
    }
  }

  update(dt, elapsed) {
    if (this.finished) return;

    // BPM timing: beats per second = BPM / 60
    const bps = this.clockrate / 60;
    this.elapsedBeats += bps * dt;
    this.totalMeasures = this.elapsedBeats / 60; // 60 beats per measure at 1x

    // Rebuild rays when children change
    if (this.raysGroup.children.length === 0 && this.children.length > 0) {
      this._buildRays();
    }

    // Check cycle completion
    if (this.cycles > 0 && this.totalMeasures >= this.cycles) {
      this.finished = true;
      if (this.next) {
        this.group.dispatchEvent({ type: 'systemComplete', next: this.next });
      }
    }

    // Rotate sun slowly
    this.mesh.rotation.y += dt * 0.1;

    super.update(dt, elapsed);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      cycles: this.cycles,
      next: this.next,
      planets: this.children.map(c => c.toJSON()),
    };
  }

  static fromJSON(data) {
    const sun = new Sun({
      name: data.name,
      clockrate: data.clockrate,
      cycles: data.cycles,
      next: data.next,
    });

    if (data.planets) {
      for (const pData of data.planets) {
        const planet = sun.addPlanet({
          name: pData.name,
          clockrate: pData.clockrate,
          transits: pData.transits,
          extrema: pData.extrema,
          rotation: pData.rotation,
          multiplier: pData.multiplier,
          sampleName: pData.sampleName,
          tickToggles: pData.tickToggles,
        });
        planet.orbitRadius = pData.orbitRadius || planet.orbitRadius;
        planet.rebuildOrbits();

        if (pData.children) {
          for (const sData of pData.children) {
            const sat = planet.addSatellite({
              name: sData.name,
              clockrate: sData.clockrate,
              transits: sData.transits,
              extrema: sData.extrema,
              rotation: sData.rotation,
              multiplier: sData.multiplier,
              sampleName: sData.sampleName,
              tickToggles: sData.tickToggles,
            });
            sat.orbitRadius = sData.orbitRadius || sat.orbitRadius;
            sat.rebuildOrbits();
          }
        }
      }
    }

    return sun;
  }
}
