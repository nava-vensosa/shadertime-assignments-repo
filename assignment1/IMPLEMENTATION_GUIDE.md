# Implementation Guide — Assignment 1

## File Structure

```
assignment1/
├── index.html           # Entry point: loads p5.js from CDN, includes all scripts
├── style.css            # Body/canvas margin reset, overflow hidden, cursor style
├── sketch.js            # p5.js setup() and draw() — the main loop
├── state.js             # Single shared state object (current dimension, vertices, flags)
├── vertex.js            # Vertex data structure, add/remove/clear operations
├── edges.js             # Compute edge lists, draw edges between vertex sets
├── buttons.js           # Define buttons, hit-test, render, flash-on-click logic
├── stepup.js            # Z-amount calculation, extrusion from 2D→3D and 3D→4D
├── projection.js        # 4D→3D and 3D→2D projection math (perspective divide)
├── rotation.js          # Rotation matrices: 3D (Y-axis) and 4D (XW-plane)
├── PROJECT_PROPOSAL.md  # Original spec
└── IMPLEMENTATION_GUIDE.md  # This file
```

Every helper file exposes one or two pure functions (or a small object) on `window`.
`sketch.js` is the only file that calls p5 drawing primitives in `draw()`.
No file exceeds ~80 lines.

---

## File Responsibilities

### `index.html`
- Loads p5.js (v1.11+) from CDN in global mode.
- Loads `style.css`.
- Includes each `.js` file via `<script>` tags in dependency order:
  `state.js → vertex.js → edges.js → buttons.js → stepup.js → projection.js → rotation.js → sketch.js`.

### `style.css`
- `html, body { margin: 0; overflow: hidden; }` so the canvas fills the viewport.
- Cursor style override if needed.

### `state.js`
Exports a `State` object:
```
{
  dimension: 2,          // 2 | 3 | 4
  vertices2D: [],        // [{index, x, y}]
  closed: false,         // true after Close is pressed
  extrusionDepth: 0,     // computed z-amount
  rotationAngle: 0,      // accumulates each frame
  buttonFlash: {         // tracks flash timers per button
    clear: 0, close: 0, stepup: 0
  }
}
```
Provides `State.reset()` to reinitialise.

### `vertex.js`
- `Vertex.add(x, y)` — pushes `{index, x, y}` to `State.vertices2D`.
- `Vertex.clear()` — empties the array, resets index counter.
- `Vertex.count()` — returns length.
- Vertices store canvas-space coordinates (origin at centre because WEBGL).

### `edges.js`
- `Edges.pairs(verts)` — returns `[[v0,v1],[v1,v2],...,[vN,v0]]` (polygon winding order).
- `Edges.draw2D(p, pairs)` — draws thin transparent green lines for a 2D edge set.
- `Edges.drawBetween(p, vertsA, vertsB)` — draws connecting edges between two corresponding vertex arrays (used by Step-Up to link original and clone).

### `buttons.js`
- Defines three button rects positioned at top-left of the canvas.
- `Buttons.hitTest(mx, my)` — returns `"clear"|"close"|"stepup"|null`.
- `Buttons.render(p)` — draws each button; uses `State.buttonFlash` to lerp colour from blue back to red.
- `Buttons.isOverAny(mx, my)` — boolean, used by `mousePressed` to suppress vertex placement.
- Handles greyed-out / disabled appearance for Close when locked.

### `stepup.js`
- `StepUp.zAmount(verts)` — for each vertex, computes Euclidean distance to its previous and next neighbour; returns the average of all those distances. This is the extrusion depth.
- `StepUp.extrude(verts2D, depth)` — returns a new vertex array with each vertex's position offset by `depth` along Z (for 2D→3D) or along W (for 3D→4D).
- `StepUp.execute()` — orchestrates the full step-up: computes z-amount, clones geometry, advances `State.dimension`, stores extrusion depth.

### `projection.js`
- `Projection.from4Dto3D(vert4D, angle)` — applies a simple 4D rotation (XW-plane), then perspective-divides W to produce an {x,y,z} point.
- `Projection.from3Dto2D(vert3D, angle)` — identity pass-through (p5 WEBGL handles 3D natively via its camera). This exists as a hook if manual projection is ever needed.

