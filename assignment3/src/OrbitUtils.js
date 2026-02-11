import * as THREE from 'three';

/**
 * Math utilities for ellipse paths and ray-ellipse intersections.
 */

export function ellipsePosition(R, extrema, rotationDeg, theta) {
  const rot = THREE.MathUtils.degToRad(rotationDeg);
  const a = R + (extrema?.x ?? 0);
  const b = R + (extrema?.y ?? 0);
  const x = a * Math.cos(theta + rot);
  const z = b * Math.sin(theta + rot);
  return new THREE.Vector3(x, 0, z);
}

export function buildArcLengthTable(R, extrema, rotationDeg, samples = 3600) {
  const thetas = new Float64Array(samples + 1);
  const fractions = new Float64Array(samples + 1);
  const cumLengths = new Float64Array(samples + 1);

  thetas[0] = 0;
  cumLengths[0] = 0;

  let prev = ellipsePosition(R, extrema, rotationDeg, 0);
  for (let i = 1; i <= samples; i++) {
    const theta = (i / samples) * Math.PI * 2;
    thetas[i] = theta;
    const curr = ellipsePosition(R, extrema, rotationDeg, theta);
    cumLengths[i] = cumLengths[i - 1] + prev.distanceTo(curr);
    prev = curr;
  }

  const totalLength = cumLengths[samples];
  for (let i = 0; i <= samples; i++) {
    fractions[i] = totalLength > 0 ? cumLengths[i] / totalLength : i / samples;
  }

  return { thetas, fractions, totalLength, samples };
}

export function thetaAtArcFraction(table, fraction) {
  const f = ((fraction % 1) + 1) % 1; // normalize to [0, 1)
  const { thetas, fractions, samples } = table;

  // Binary search for the bracket
  let lo = 0;
  let hi = samples;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (fractions[mid] <= f) lo = mid;
    else hi = mid;
  }

  // Linear interpolation between lo and hi
  const fLo = fractions[lo];
  const fHi = fractions[hi];
  const range = fHi - fLo;
  const t = range > 0 ? (f - fLo) / range : 0;
  return thetas[lo] + t * (thetas[hi] - thetas[lo]);
}

export function arcFractionAtTheta(table, theta) {
  const t = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const { thetas, fractions, samples } = table;

  // Binary search on thetas (which are monotonically increasing 0 to 2π)
  let lo = 0;
  let hi = samples;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (thetas[mid] <= t) lo = mid;
    else hi = mid;
  }

  const tLo = thetas[lo];
  const tHi = thetas[hi];
  const range = tHi - tLo;
  const u = range > 0 ? (t - tLo) / range : 0;
  return fractions[lo] + u * (fractions[hi] - fractions[lo]);
}

export function createEllipseCurve(R, extrema, rotationDeg, segments = 128) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(ellipsePosition(R, extrema, rotationDeg, theta));
  }
  return points;
}

export function createCircleCurve(R, segments = 128) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(R * Math.cos(theta), 0, R * Math.sin(theta)));
  }
  return points;
}

export function angularVelocity(bpm, multiplier = 1) {
  return (2 * Math.PI * bpm * multiplier) / 3600;
}

export function rayEllipseIntersection(rayOrigin, rayDir, R, extrema, rotationDeg) {
  const rot = THREE.MathUtils.degToRad(rotationDeg);
  const a = R + (extrema?.x ?? 0);
  const b = R + (extrema?.y ?? 0);

  const cosR = Math.cos(-rot);
  const sinR = Math.sin(-rot);

  const ox = rayOrigin.x * cosR - rayOrigin.z * sinR;
  const oz = rayOrigin.x * sinR + rayOrigin.z * cosR;
  const dx = rayDir.x * cosR - rayDir.z * sinR;
  const dz = rayDir.x * sinR + rayDir.z * cosR;

  const A = (dx * dx) / (a * a) + (dz * dz) / (b * b);
  const B = 2 * ((ox * dx) / (a * a) + (oz * dz) / (b * b));
  const C = (ox * ox) / (a * a) + (oz * oz) / (b * b) - 1;

  const disc = B * B - 4 * A * C;
  if (disc < 0) return null;

  const sqrtDisc = Math.sqrt(disc);
  const t1 = (-B - sqrtDisc) / (2 * A);
  const t2 = (-B + sqrtDisc) / (2 * A);

  const t = t1 > 0 ? t1 : t2 > 0 ? t2 : null;
  if (t === null) return null;

  return new THREE.Vector3(
    rayOrigin.x + rayDir.x * t,
    rayOrigin.y + rayDir.y * t,
    rayOrigin.z + rayDir.z * t
  );
}
