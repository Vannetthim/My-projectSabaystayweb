<script setup lang="ts">
import { useAuth } from '~/composables/auth/useAuth'

const { user, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <!-- Header -->
    <header class="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-serif font-bold text-indigo-900">SabayStay</NuxtLink>
        <div class="flex items-center gap-4">
          <NuxtLink to="/hotels" class="px-5 py-2.5 bg-amber-700 text-white font-semibold rounded-xl text-xs uppercase">Book Now</NuxtLink>
          <div class="w-10 h-10 rounded-full bg-indigo-900 text-white flex items-center justify-center font-bold text-sm">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
        </div>
      </div>
    </header>

    <!-- Main Body -->
    <div class="max-w-7xl mx-auto w-full flex-1 flex px-6 py-8 gap-8">
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>
