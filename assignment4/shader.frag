precision highp float;

in vec3 v_color;
flat in vec2 v_centroidScreen;
flat in vec2 v_normalTipScreen;

out vec4 fragColor;

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
  return length(p - (a + t * ab));
}

void main() {
  vec3 color = v_color;
  float rayDist = distToSegment(gl_FragCoord.xy, v_centroidScreen, v_normalTipScreen);
  color = mix(color, vec3(1.0, 0.95, 0.0), 1.0 - smoothstep(0.0, 1.5, rayDist));
  fragColor = vec4(color, 1.0);
}
