let cam;
let kuwaharaShader;

const WIDTH = 1280;
const HEIGHT = 720;

function preload() {
  kuwaharaShader = loadShader('kuwahara.vert', 'kuwahara.frag');
}

function setup() {
  let canvas = createCanvas(WIDTH, HEIGHT, WEBGL);
  canvas.parent('canvas-container');
  noStroke();

  cam = createCapture(VIDEO);
  cam.size(WIDTH, HEIGHT);
  cam.hide();
}

function draw() {
  // Calculate time-based kernel size (oscillates over 60 seconds)
  let cycleTime = millis() % 60000;
  let kernelSize;

  if (cycleTime < 30000) {
    // 0s-30s: interpolate from min to max
    kernelSize = map(cycleTime, 0, 30000, 3, 14);
  } else {
    // 30s-60s: interpolate from max back to min
    kernelSize = map(cycleTime, 30000, 60000, 14, 3);
  }

  shader(kuwaharaShader);

  kuwaharaShader.setUniform('u_texture', cam);
  kuwaharaShader.setUniform('u_resolution', [WIDTH, HEIGHT]);
  kuwaharaShader.setUniform('u_kernelSize', kernelSize);

  // Draw a quad covering the entire canvas
  // In WEBGL mode, origin is center, so we offset
  rect(-WIDTH/2, -HEIGHT/2, WIDTH, HEIGHT);
}
