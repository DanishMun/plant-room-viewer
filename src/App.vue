<script setup>
// The page: a list on the left, the 3D room in the middle, details on the right.
// All the state lives here; the child components only show it and send events back.
import { computed, ref } from "vue";
import PlantViewer from "./components/PlantViewer.vue";
import EquipmentList from "./components/EquipmentList.vue";
import EquipmentPanel from "./components/EquipmentPanel.vue";
import { equipment, pipes } from "./data/equipment";
import {
  countByStatus, daysUntilService, describeDue, nextServiceDate, serviceStatus, sortByUrgency, statusColor, toText,
} from "./lib/maintenance";

const today = new Date();
const todayText = toText(today);

// A copy of the sample data that the user can change ("mark as serviced").
const items = ref(equipment.map((item) => ({ ...item })));
const selectedId = ref(null);
const filter = ref("all");
const viewer = ref(null);

// Each item plus everything the screen needs to show about it.
const rows = computed(() =>
  sortByUrgency(items.value, today).map((item) => {
    const days = daysUntilService(item, today);
    return {
      ...item,
      status: serviceStatus(item, today),
      dueText: describeDue(days),
      nextService: toText(nextServiceDate(item)),
      servicedToday: item.lastService === todayText,
    };
  }),
);

const visibleRows = computed(() =>
  filter.value === "all" ? rows.value : rows.value.filter((row) => row.status !== "ok"),
);

const statuses = computed(() => Object.fromEntries(rows.value.map((row) => [row.id, row.status])));
const counts = computed(() => countByStatus(items.value, today));
const selectedRow = computed(() => rows.value.find((row) => row.id === selectedId.value) ?? null);

function select(id) {
  selectedId.value = id;
}

function markServiced(id) {
  const item = items.value.find((i) => i.id === id);
  if (item) item.lastService = todayText;
}

function resetView() {
  selectedId.value = null;
  viewer.value?.resetView();
}

const summary = [
  { key: "overdue", label: "Overdue" },
  { key: "soon", label: "Due soon" },
  { key: "ok", label: "OK" },
];
</script>

<template>
  <div class="flex min-h-dvh flex-col text-slate-200 lg:h-dvh">
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 px-4 py-3 sm:px-6">
      <div>
        <h1 class="text-lg font-semibold text-white">Plant Room Viewer</h1>
        <p class="text-sm text-slate-400">A 3D maintenance view. Click any equipment to see when it needs service.</p>
      </div>
      <ul class="flex gap-2" aria-label="Service summary">
        <li
          v-for="part in summary"
          :key="part.key"
          class="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-sm ring-1 ring-slate-800"
        >
          <span class="size-2 rounded-full" :style="{ background: statusColor[part.key] }" />
          <span class="font-semibold text-white">{{ counts[part.key] }}</span>
          <span class="text-slate-400">{{ part.label }}</span>
        </li>
      </ul>
    </header>

    <main class="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[300px_1fr_340px]">
      <!-- 3D view: first on phones, in the middle on large screens -->
      <div class="relative h-[55vh] border-slate-800 lg:order-2 lg:h-auto lg:border-x">
        <PlantViewer
          ref="viewer"
          :items="items"
          :pipes="pipes"
          :statuses="statuses"
          :selected-id="selectedId"
          @select="select"
        />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
          <p class="hidden rounded-md bg-slate-950/70 px-2.5 py-1.5 text-xs text-slate-400 backdrop-blur sm:block">
            Drag to rotate · Scroll or pinch to zoom · Click to select
          </p>
          <button
            class="pointer-events-auto ml-auto whitespace-nowrap rounded-md bg-slate-900/90 px-3 py-1.5 text-sm font-medium text-slate-200 ring-1 ring-slate-700 backdrop-blur hover:bg-slate-800"
            @click="resetView"
          >
            Reset view
          </button>
        </div>
      </div>

      <!-- On phones the details only appear once something is selected -->
      <aside
        class="border-b border-slate-800 p-4 sm:p-5 lg:order-3 lg:block lg:overflow-y-auto lg:border-b-0"
        :class="{ hidden: !selectedRow }"
      >
        <EquipmentPanel :row="selectedRow" @serviced="markServiced" @close="select(null)" />
      </aside>

      <aside class="p-4 sm:p-5 lg:order-1 lg:min-h-0">
        <EquipmentList v-model:filter="filter" :rows="visibleRows" :selected-id="selectedId" @select="select" />
      </aside>
    </main>

    <footer class="border-t border-slate-800 px-4 py-2.5 text-xs text-slate-500 sm:px-6">
      Demo with sample data · Built by
      <a class="text-slate-300 underline-offset-2 hover:underline" href="https://www.danishmunawar.com">Danish Munawar</a>
      with Vue 3, Three.js and Tailwind CSS
    </footer>
  </div>
</template>
