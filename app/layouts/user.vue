<script setup lang="ts">
import {
  User,
  Heart,
  CalendarCheck,
  Star,
  Compass,
  ArrowLeft,
} from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 lg:flex font-sans">
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-b border-slate-200 bg-white lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r"
    >
      <!-- Logo Header matching Admin Panel -->
      <div class="flex items-center justify-between p-6 lg:block border-b border-slate-100">
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-3 font-serif text-xl font-bold text-slate-900 tracking-wide"
        >
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1b1947] text-white shadow-sm">
            <Compass class="h-5 w-5" />
          </div>
          <span>SabayStay</span>
        </NuxtLink>
      </div>

      <!-- Navigation Links -->
      <nav
        class="flex gap-2 overflow-x-auto px-4 py-4 lg:block lg:flex-1 lg:space-y-1 lg:px-4"
        aria-label="Dashboard navigation"
      >
        <NuxtLink
          to="/dashboard/profile"
          active-class="bg-[#1b1947] font-bold !text-white shadow-sm"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:bg-[#1b1947] hover:text-white"
        >
          <User class="h-4 w-4 shrink-0" />
          <span>Profile</span>
        </NuxtLink>

        <NuxtLink
          to="/dashboard/favorites"
          active-class="bg-[#1b1947] font-bold !text-white shadow-sm"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:bg-[#1b1947] hover:text-white"
        >
          <Heart class="h-4 w-4 shrink-0" />
          <span>Favorites</span>
        </NuxtLink>

        <NuxtLink
          to="/dashboard/bookings"
          active-class="bg-[#1b1947] font-bold !text-white shadow-sm"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:bg-[#1b1947] hover:text-white"
        >
          <CalendarCheck class="h-4 w-4 shrink-0" />
          <span>Bookings</span>
        </NuxtLink>

        <NuxtLink
          to="/dashboard/reviews"
          active-class="bg-[#1b1947] font-bold !text-white shadow-sm"
          class="flex shrink-0 items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:bg-[#1b1947] hover:text-white"
        >
          <Star class="h-4 w-4 shrink-0" />
          <span>Reviews</span>
        </NuxtLink>
      </nav>

      <!-- Exit Button -->
      <div class="p-4 mt-auto border-t border-slate-100">
        <NuxtLink
          to="/"
          class="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold tracking-wide text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 shadow-sm"
        >
          <ArrowLeft class="h-4 w-4 text-slate-400" />
          <span>Exit to Homepage</span>
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area matching Admin layout alignment -->
    <main class="w-full max-w-6xl px-6 py-8 lg:px-8">
      <slot />
    </main>
  </div>
</template>