### `rotation.js`
- `Rotation.matrix3D(angle)` — returns a Y-axis rotation matrix (or calls `p5.rotateY`).
- `Rotation.apply4D(verts, angle)` — rotates 4D vertices in the XW-plane by `angle` before projection.
- `Rotation.tick(dt)` — increments `State.rotationAngle` by a fixed angular velocity.

### `sketch.js`
The main loop:
```
setup():
  createCanvas(windowWidth, windowHeight, WEBGL)
  State.reset()

draw():
  background(128)                        // grey
  Buttons.render()                       // always draw UI

  if dimension == 2:
    draw each vertex as a white sphere(2)
    if closed: Edges.draw2D(...)

  if dimension == 3:
    Rotation.tick(deltaTime)
    rotateY(State.rotationAngle)
    draw original + clone vertices
    Edges.draw2D(original pairs)
    Edges.draw2D(clone pairs)
    Edges.drawBetween(original, clone)

  if dimension == 4:
    Rotation.tick(deltaTime)
    project 4D verts → 3D via Projection
    rotateY(State.rotationAngle)
    draw all projected verts + edges

mousePressed():
  if Buttons.isOverAny(mouseX, mouseY):
    handle button click
  else:
    Vertex.add(mouseX - width/2, mouseY - height/2)

windowResized():
  resizeCanvas(windowWidth, windowHeight)
```

---

## Oversights and Ambiguities in the Proposal

### 1. "Close" semantics
The proposal says "draw an edge between all the vertices." This is ambiguous — it could mean a complete graph (every vertex connected to every other) or a closed polygon (connect in drawing order, then close back to the first). **Recommendation:** polygon winding order (v0→v1→v2→...→vN→v0). A complete graph would be visually cluttered and algorithmically different from what Step-Up expects.

### 2. The "recursive" z-amount function
The proposal describes a "recursive function" but the operation is an iterative average of pairwise distances. The word *recursive* likely refers to the function being **reused** at each dimension step (same function applied to 3D edge lengths when stepping to 4D). The implementation should be a single function that accepts any vertex set and returns the mean edge length — called once per Step-Up.

### 3. WEBGL coordinate system
p5.js WEBGL mode places the origin at the **centre** of the canvas, not top-left. All mouse coordinates from `mouseX`/`mouseY` are still top-left-referenced. Every mouse interaction must subtract `(width/2, height/2)` to convert into WEBGL-space. The proposal doesn't mention this.

### 4. Button rendering in WEBGL
p5 WEBGL mode does not natively support `rect()` / `text()` the same way 2D mode does. Two options:
- **Option A (recommended):** Use p5.js DOM elements (`createButton()`) placed over the canvas via CSS. This gives native click events and avoids coordinate headaches.
- **Option B:** Render buttons on a 2D graphics buffer (`createGraphics()`) and composite it as a texture/image overlay onto the WEBGL canvas each frame.

Option A is simpler and more robust. The proposal's "red buttons that flash blue" styling is easily done with CSS transitions. If the assignment requires buttons drawn on the canvas itself, fall back to Option B.

### 5. What "Close" means for 3+ non-coplanar points
If the user draws vertices that, after Step-Up, would be non-planar in 3D, the "Close" polygon may not be visually flat. This is fine — edges are drawn between sequential vertices regardless of planarity. But it should be understood.

### 6. 4D projection details
The proposal says "extrapolate a 3D projection slice of a 4D Hypercube" but the shape isn't necessarily a hypercube — it's whatever the user drew, extruded twice. The 4D→3D projection needs a chosen method:
- **Perspective projection** (divide by W) gives the classic "inner cube" look for a tesseract.
- A fixed camera distance along W (e.g., W=2× extrusion depth) keeps the projection stable.

### 7. Rotation axis
"Slowly rotate the graphic clockwise perpendicular to the screen" — perpendicular to the screen is the **Z-axis**. However, rotating around Z in 3D doesn't reveal depth. The proposal likely intends rotation around the **Y-axis** (vertical axis), which is the standard way to show 3D depth on a 2D screen. **Recommendation:** rotate around Y for 3D, and perform an XW-plane rotation for 4D (the standard way to animate a tesseract).

