varying vec3 vColor;
varying float vIntensity;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float r = length(center) * 2.0; // 0 at center, 1 at edge

  // Soft gaussian-ish blob for fog appearance
  float alpha = exp(-r * r * 3.0) * vIntensity * 0.12;

  // Very faint per-particle — the fog look comes from thousands overlapping
  gl_FragColor = vec4(vColor * alpha, alpha);
}
