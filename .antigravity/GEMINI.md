# Autonomous Build, Asset & Visual QA Protocol

## 1. Code Architecture & Modularity
- **One Job Per File:** Split pages (`src/pages/`), 3D scenes/props (`src/components/`), and data (`src/data/`).
- **Strict 300-Line Ceiling:** NEVER allow any file in `src/` to exceed 300 lines. If a file approaches 260+ lines, extract sub-components or helpers immediately.

## 2. 3D Asset Loading & Scaling (`public/models/`)
- Always scan `public/models/` first and use `@react-three/drei`'s `useGLTF` (with `<Clone>` for repeated props like trees, streetlights, and traffic cars) instead of building primitive box placeholders.
- Normalize model scale and ground alignment (`y = 0` flush with the floor/road surface) so no `.glb` model floats in mid-air or sinks below the ground.
- Always preload `.glb` assets with `useGLTF.preload(...)` to prevent frame stalls or black frames during cutscenes.

## 3. Zero Phasing, Road Placement & Spatial Rules
- **Solid Collisions:** Every solid interior/exterior prop (tables, counters, sofas, cars, walls, pillars, trees) MUST register an AABB bounding-box collider in the player movement controller.
- **Roadside Sign & Prop Clearance:** Never place highway signposts, trees, or streetlights inside asphalt road lanes. Mount highway directional signs on the **left grass shoulder/verge** (`x` offset outside the road edge) or on a proper overhead gantry spanning *above* the road (`y >= 5.5m` clearance).
- **Branching Detour Geometry:** When a vehicle takes a left detour exit (`312 Lembah Batu`), render an actual branching asphalt road curving left and steer the vehicle smoothly onto that branch—never drive straight through signboard poles.

## 4. Mandatory Visual & Browser Self-Verification
- Never finish immediately after editing code. Always start/check `http://localhost:5173/`, launch the headless browser subagent, capture screenshots of every modified scene, and verify:
  1. Zero console/runtime/404 model-loading errors.
  2. Real `.glb` models are visibly rendered, properly scaled, and grounded on roads/floors.
  3. Zero clipping/phasing through furniture or signposts, and zero overlapping UI prompts.
- Fix any visual flaw detected in screenshots before reporting completion.