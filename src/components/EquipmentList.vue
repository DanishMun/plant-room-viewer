<script setup>
// The list of equipment, most urgent first. Clicking a row selects it in 3D too.
import { statusColor } from "../lib/maintenance";

defineProps({
  rows: { type: Array, required: true },
  selectedId: { type: String, default: null },
  filter: { type: String, required: true }, // "all" or "attention"
});
const emit = defineEmits(["select", "update:filter"]);

const filters = [
  { value: "all", label: "All" },
  { value: "attention", label: "Needs attention" },
];
</script>

<template>
  <section class="flex h-full flex-col">
    <div class="flex gap-1 rounded-lg bg-slate-800/70 p-1" role="tablist" aria-label="Filter equipment">
      <button
        v-for="option in filters"
        :key="option.value"
        role="tab"
        :aria-selected="filter === option.value"
        class="flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium transition"
        :class="filter === option.value ? 'bg-slate-950 text-white shadow' : 'text-slate-400 hover:text-slate-200'"
        @click="emit('update:filter', option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <ul class="mt-3 space-y-1 overflow-y-auto">
      <li v-for="row in rows" :key="row.id">
        <button
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition"
          :class="row.id === selectedId ? 'bg-teal-400/15 ring-1 ring-teal-400/60' : 'hover:bg-slate-800/70'"
          @click="emit('select', row.id)"
        >
          <span class="size-2.5 shrink-0 rounded-full" :style="{ background: statusColor[row.status] }" />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-slate-100">{{ row.name }}</span>
            <span class="block font-mono text-xs text-slate-400">{{ row.id }}</span>
          </span>
          <span
            class="shrink-0 text-xs"
            :class="{ 'text-rose-400': row.status === 'overdue', 'text-amber-400': row.status === 'soon', 'text-slate-400': row.status === 'ok' }"
          >
            {{ row.dueText }}
          </span>
        </button>
      </li>
      <li v-if="rows.length === 0" class="px-3 py-6 text-center text-sm text-slate-400">
        Nothing needs attention. Everything is serviced.
      </li>
    </ul>
  </section>
</template>
