// Simple 3D models made from basic shapes.
// A real product would load scanned 3D models from a file instead.
// Each one returns the model (a group of shapes) and its height in metres.

import * as THREE from "three";

// Make a shape, give it a colour and put it at x, y, z.
function shape(geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
}

const models = {
  pump: () => [
    shape(new THREE.BoxGeometry(1.6, 0.25, 0.9), "#475569", 0, 0.12, 0), // base
    shape(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 24), "#3b82f6", 0, 0.85, 0), // pump body
  ],
  tank: () => [
    shape(new THREE.CylinderGeometry(1.3, 1.3, 3.4, 40), "#cbd5e1", 0, 1.7, 0), // tank
    shape(new THREE.SphereGeometry(1.3, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), "#cbd5e1", 0, 3.4, 0), // round top
  ],
  exchanger: () => [
    shape(new THREE.BoxGeometry(1.4, 2.2, 1), "#0d9488", 0, 1.1, 0),
  ],
  valve: () => [
    shape(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 8), "#475569", 0, 0.7, 0), // post
    shape(new THREE.SphereGeometry(0.28, 20, 14), "#dc2626", 0, 1.4, 0), // valve on the pipe
  ],
  filter: () => [
    shape(new THREE.CylinderGeometry(0.45, 0.45, 1.5, 24), "#7c3aed", 0, 0.75, 0),
  ],
  panel: () => [
    shape(new THREE.BoxGeometry(1.6, 2, 0.5), "#e2e8f0", 0, 1, 0),
  ],
};

const heights = { pump: 1.5, tank: 4.7, exchanger: 2.2, valve: 1.7, filter: 1.5, panel: 2 };

export function buildEquipment(type) {
  const group = new THREE.Group();
  group.add(...models[type]());
  return { group, height: heights[type] };
}
