uniform sampler2D uParticleBuffer;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 texel = 1.0 / uResolution;

  // Wide gaussian-approximation blur for soft foggy glow
  vec3 sum = vec3(0.0);
  float wTotal = 0.0;

  for (int x = -3; x <= 3; x++) {
    for (int y = -3; y <= 3; y++) {
      float d = float(x * x + y * y);
      float w = exp(-d * 0.3);
      sum += texture2D(uParticleBuffer, vUv + vec2(float(x), float(y)) * texel * 2.0).rgb * w;
      wTotal += w;
    }
  }

  sum /= wTotal;

  gl_FragColor = vec4(sum, 1.0);
}
