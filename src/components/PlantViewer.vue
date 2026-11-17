<script setup>
// The bridge between Vue and the Three.js scene.
// Vue owns the data; the scene only draws it. When the data changes,
// we call one small function on the scene instead of rebuilding it.
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { createPlantScene } from "../lib/scene";

const props = defineProps({
  items: { type: Array, required: true },
  pipes: { type: Array, required: true },
  statuses: { type: Object, required: true }, // { "P-101": "overdue", ... }
  selectedId: { type: String, default: null },
});
const emit = defineEmits(["select"]);

const container = ref(null);
let plant = null;

onMounted(() => {
  plant = createPlantScene(container.value, {
    items: props.items,
    pipes: props.pipes,
    onSelect: (id) => emit("select", id),
  });
  plant.setStatuses(props.statuses);
});

watch(() => props.statuses, (statuses) => plant?.setStatuses(statuses));

watch(
  () => props.selectedId,
  (id) => {
    plant?.setSelected(id);
    if (id) plant?.focus(id);
  },
);

onBeforeUnmount(() => plant?.dispose());

defineExpose({ resetView: () => plant?.resetView() });
</script>

<template>
  <div ref="container" class="relative h-full w-full overflow-hidden" />
</template>
