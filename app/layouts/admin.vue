<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/auth/useAuth'

const { user, logout } = useAuth()

// Dynamic user displays with fallbacks
const displayName = computed(() => {
  if (!user.value) return 'Admin'
  return user.value.displayName || user.value.email?.split('@')[0] || 'Admin'
})

const userRole = computed(() => {
  return (user.value as any)?.role || 'SUPER ADMIN'
})

const userInitial = computed(() => {
  const name = displayName.value
  return name ? name.charAt(0).toUpperCase() : 'A'
})

const photoURL = computed(() => {
  return user.value?.photoURL || (user.value as any)?.avatar || null
})

const navLinks = [
  {
    name: 'Overview',
    path: '/admin',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z'
  },
  {
    name: 'Hotels',
    path: '/admin/Hotels',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-4 4h1m-1 5h1'
  },
  {
    name: 'Rooms',
    path: '/admin/Room',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3'
  },
  {
    name: 'Bookings',
    path: '/admin/Bookings',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    name: 'Guests',
    path: '/admin/Guests',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    name: 'Analytics',
    path: '/admin/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2'
  },
  {
    name: 'Settings',
    path: '/admin/Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
]
</script>

<template>
  <div class="min-h-screen bg-white flex text-slate-800 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 fixed h-full z-20 shadow-xs">
      <div>
        <!-- Logo Area -->
        <div class="flex items-center gap-2 mb-8">
          <div class="w-9 h-9 bg-[#1d1b4b] text-white flex items-center justify-center font-extrabold text-lg rounded-xl shadow-xs">
            S
          </div>
          <span class="text-xl font-serif font-bold text-slate-900 tracking-wide">
            Sabay<span class="text-[#1d1b4b]">Stay</span>
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            exact-active-class="!bg-[#1d1b4b] !text-white font-bold shadow-xs"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-slate-600 hover:bg-slate-100 hover:text-[#1d1b4b]"
          >
            <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
            </svg>
            {{ link.name }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Logout Button -->
      <button
        @click="logout"
        class="flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-sm font-semibold transition-colors cursor-pointer border border-transparent hover:border-rose-200"
      >
        <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 ml-64 flex flex-col min-h-screen bg-white">
      <!-- Top Header -->
      <header class="h-20 bg-white/80 backdrop-blur-md px-8 flex items-center justify-end sticky top-0 z-10 border-b border-slate-200 shadow-2xs">


        <div class="flex items-center gap-4">
          <!-- Notification Button -->
          <NuxtLink 
            to="/admin/notifications" 
            class="relative w-10 h-10 text-slate-500 hover:text-[#1d1b4b] bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </NuxtLink>

          <!-- User Profile Pill -->
          <div class="flex items-center gap-3 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <div class="text-right pl-2">
              <p class="text-xs font-bold text-slate-800">{{ displayName }}</p>
              <p class="text-[10px] text-[#1d1b4b] font-semibold uppercase tracking-wider">{{ userRole }}</p>
            </div>
            <div class="w-9 h-9 rounded-full bg-[#1d1b4b] text-white flex items-center justify-center font-bold text-sm border border-slate-200 overflow-hidden shrink-0">
              <img v-if="photoURL" :src="photoURL" alt="Profile" class="w-full h-full object-cover" />
              <span v-else>{{ userInitial }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Slot -->
      <main class="p-8 flex-1 bg-slate-50/50">
        <slot />
      </main>
    </div>
  </div>
</template>