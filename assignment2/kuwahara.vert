attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  // Pass texture coordinates to fragment shader
  // Flip X & Y coordinates for correct webcam orientation
  vTexCoord = vec2(1.0 - aTexCoord.x, 1.0 - aTexCoord.y);

  // Transform vertex position to vec4 since clip space requires 4 components (x, y, z, w)
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  gl_Position = positionVec4;
}
