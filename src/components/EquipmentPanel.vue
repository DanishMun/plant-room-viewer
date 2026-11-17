<script setup>
// Details of the selected item, and the "mark as serviced" action.
import { statusColor, statusLabel } from "../lib/maintenance";

defineProps({
  row: { type: Object, default: null },
});
const emit = defineEmits(["serviced", "close"]);
</script>

<template>
  <section v-if="row" class="space-y-5">
    <header class="flex items-start justify-between gap-3">
      <div>
        <p class="font-mono text-xs tracking-wide text-teal-300">{{ row.id }}</p>
        <h2 class="mt-1 text-xl font-semibold text-white">{{ row.name }}</h2>
        <p class="text-sm text-slate-400">{{ row.maker }}</p>
      </div>
      <button
        class="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        aria-label="Close details"
        @click="emit('close')"
      >
        <svg class="size-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <path d="M5 5l10 10M15 5L5 15" />
        </svg>
      </button>
    </header>

    <div
      class="rounded-lg border px-4 py-3"
      :style="{ borderColor: statusColor[row.status] + '66', background: statusColor[row.status] + '14' }"
    >
      <p class="text-sm font-semibold" :style="{ color: statusColor[row.status] }">
        {{ statusLabel[row.status] }} · {{ row.dueText }}
      </p>
      <p class="mt-0.5 text-sm text-slate-300">Next service {{ row.nextService }}</p>
    </div>

    <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
      <div>
        <dt class="text-slate-400">Last service</dt>
        <dd class="font-medium text-slate-100">{{ row.lastService }}</dd>
      </div>
      <div>
        <dt class="text-slate-400">Service every</dt>
        <dd class="font-medium text-slate-100">{{ row.intervalDays }} days</dd>
      </div>
      <div class="col-span-2">
        <dt class="text-slate-400">Note</dt>
        <dd class="text-slate-100">{{ row.note }}</dd>
      </div>
    </dl>

    <button
      class="w-full rounded-lg bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-300 disabled:cursor-default disabled:bg-slate-800 disabled:text-slate-400"
      :disabled="row.servicedToday"
      @click="emit('serviced', row.id)"
    >
      {{ row.servicedToday ? "Serviced today ✓" : "Mark as serviced today" }}
    </button>
  </section>

  <section v-else class="flex h-full flex-col justify-center text-center">
    <svg class="mx-auto size-10 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" /><path d="M4 7.5L12 12l8-4.5M12 12v9" />
    </svg>
    <p class="mt-3 font-medium text-slate-200">Select equipment</p>
    <p class="mt-1 text-sm text-slate-400">Click a pump, tank or valve in the 3D view, or pick one from the list.</p>
  </section>
</template>
