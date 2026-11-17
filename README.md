# Plant Room Viewer

A small 3D maintenance tool in the browser. A plant room with pumps, tanks, valves, a filter,
a heat exchanger and a control panel. Click any piece of equipment to see when it needs service.

**Live demo:** https://plant-room-viewer.vercel.app

## What it does

- A 3D room you can rotate and zoom (mouse or touch).
- A coloured ring under each item shows its service status: green OK, amber due within 30 days, red overdue (pulsing).
- Click an item in 3D or in the list: the camera flies to it and the details open.
- "Mark as serviced today" updates the status, the ring colour and the counts straight away.
- Filter the list to only what needs attention. Works on phones too.

## Built with

- **Vue 3** (Composition API, `<script setup>`) for the interface
- **Three.js** for the 3D scene, with OrbitControls and CSS2D labels
- **Tailwind CSS** for styling
- **Vite** for building, **Vitest** for tests

## How the code is organised

| File | What it does |
|---|---|
| `src/data/equipment.js` | Sample equipment and pipes. In a real product this would come from an API. |
| `src/lib/maintenance.js` | Service rules (next date, days left, status). Plain functions, fully tested. |
| `src/lib/models.js` | Simple 3D models made from basic shapes. A real product would load scanned models (glTF). |
| `src/lib/scene.js` | The Three.js scene: lights, room, pipes, picking with a raycaster, camera moves. |
| `src/components/PlantViewer.vue` | The bridge: Vue owns the data, the scene only draws it. |
| `src/App.vue` | Page layout and state. |

The 3D scene is plain Three.js, kept outside Vue. Vue only calls a few small functions on it
(`setStatuses`, `setSelected`, `focus`, `resetView`), so the 3D part never re-renders by accident.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # 11 tests
npm run build
```

All data is sample data.
