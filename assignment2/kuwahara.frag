precision mediump float;

uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_kernelSize;

varying vec2 vTexCoord;

// Calculate mean and variance for a rectangular region
vec4 calcRegionStats(vec2 center, vec2 regionStart, vec2 regionEnd, vec2 texelSize) {
  vec3 sum = vec3(0.0);
  vec3 sumSq = vec3(0.0);
  float count = 0.0;

  for (float y = 0.0; y < 16.0; y++) {
    if (y > regionEnd.y - regionStart.y) break;
    for (float x = 0.0; x < 16.0; x++) {
      if (x > regionEnd.x - regionStart.x) break;

      vec2 offset = regionStart + vec2(x, y);
      vec2 samplePos = center + offset * texelSize;
      vec3 color = texture2D(u_texture, samplePos).rgb;

      sum += color;
      sumSq += color * color;
      count += 1.0;
    }
  }

  vec3 mean = sum / count;
  vec3 variance = (sumSq / count) - (mean * mean);
  float stdDev = variance.r + variance.g + variance.b;

  return vec4(mean, stdDev);
}

void main() {
  vec2 texelSize = 1.0 / u_resolution;
  vec2 uv = vTexCoord;

  // Calculate half kernel size (integer)
  float halfSize = floor(u_kernelSize / 2.0);

  // Define the 4 quadrant sectors
  // Each sector is roughly half the kernel size
  float sectorSize = floor(halfSize);

  // Sector 1: Top-left
  vec4 s1 = calcRegionStats(uv, vec2(-halfSize, -halfSize), vec2(0.0, 0.0), texelSize);

  // Sector 2: Top-right
  vec4 s2 = calcRegionStats(uv, vec2(0.0, -halfSize), vec2(halfSize, 0.0), texelSize);

  // Sector 3: Bottom-left
  vec4 s3 = calcRegionStats(uv, vec2(-halfSize, 0.0), vec2(0.0, halfSize), texelSize);

  // Sector 4: Bottom-right
  vec4 s4 = calcRegionStats(uv, vec2(0.0, 0.0), vec2(halfSize, halfSize), texelSize);

  // Find the sector with minimum standard deviation
  vec4 best = s1;
  best = (s2.a < best.a) ? s2 : best;
  best = (s3.a < best.a) ? s3 : best;
  best = (s4.a < best.a) ? s4 : best;

  gl_FragColor = vec4(best.rgb, 1.0);
}
