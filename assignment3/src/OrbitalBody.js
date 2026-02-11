import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import CelestialBody from './CelestialBody.js';
import { ellipsePosition, buildArcLengthTable, thetaAtArcFraction, arcFractionAtTheta, createEllipseCurve, createCircleCurve, angularVelocity } from './OrbitUtils.js';
import TrailRenderer from './TrailRenderer.js';

const TICK_BLUE = 0x4488ff;
const TICK_RED = 0xff3333;
const TICK_GREY = 0x555555;
const FLASH_THRESHOLD = 0.005;

const PLANET_COLORS = [
  0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf7dc6f, 0xbb8fce,
  0x82e0aa, 0xf0b27a, 0xaed6f1, 0xd7bde2, 0xa3e4d7,
];
let colorIndex = 0;

const SILVER_SHADES = [0xc0c0c0, 0xa8a8a8, 0xd3d3d3, 0x909090, 0xb8b8b8];
let silverIndex = 0;

function pointsToPositions(pts) {
  const pos = [];
  for (const p of pts) {
    pos.push(p.x, p.y, p.z);
  }
  return pos;
}

function createFatLine(positions, color, linewidth, opacity = 1.0) {
  const geo = new LineGeometry();
  geo.setPositions(positions);
  const mat = new LineMaterial({
    color,
    linewidth,
    transparent: opacity < 1.0,
    opacity,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });
  const line = new Line2(geo, mat);
  line.computeLineDistances();
  return line;
}

function disposeFatLine(line) {
  if (!line) return;
  line.parent?.remove(line);
  line.geometry.dispose();
  line.material.dispose();
}

