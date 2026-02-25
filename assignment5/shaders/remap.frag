uniform sampler2D tDiffuse;
uniform vec3 uColorLeft;
uniform vec3 uColorMid;
uniform vec3 uColorRight;
uniform float uMidPos;

varying vec2 vUv;

// RGB to HSL
vec3 rgb2hsl(vec3 c) {
  float maxC = max(c.r, max(c.g, c.b));
  float minC = min(c.r, min(c.g, c.b));
  float l = (maxC + minC) * 0.5;
  float s = 0.0;
  float h = 0.0;

  if (maxC != minC) {
    float d = maxC - minC;
    s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);

    if (maxC == c.r) {
      h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
    } else if (maxC == c.g) {
      h = (c.b - c.r) / d + 2.0;
    } else {
      h = (c.r - c.g) / d + 4.0;
    }
    h /= 6.0;
  }

  return vec3(h, s, l);
}

// Helper for HSL to RGB
float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0 / 2.0) return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
  return p;
}

// HSL to RGB
vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;

  if (s == 0.0) {
    return vec3(l);
  }

  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;

  float r = hue2rgb(p, q, h + 1.0 / 3.0);
  float g = hue2rgb(p, q, h);
  float b = hue2rgb(p, q, h - 1.0 / 3.0);

  return vec3(r, g, b);
}

// Sample the custom gradient at position t (0-1)
vec3 sampleGradient(float t) {
  t = clamp(t, 0.0, 1.0);
  if (t < uMidPos) {
    return mix(uColorLeft, uColorMid, t / max(uMidPos, 0.001));
  } else {
    return mix(uColorMid, uColorRight, (t - uMidPos) / max(1.0 - uMidPos, 0.001));
  }
}

void main() {
  vec4 texel = texture2D(tDiffuse, vUv);
  vec3 hsl = rgb2hsl(texel.rgb);

  // Use hue as position along gradient
  float t = hsl.x;

  // Get the gradient color at this hue position
  vec3 gradColor = sampleGradient(t);

  // Scale by original lightness so darks stay dark and brights stay bright
  // Lightness 0.5 is "full color", scale linearly from there
  float brightness = hsl.z * 2.0;

  gl_FragColor = vec4(gradColor * brightness, texel.a);
}
