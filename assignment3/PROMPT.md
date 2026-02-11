Solar System Constructor - Technical Specification
You are a Lead Software Architect designing a production-ready Three.js application. Build a modular “Solar System Constructor” that allows users to create and animate hierarchical orbital systems. Follow UNIX philosophy: small, focused modules with clear interfaces.
Project Structure
Provide complete, high-quality code for these files:
∙index.html - Entry point with canvas
∙styles.css - Glassmorphic UI for parameter menus
∙src/main.js - Bootstraps Three.js scene and initializes engine
∙src/Engine.js - Manages render loop, raycaster, and global clock
∙src/CameraController.js - Handles zoom and orbital rotation around sun
∙src/SystemManager.js - Handles JSON save/load and BPM timing calculations
∙src/CelestialBody.js - Abstract base class for all orbital bodies
∙src/Sun.js - Root object with ray-casting and system lifecycle
∙src/OrbitalBody.js - Planets and satellites with elliptical orbits
∙src/OrbitUtils.js - Math utilities for ellipse paths and ray-ellipse intersections
∙src/TrailRenderer.js - Colored glow trails following orbital paths
∙README.md - Architecture documentation and extension guide
Core Requirements
1. Object Hierarchy & Initialization
Sun (Root Object)
∙Parameters: name (string), clockrate (BPM), cycles (measures), next (JSON filename)
∙Appearance: Large yellow sphere
∙UI Actions: Save System, Load System, Add Planet
∙Visual Feature: Casts grey rays through transit subdivisions
∙Always at scene origin (0, 0, 0) - camera orbits around it
Planets (Sun’s Children)
∙Parameters: name, clockrate (inherited from parent), transits (default: 4), extrema (ellipse deformation), rotation (ellipse orientation in degrees), multiplier (speed factor)
∙Appearance: Medium-sized sphere, random unique color
∙Orbit: Circular base (thin dark grey) + active elliptical path (white) with colored glow trail
∙UI Actions: Add Satellite, Remove Self
∙Default: Circular orbit (extrema = 0), becomes elliptical as extrema increases
Satellites (Planet’s Children)
∙Same parameters and behavior as planets
∙Appearance: Small sphere, varying shades of silver
∙Orbits parent planet instead of sun
2. Camera Control System
CameraController.js Requirements:
The camera is always focused on the sun at origin (0, 0, 0). Implement spherical coordinate camera control:
Scroll Wheel (Zoom):
∙Adjusts camera distance (radius) from sun
∙Minimum distance: prevent clipping through sun
∙Maximum distance: allow viewing entire system
∙Smooth zoom with damping
Right-Click + Drag (Orbit Rotation):
∙Horizontal drag: rotate camera around sun’s Y-axis (azimuthal angle)
∙Vertical drag: rotate camera up/down (polar/elevation angle)
∙Constrain polar angle to prevent camera flipping (e.g., 0.1 to π - 0.1)
∙Camera always looks at sun center (0, 0, 0)
∙Feel: user is “grabbing” the 3D scene and rotating it
Implementation Notes:
∙Use spherical coordinates: (radius, theta, phi)
∙Convert to Cartesian for camera position
∙camera.lookAt(0, 0, 0) every frame
∙Track mousedown, mousemove, mouseup for drag state
∙Prevent right-click context menu
∙Differentiate right-click (camera) from left-click (object selection)
3. Elliptical Orbit Math
Each orbital body’s mesh must be parented to an anchor object that follows the parametric ellipse:

x(θ) = (R + extrema.x) × cos(θ + rotation)
z(θ) = (R + extrema.y) × sin(θ + rotation)


Where:
∙R = base circular orbit radius
∙extrema = user-defined ellipse deformation
∙rotation = ellipse orientation (0° = vertical, 90° = horizontal)
∙θ = parametric angle driven by BPM clock
The circular base orbit (dark grey) uses radius R. The active elliptical path (white) uses the full equation above.
4. BPM Timing System
Clock Math:
∙1 Revolution = 60 beats at 1× multiplier
∙Angular velocity (rad/s) = (2π × BPM × multiplier) / 3600
∙When totalMeasures >= sun.cycles, system terminates and loads                                                                                                                                                                                           
