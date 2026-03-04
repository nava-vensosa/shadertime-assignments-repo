uniform sampler2D uPositions;
uniform float uSize;
uniform vec2 uTexSize;
uniform vec3 uTorch0;
uniform vec3 uTorch1;
uniform vec3 uTorch2;
uniform vec3 uTorchColor0;
uniform vec3 uTorchColor1;
uniform vec3 uTorchColor2;

varying vec3 vColor;
varying float vIntensity;

void main() {
  float index = float(gl_VertexID);
  float u = mod(index, uTexSize.x) / uTexSize.x;
  float v = floor(index / uTexSize.x) / uTexSize.y;
  vec2 uv = vec2(u, v) + 0.5 / uTexSize;

  vec4 posData = texture2D(uPositions, uv);
  vec3 pos = posData.xyz;

  // Each particle is a firefly: its emission = sum of torch contributions
  // with inverse-square falloff. Color = weighted blend of torch colors.
  float d0 = length(pos - uTorch0);
  float d1 = length(pos - uTorch1);
  float d2 = length(pos - uTorch2);

  // Inverse-square intensity from each torch (firefly absorbs and re-emits)
  float i0 = 1.0 / (1.0 + d0 * d0);
  float i1 = 1.0 / (1.0 + d1 * d1);
  float i2 = 1.0 / (1.0 + d2 * d2);

  float totalIntensity = i0 + i1 + i2;
  vColor = (uTorchColor0 * i0 + uTorchColor1 * i1 + uTorchColor2 * i2) / totalIntensity;
  vIntensity = totalIntensity;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPos;
  gl_PointSize = uSize / -mvPos.z;
}
