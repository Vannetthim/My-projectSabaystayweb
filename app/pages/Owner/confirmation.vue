<template>
  <div class="bg-gray-50 min-h-screen py-16 px-6 flex items-center justify-center">
    <div class="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
      <!-- Success Icon -->
      <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto">
        ✓
      </div>

      <div>
        <h1 class="text-3xl font-serif font-bold text-gray-900">Booking Confirmed!</h1>
        <p class="text-sm text-gray-500 mt-2">Thank you for your reservation. A confirmation email has been sent to your inbox.</p>
      </div>

      <!-- Receipt Card -->
      <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 text-left space-y-3 text-sm">
        <div class="flex justify-between border-b border-gray-200 pb-2">
          <span class="text-xs text-gray-400 font-semibold uppercase">Booking Reference</span>
          <span class="font-bold text-indigo-950">{{ bookingRef }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Guest Name</span>
          <span class="font-medium text-gray-900">{{ guestName }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Booking Status</span>
          <span class="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">Confirmed</span>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-2 font-bold text-base">
          <span class="text-gray-900">Total Paid</span>
          <span class="text-indigo-950">${{ totalPaid }}</span>
        </div>
      </div>

      <div class="flex gap-4 pt-2">
        <NuxtLink to="/" class="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors">
          Return Home
        </NuxtLink>
        <NuxtLink to="/Owner/booking" class="w-full py-3 bg-indigo-950 hover:bg-indigo-900 text-white font-medium rounded-xl text-sm transition-colors shadow-sm">
          View in Owner Panel
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const bookingRef = computed(() => route.query.ref || 'BK-1001')
const guestName = computed(() => route.query.guest || 'Valued Guest')
const totalPaid = computed(() => route.query.total || '825')
</script>