### 8. Step-Up loop destination
The proposal says clicking Step-Up on a 4D render returns to "displaying the 2D scene graphic." It should restore the **original** 2D vertex data with edges drawn, not a blank canvas. The 2D data must be preserved across the full loop.

### 9. Close button re-enable condition
The proposal says Close is disabled after a valid Step-Up "until the Clear button is clicked." This means after Step-Up, the only way forward is Clear (full reset) or cycling through dimensions via Step-Up. Users cannot add more vertices while in 3D/4D. **Consider also disabling vertex placement** while `dimension > 2` to prevent confusion.

### 10. No specification for edge drawing between clone and original
The proposal describes closing edges "between each vertex in the clone and its corresponding vertex in the original" — this is straightforward (v0↔v0', v1↔v1', etc.), but it's worth noting that this means the number of connecting edges equals the vertex count, not the edge count.

### 11. Cloudflare Pages deployment
The proposal mentions Cloudflare but doesn't specify the method. **Cloudflare Pages** with a Git integration (GitHub/GitLab) is the simplest path: push static files, automatic deploy. No build step needed. Alternatively, `wrangler pages deploy .` from the CLI deploys the directory directly. No `wrangler.toml` is needed for a pure static site.

---

## Implementation Guide

### Phase 1 — Scaffold

1. Create `index.html` with the p5.js CDN link and all script tags.
2. Create `style.css` with body reset.
3. Create `state.js` with the `State` object and `reset()`.
4. Create `sketch.js` with bare `setup()` and `draw()` — grey canvas, nothing else.
5. **Test:** open `index.html` in a browser. You should see a grey full-window canvas.

### Phase 2 — Buttons

1. Create `buttons.js`.
2. If using DOM buttons (Option A): create three `createButton()` elements in `setup()`, position them via `.position()`, style via `.style()`. Attach `.mousePressed()` handlers.
3. Implement the blue flash: on click, set a timestamp in `State.buttonFlash`; in `draw()` (or via CSS transition), lerp the colour back to red over ~300ms.
4. **Test:** click each button, confirm the flash. Confirm console.log fires for each.

### Phase 3 — Vertex Placement

1. Create `vertex.js` with `add`, `clear`, `count`.
2. In `sketch.js`, implement `mousePressed()`: check `Buttons.isOverAny()` first; otherwise call `Vertex.add()`.
3. In `draw()`, iterate `State.vertices2D` and draw a small white sphere (or `point()` with `strokeWeight`) at each position.
4. Wire the Clear button to `Vertex.clear()`.
5. **Test:** click the canvas — white dots appear. Click Clear — dots disappear.

### Phase 4 — Closing Edges

1. Create `edges.js` with `pairs()` and `draw2D()`.
2. Wire the Close button: set `State.closed = true`, compute edge pairs.
3. In `draw()`, if `State.closed`, call `Edges.draw2D()` with green transparent stroke.
4. Disable Close if `Vertex.count() < 2` (grey it out).
5. **Test:** place 3+ vertices, click Close — green polygon appears. Clear resets.

### Phase 5 — Step-Up (2D → 3D)

1. Create `stepup.js` with `zAmount()` and `extrude()`.
2. Wire Step-Up button: only active if `State.closed && State.dimension === 2`.
3. On click: compute z-amount, extrude vertices along Z, set `dimension = 3`, disable Close.
4. Create `rotation.js` with `tick()`.
5. In `draw()`, when `dimension === 3`: apply `rotateY(State.rotationAngle)`, draw both vertex sets, draw all three edge groups (original polygon, clone polygon, connecting edges).
6. **Test:** draw a square, Close it, Step-Up — a rotating 3D prism appears.

### Phase 6 — Step-Up (3D → 4D)

