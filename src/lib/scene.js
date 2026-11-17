// The 3D plant room, built with Three.js.
// PlantViewer.vue creates it once, then only calls the 4 functions at the bottom.

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { buildEquipment } from "./models";
import { statusColor } from "./maintenance";

const START_CAMERA = new THREE.Vector3(13, 13, 17);
const START_TARGET = new THREE.Vector3(0, 0.8, 0);

export function createPlantScene(container, { items, pipes, onSelect }) {
  // 1. Scene (the stage), camera (our eye) and renderer (draws the picture).
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0b1220");

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  camera.position.copy(START_CAMERA);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio); // sharp on Retina screens
  container.appendChild(renderer.domElement);

  // The ID labels above each item are normal HTML, drawn by a second renderer.
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.cssText = "position:absolute; inset:0; pointer-events:none";
  container.appendChild(labelRenderer.domElement);

  // Drag to rotate, scroll or pinch to zoom.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(START_TARGET);
  controls.maxPolarAngle = Math.PI * 0.47; // never look from under the floor

  // 2. Light and floor.
  scene.add(new THREE.HemisphereLight("#cbd5e1", "#1e293b", 1.6));
  const sun = new THREE.DirectionalLight("#ffffff", 2.2);
  sun.position.set(8, 16, 10);
  scene.add(sun);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 14), new THREE.MeshStandardMaterial({ color: "#1e293b" }));
  floor.rotation.x = -Math.PI / 2; // lay the plane flat
  scene.add(floor);

  // 3. Pipes: a thin cylinder between each pair of points, 1.4 m above the floor.
  const pipeMaterial = new THREE.MeshStandardMaterial({ color: "#64748b" });
  for (const line of pipes) {
    const points = line.map(([x, z]) => new THREE.Vector3(x, 1.4, z));
    for (let i = 0; i < points.length - 1; i++) {
      scene.add(pipeBetween(points[i], points[i + 1], pipeMaterial));
    }
  }

  // 4. Equipment: the 3D model, a status ring on the floor and an ID label.
  const parts = {}; // id -> { group, ring, label, height }

  for (const item of items) {
    const { group, height } = buildEquipment(item.type);
    const [x, z] = item.position;
    group.position.set(x, 0, z);
    group.traverse((mesh) => (mesh.userData.id = item.id)); // so a click knows which item it hit
    scene.add(group);

    const ring = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.35, 48), new THREE.MeshBasicMaterial());
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.02, z);
    if (item.type === "tank") ring.scale.setScalar(1.5); // tanks are wider
    scene.add(ring);

    const label = document.createElement("div");
    label.className = "label-3d";
    label.textContent = item.id;
    const labelObject = new CSS2DObject(label);
    labelObject.position.y = height + 0.4;
    group.add(labelObject);

    parts[item.id] = { group, ring, label, height };
  }

  // 5. Clicking: shoot an invisible ray from the camera through the mouse
  //    and see which item it hits first.
  const raycaster = new THREE.Raycaster();

  function itemAt(event) {
    const box = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - box.left) / box.width) * 2 - 1, // -1 (left) to 1 (right)
      -((event.clientY - box.top) / box.height) * 2 + 1, // -1 (bottom) to 1 (top)
    );
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(scene.children, true).find((h) => h.object.userData.id);
    return hit ? hit.object.userData.id : null;
  }

  // Dragging rotates the room, so only count it as a click if the mouse hardly moved.
  let downX = 0;
  let downY = 0;
  renderer.domElement.addEventListener("pointerdown", (e) => {
    downX = e.clientX;
    downY = e.clientY;
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) < 6) onSelect(itemAt(e));
  });

  // 6. Camera flight: each frame, move 10% of the way to where we want to be.
  let goalCamera = null;
  let goalTarget = null;

  function flyTo(cameraPosition, target) {
    goalCamera = cameraPosition;
    goalTarget = target;
  }

  controls.addEventListener("start", () => (goalCamera = null)); // the user takes over

  // Keep the canvas the same size as its box.
  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Draw a new picture about 60 times a second.
  renderer.setAnimationLoop(() => {
    if (goalCamera) {
      camera.position.lerp(goalCamera, 0.1);
      controls.target.lerp(goalTarget, 0.1);
    }
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });

  // The 4 functions Vue can call.
  return {
    // Colour each ring by status, e.g. { "P-101": "overdue" }.
    setStatuses(statuses) {
      for (const id in statuses) parts[id]?.ring.material.color.set(statusColor[statuses[id]]);
    },

    // Highlight the selected item's label.
    setSelected(selectedId) {
      for (const id in parts) parts[id].label.classList.toggle("is-selected", id === selectedId);
    },

    // Fly to an item, keeping the current viewing angle. Tall items need more distance.
    focus(id) {
      const part = parts[id];
      const target = part.group.position.clone().setY(part.height / 2);
      const direction = camera.position.clone().sub(controls.target).normalize();
      flyTo(target.clone().add(direction.multiplyScalar(6 + part.height * 2)), target);
    },

    resetView() {
      flyTo(START_CAMERA.clone(), START_TARGET.clone());
    },

    // Clean up when the page closes the viewer.
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      container.replaceChildren();
    },
  };
}

// A straight pipe from point a to point b.
function pipeBetween(a, b, material) {
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, a.distanceTo(b), 12), material);
  pipe.position.copy(a).lerp(b, 0.5); // halfway between a and b
  pipe.lookAt(b);
  pipe.rotateX(Math.PI / 2); // a cylinder stands up, so tip it over to point at b
  return pipe;
}
