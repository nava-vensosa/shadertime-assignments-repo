uniform sampler2D uLightmapX;
uniform float uGridRes;
uniform float uRoomSize;
uniform vec3 uBaseColor;

varying vec3 vWorldPos;
varying vec3 vNormal;

vec3 sampleVolume(vec3 worldPos) {
  float half_room = uRoomSize * 0.5;
  vec3 uvw = (worldPos + half_room) / uRoomSize;
  uvw = clamp(uvw, 0.0, 1.0);

  float zf = uvw.z * (uGridRes - 1.0);
  float z0 = floor(zf);
  float z1 = min(z0 + 1.0, uGridRes - 1.0);
  float zFrac = zf - z0;

  vec2 uv0 = vec2((z0 + uvw.x) / uGridRes, uvw.y);
  vec2 uv1 = vec2((z1 + uvw.x) / uGridRes, uvw.y);

  vec3 sample0 = texture2D(uLightmapX, uv0).rgb;
  vec3 sample1 = texture2D(uLightmapX, uv1).rgb;

  return mix(sample0, sample1, zFrac);
}

void main() {
  vec3 light = sampleVolume(vWorldPos);

  vec3 insetPos = vWorldPos - vNormal * 0.15;
  vec3 lightInset = sampleVolume(insetPos);
  light = max(light, lightInset);

  vec3 color = uBaseColor * (light * 5.0 + 0.012);

  gl_FragColor = vec4(color, 1.0);
}