1. Create `projection.js` with `from4Dto3D()`.
2. Extend `stepup.js` to handle the 3D→4D case: compute z-amount from the 3D edge lengths, extrude along W.
3. In `rotation.js`, add `apply4D()` for XW-plane rotation.
4. In `draw()`, when `dimension === 4`: rotate in 4D, project to 3D, then draw with `rotateY` for additional 3D tumble.
5. **Test:** draw a square, Close, Step-Up twice — a rotating tesseract-like projection appears.

### Phase 7 — Dimension Loop

1. When `dimension === 4` and Step-Up is clicked: set `dimension = 2`, restore original 2D vertex display with edges.
2. Re-enable Close button only after Clear.
3. **Test:** full cycle: 2D → Close → Step-Up → 3D → Step-Up → 4D → Step-Up → back to 2D.

### Phase 8 — Polish

1. Fine-tune stroke colour: fluorescent green = `stroke(57, 255, 20, 180)`.
2. Adjust rotation speed (~0.005 rad/frame or tie to `deltaTime`).
3. Confirm `windowResized()` works.
4. Confirm vertex placement is blocked during 3D/4D modes.

### Phase 9 — Deploy

1. Initialise a Git repository in the project directory.
2. Push to GitHub (or GitLab).
3. Connect the repo to **Cloudflare Pages** (dashboard → Pages → Create → Connect to Git).
4. Set build output directory to `/` (or the assignment folder path). No build command needed.
5. Alternatively, install `wrangler` and run: `wrangler pages deploy .`
6. Verify the live URL serves the page correctly.

---

## Testing Methodology

### Unit tests (in-browser console)

These can be run by pasting into the DevTools console or by including a `tests.js` file loaded with a `?test` query parameter.

| Function | Test |
|---|---|
| `StepUp.zAmount([{x:0,y:0},{x:3,y:4},{x:6,y:0}])` | Should return `5` (equilateral-ish triangle with side lengths 5, 5, ~5.66 → avg ≈ 5.22, but exact value depends on winding). Verify numerically. |
| `Edges.pairs([a,b,c])` | Should return `[[a,b],[b,c],[c,a]]`. |
| `Projection.from4Dto3D({x,y,z,w}, 0)` | With angle=0, W is unchanged; verify perspective divide produces expected x,y,z. |
| `Rotation.apply4D(verts, Math.PI/4)` | Verify XW-plane rotation by checking known input/output pairs. |
| `Vertex.add(10, 20)` then `Vertex.count()` | Should return `1`. |
| `Vertex.clear()` then `Vertex.count()` | Should return `0`. |
| `Buttons.hitTest(x, y)` | Pass coordinates inside/outside each button rect, verify return value. |

### Integration tests (manual)

| # | Action | Expected Result |
|---|--------|-----------------|
| 1 | Load page | Grey canvas fills window. Three red buttons visible top-left. |
| 2 | Click canvas in several spots | White dots appear at click locations. |
| 3 | Click Clear | All dots disappear. |
| 4 | Place 1 vertex, click Close | Close button does nothing (fewer than 2 vertices). |
| 5 | Place 3 vertices, click Close | Green polygon connects the 3 dots. Close button flashes blue. |
| 6 | Click canvas after Close | New vertex still appears (dimension is still 2). |
| 7 | Click Step-Up after Close | Shape extrudes into 3D. Rotates slowly. Close button greyed out. |
| 8 | Click canvas in 3D mode | No new vertex should appear. |
| 9 | Click Step-Up in 3D mode | 4D projection appears. Still rotates. |
| 10 | Click Step-Up in 4D mode | Returns to original 2D polygon view (edges drawn). |
| 11 | Click Clear at any time | Full reset: no vertices, no edges, dimension = 2. |
| 12 | Resize browser window | Canvas resizes. Vertices remain in correct relative positions (or reset — decide on policy). |

### Visual checks

- Edges are thin, transparent, fluorescent green.
- Buttons are red, flash blue on click (~300ms), return to red.
- Vertices are small white dots.
- 3D/4D rotation is smooth and continuous.
- 4D tesseract-like projection looks correct for a square input (inner/outer cubes connected).

### Deployment check

- Hit the Cloudflare Pages URL from a different device / incognito window.
- Confirm p5.js loads from CDN.
- Run through the manual integration tests on the live site.
