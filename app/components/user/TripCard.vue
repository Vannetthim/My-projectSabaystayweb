<script setup lang="ts">
defineProps<{
  trip?: {
    id: string | number
    hotelName: string
    location: string
    checkIn: string
    checkOut: string
    status: string
    price: number
  }
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
    <div class="flex justify-between items-start">
      <div>
        <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          {{ trip?.status || 'Confirmed' }}
        </span>
        <h4 class="font-serif font-bold text-slate-900 text-lg mt-1">
          {{ trip?.hotelName || 'The Azure Retreat' }}
        </h4>
        <p class="text-xs text-slate-400">📍 {{ trip?.location || 'Maldives' }}</p>
      </div>
      <span class="text-lg font-bold text-slate-900">${{ trip?.price || 600 }}</span>
    </div>

    <div class="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
      <div>
        <span class="block text-[10px] text-slate-400 uppercase font-semibold">Check-In</span>
        <span class="font-semibold text-slate-700">{{ trip?.checkIn || 'Oct 15, 2026' }}</span>
      </div>
      <div>
        <span class="block text-[10px] text-slate-400 uppercase font-semibold">Check-Out</span>
        <span class="font-semibold text-slate-700">{{ trip?.checkOut || 'Oct 22, 2026' }}</span>
      </div>
    </div>
  </div>
</template>