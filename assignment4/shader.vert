uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 u_cursor;
uniform vec2 u_halfSize;
uniform vec2 u_resolution;
uniform float u_falloff;
uniform vec3 u_redPos;
uniform vec3 u_bluePos;

in vec3 position;
in vec3 normal;
in vec3 a_centroid;
in vec3 a_color;
in float a_isWhite;
in vec3 a_offset;

out vec3 v_color;
flat out vec2 v_centroidScreen;
flat out vec2 v_normalTipScreen;

void main() {
  // 1. Sphere center in world space
  vec3 center = (a_isWhite > 0.5)
    ? vec3(u_cursor * u_halfSize, 0.0)
    : a_offset;

  // 2. Depth-based radial scale for red/blue (camera at z=10)
  float scale = (a_isWhite > 0.5) ? 1.0 : 1.0 + a_offset.z * 0.1;

  // 3. World position of this vertex
  vec3 worldPos = center + position * scale;

  // 4. Smooth outward normal for unit sphere
  vec3 radial = normalize(position);

  // 5. White sphere: Lambert-weighted displacement
  if (a_isWhite > 0.5) {
    vec3 toRed  = u_redPos  - worldPos;
    vec3 toBlue = u_bluePos - worldPos;
    float redW  = max(0.0, 1.0 - length(toRed)  / u_falloff)
                * max(0.0, dot(normalize(toRed),  radial));
    float blueW = max(0.0, 1.0 - length(toBlue) / u_falloff)
                * max(0.0, dot(normalize(toBlue), radial));
    worldPos += radial * (blueW - redW) * 1.8;
    v_color = mix(mix(a_color, vec3(1.0, 0.1, 0.1), redW),
                  vec3(0.1, 0.2, 1.0), blueW);
  } else {
    v_color = a_color;
  }

  // 6. Clip position
  gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);

  // 7. Screen-space centroid + normal tip (for normal ray, flat varyings)
  //    For unit sphere: normalize(a_centroid) ≈ face normal
  vec3 centWorld = center + a_centroid * scale;
  vec3 tipWorld  = centWorld + normalize(a_centroid) * 0.3;
  vec4 cClip = projectionMatrix * viewMatrix * vec4(centWorld, 1.0);
  vec4 tClip = projectionMatrix * viewMatrix * vec4(tipWorld,  1.0);
  v_centroidScreen  = (cClip.xy / cClip.w * 0.5 + 0.5) * u_resolution;
  v_normalTipScreen = (tClip.xy / tClip.w * 0.5 + 0.5) * u_resolution;
}
