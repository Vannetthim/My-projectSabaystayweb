<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from '~/composables/auth/useAuth'

const { user, logout } = useAuth()

const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

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
  <div class="min-h-screen bg-[#070b14] text-slate-100 font-sans flex">
    <!-- Backdrop overlay for mobile navigation -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden transition-opacity"
      @click="closeMobileMenu"
    />

    <!-- Dark Sidebar -->
    <aside
      :class="[
        'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-800/80 bg-[#0b111e] p-6 transition-transform duration-300 ease-in-out lg:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div>
        <!-- Logo Area -->
        <div class="mb-8 flex items-center justify-between">
          <NuxtLink to="/admin" class="flex items-center gap-2.5" @click="closeMobileMenu">
            <div class="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-500 font-black text-[#0b111e] shadow-md shadow-amber-500/10">
              S
            </div>
            <span class="text-xl font-black uppercase tracking-wider text-white">
              SABAY<span class="text-amber-500">STAY</span>
            </span>
          </NuxtLink>

          <!-- Close button on mobile -->
          <button
            type="button"
            class="rounded-sm p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            @click="closeMobileMenu"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            exact-active-class="!bg-amber-500/15 !text-amber-400 !border-amber-500/50 font-bold"
            class="flex items-center gap-3 rounded-sm border border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 transition-all hover:bg-slate-800/60 hover:text-white"
            @click="closeMobileMenu"
          >
            <svg class="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="link.icon" />
            </svg>
            <span>{{ link.name }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Logout Button -->
      <button
        type="button"
        class="flex cursor-pointer items-center gap-3 rounded-sm border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-rose-400 transition-all hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-300"
        @click="logout"
      >
        <svg class="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Logout</span>
      </button>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex min-h-screen flex-1 flex-col transition-all duration-300 lg:ml-64">
      <!-- Dark Top Header -->
      <header class="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800/80 bg-[#0b111e]/90 px-4 backdrop-blur-md sm:px-8">
        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-sm border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:bg-slate-700 hover:text-white lg:hidden"
          @click="toggleMobileMenu"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="ml-auto flex items-center gap-3 sm:gap-4">
          <!-- Notification Button with Amber Badge -->
          <NuxtLink 
            to="/admin/notifications" 
            class="relative flex h-10 w-10 items-center justify-center rounded-sm border border-slate-700/80 bg-[#121929] text-slate-300 shadow-xs transition-colors hover:border-amber-500/50 hover:text-amber-400"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-xs bg-amber-500 text-[10px] font-black text-black">
              7
            </span>
          </NuxtLink>

          <!-- User Profile Pill -->
          <div class="flex items-center gap-2.5 rounded-sm border border-slate-700/80 bg-[#121929] p-1.5 pl-3.5 shadow-xs sm:gap-3">
            <div class="text-right">
              <p class="text-xs font-black tracking-tight text-white">{{ displayName }}</p>
              <p class="text-[10px] font-bold uppercase tracking-wider text-amber-500">{{ userRole }}</p>
            </div>
            <div class="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-amber-500/40 bg-amber-500 text-sm font-black text-[#0b111e]">
              <img v-if="photoURL" :src="photoURL" alt="Profile" class="h-full w-full object-cover" />
              <span v-else>{{ userInitial }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Slot Area -->
      <main class="flex-1 bg-[#070b14] p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>