export default class OrbitalBody extends CelestialBody {
  constructor(params = {}, orbitRadius = 5, isSatellite = false) {
    super(params);

    this.isSatellite = isSatellite;
    this.transits = params.transits ?? 4;
    this.extrema = params.extrema ?? { x: 0, y: 0 };
    this.rotation = params.rotation ?? 0;
    this.multiplier = params.multiplier ?? 1;
    this.orbitRadius = orbitRadius;
    this.arcFraction = 0;
    this._arcTable = null;
    this._lastTriggeredIndex = -1;

    // Tick toggles and sample
    this.sampleName = params.sampleName ?? null;
    const defaultToggles = new Array(this.transits).fill(true);
    this.tickToggles = params.tickToggles ?? defaultToggles;
    // Ensure correct length
    while (this.tickToggles.length < this.transits) this.tickToggles.push(true);
    this.tickToggles.length = this.transits;

    // Audio trigger callback (set externally)
    this._onTickTrigger = null;

    const size = isSatellite ? 0.3 : 0.6;
    let color;
    if (isSatellite) {
      color = SILVER_SHADES[silverIndex % SILVER_SHADES.length];
      silverIndex++;
    } else {
      color = PLANET_COLORS[colorIndex % PLANET_COLORS.length];
      colorIndex++;
    }
    this.color = color;

    const geometry = new THREE.SphereGeometry(size, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.userData.body = this;

    // Anchor follows the ellipse; mesh is child of anchor
    this.anchor = new THREE.Group();
    this.anchor.add(this.mesh);
    this.group.add(this.anchor);

    // Orbit lines and tick marks
    this.circleOrbitLine = null;
    this.ellipseOrbitLine = null;
    this.tickMarks = [];
    this._buildOrbitLines();

    // Trail — short tail behind the body
    this.trail = new TrailRenderer(color, this.group.parent || this.group, 40);
    this._trailFrame = 0;
  }

  attachToParent(parentGroup) {
    parentGroup.add(this.group);
    if (this.trail.line.parent) this.trail.line.parent.remove(this.trail.line);
    parentGroup.add(this.trail.line);
  }

  _buildOrbitLines() {
    disposeFatLine(this.circleOrbitLine);
    disposeFatLine(this.ellipseOrbitLine);
    this.circleOrbitLine = null;
    this.ellipseOrbitLine = null;

    for (const tick of this.tickMarks) {
      disposeFatLine(tick.line);
    }
    this.tickMarks = [];

    // Build arc-length lookup table
    this._arcTable = buildArcLengthTable(this.orbitRadius, this.extrema, this.rotation);

    // Tinted ellipse color: 80% white, 20% planet color
    const tintedColor = new THREE.Color(0xffffff);
    tintedColor.lerp(new THREE.Color(this.color), 0.2);

    // Circular base orbit (dark grey)
    const circlePoints = createCircleCurve(this.orbitRadius);
    this.circleOrbitLine = createFatLine(
      pointsToPositions(circlePoints), 0x444444, 1.0, 0.5
    );
    this.group.add(this.circleOrbitLine);

    // Active elliptical path (tinted white)
    const ellipsePoints = createEllipseCurve(this.orbitRadius, this.extrema, this.rotation);
    this.ellipseOrbitLine = createFatLine(
      pointsToPositions(ellipsePoints), tintedColor.getHex(), 1.0, 0.85
    );
    this.group.add(this.ellipseOrbitLine);

    this._buildTickMarks();
  }

  _buildTickMarks() {
    const tickLength = 0.8;

    // Ensure tickToggles length matches transits
    while (this.tickToggles.length < this.transits) this.tickToggles.push(true);
    this.tickToggles.length = this.transits;

    for (let i = 0; i < this.transits; i++) {
      const theta = (i / this.transits) * Math.PI * 2;
      const pos = ellipsePosition(this.orbitRadius, this.extrema, this.rotation, theta);

      const eps = 0.01;
      const posNext = ellipsePosition(this.orbitRadius, this.extrema, this.rotation, theta + eps);
      const tangent = new THREE.Vector3().subVectors(posNext, pos).normalize();
      const perp = new THREE.Vector3(-tangent.z, 0, tangent.x);

      const p1 = pos.clone().addScaledVector(perp, tickLength);
      const p2 = pos.clone().addScaledVector(perp, -tickLength);

      const enabled = this.tickToggles[i];
      const line = createFatLine(
        [p1.x, p1.y, p1.z, p2.x, p2.y, p2.z],
        enabled ? TICK_BLUE : TICK_GREY, 0.7, 0.9
      );
      this.group.add(line);

      const arcFrac = arcFractionAtTheta(this._arcTable, theta);
      this.tickMarks.push({ line, fraction: arcFrac, material: line.material, enabled, index: i });
    }
  }

  setTickEnabled(index, enabled) {
    if (index < 0 || index >= this.transits) return;
    this.tickToggles[index] = enabled;
    if (this.tickMarks[index]) {
      this.tickMarks[index].enabled = enabled;
      this.tickMarks[index].material.color.setHex(enabled ? TICK_BLUE : TICK_GREY);
    }
  }

  rebuildOrbits() {
    this._buildOrbitLines();
    if (this.trail) this.trail.clear();
  }

  update(dt, elapsed) {
    const omega = angularVelocity(this.clockrate, this.multiplier);
    const period = (2 * Math.PI) / omega;
    this.arcFraction = (this.arcFraction + dt / period) % 1.0;

    const theta = thetaAtArcFraction(this._arcTable, this.arcFraction);
    const pos = ellipsePosition(this.orbitRadius, this.extrema, this.rotation, theta);
    this.anchor.position.copy(pos);

    // Flash and trigger tick marks
    let anyFlashing = false;
    for (const tick of this.tickMarks) {
      if (!tick.enabled) {
        tick.material.color.setHex(TICK_GREY);
        continue;
      }

      let diff = Math.abs(this.arcFraction - tick.fraction);
      if (diff > 0.5) diff = 1.0 - diff;

      if (diff < FLASH_THRESHOLD) {
        tick.material.color.setHex(TICK_RED);
        anyFlashing = true;

        // Trigger audio only once per tick crossing
        if (this._lastTriggeredIndex !== tick.index) {
          this._lastTriggeredIndex = tick.index;
          if (this._onTickTrigger) this._onTickTrigger(tick.index);
        }
      } else {
        tick.material.color.setHex(TICK_BLUE);
      }
    }

    if (!anyFlashing) {
      this._lastTriggeredIndex = -1;
    }

    // Update trail
    this._trailFrame++;
    if (this._trailFrame % 3 === 0) {
      const worldPos = new THREE.Vector3();
      this.mesh.getWorldPosition(worldPos);
      this.trail.addPoint(worldPos);
    }

    for (const child of this.children) {
      child.update(dt, elapsed);
    }
  }

  addSatellite(params = {}) {
    const radius = 1.2 + this.children.length * 0.8;
    const sat = new OrbitalBody(
      { ...params, name: params.name || `Satellite ${this.children.length + 1}`, clockrate: this.clockrate },
      radius,
      true
    );
    this.addChild(sat);
    sat.attachToParent(this.anchor);
    return sat;
  }

  dispose() {
    if (this.trail) this.trail.dispose();
    disposeFatLine(this.circleOrbitLine);
    disposeFatLine(this.ellipseOrbitLine);
    for (const tick of this.tickMarks) {
      disposeFatLine(tick.line);
    }
    this.tickMarks = [];
    super.dispose();
  }

  toJSON() {
    return {
      ...super.toJSON(),
      transits: this.transits,
      extrema: { ...this.extrema },
      rotation: this.rotation,
      multiplier: this.multiplier,
      orbitRadius: this.orbitRadius,
      isSatellite: this.isSatellite,
      sampleName: this.sampleName,
      tickToggles: [...this.tickToggles],
      children: this.children.map(c => c.toJSON()),
    };
  }
}
