<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-[#090d16] text-slate-200 font-sans">
    <!-- Mobile Top Navigation Bar -->
    <header class="md:hidden bg-[#0c101c] border-b border-slate-800 p-4 flex items-center justify-between">
      <NuxtLink to="/owner/owner_dashboard" class="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
        <span class="bg-amber-500 text-black px-2 py-0.5 rounded font-extrabold text-lg">S</span>
        <span>SABAY<span class="text-amber-500">STAY</span></span>
      </NuxtLink>
      <button 
        @click="mobileMenuOpen = !mobileMenuOpen" 
        class="p-2 text-slate-400 hover:text-white focus:outline-none"
      >
        <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Desktop Sidebar & Mobile Dropdown -->
    <aside 
      :class="[
        mobileMenuOpen ? 'block' : 'hidden',
        'w-full md:w-64 bg-[#090d19] border-r border-slate-800/80 flex flex-col justify-between p-5 md:flex shrink-0'
      ]"
    >
      <div>
        <!-- Brand Logo (Desktop) -->
        <NuxtLink to="/owner/owner_dashboard" class="hidden md:flex items-center gap-2.5 mb-8 px-2">
          <span class="bg-amber-500 text-black px-2.5 py-1 rounded-md font-extrabold text-xl tracking-tight">S</span>
          <span class="text-xl font-bold tracking-wider text-white">SABAY<span class="text-amber-500">STAY</span></span>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="space-y-1.5" @click="mobileMenuOpen = false">
          <NuxtLink 
            to="/owner/owner_dashboard" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <LayoutDashboard class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Overview
          </NuxtLink>

          <NuxtLink 
            to="/owner/my_hotels" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <Building2 class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Hotels
          </NuxtLink>
          
          <NuxtLink 
            :to="roomTargetLink" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <BedDouble class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Rooms
          </NuxtLink>

          <NuxtLink 
            to="/owner/bookings" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <CalendarCheck class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Bookings
          </NuxtLink>

          <NuxtLink 
            to="/owner/revenue" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <TrendingUp class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Revenue
          </NuxtLink>

          <NuxtLink 
            to="/owner/reviews" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <Star class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Reviews
          </NuxtLink>

          <NuxtLink 
            to="/owner/earnings" 
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all group border border-transparent"
            active-class="!bg-[#151a30] !text-amber-400 !border-amber-500/40 font-bold"
          >
            <Wallet class="w-4 h-4 transition-colors group-[.text-amber-400]:text-amber-400 text-slate-400" />
            Earnings
          </NuxtLink>
        </nav>
      </div>

      <!-- Action Section -->
      <div class="pt-4 border-t border-slate-800/80 space-y-2 mt-6 md:mt-0">
        <NuxtLink 
          to="/" 
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-[#121827] transition-all"
        >
          <Globe class="w-4 h-4 text-slate-400" />
          User View
        </NuxtLink>
        <button 
          @click="handleExit" 
          class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-pink-400/90 hover:text-pink-300 bg-pink-950/30 hover:bg-pink-950/50 border border-pink-900/40 transition-all cursor-pointer"
        >
          <LogOut class="w-4 h-4 text-pink-400" />
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 bg-[#090d16]">
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/auth/useAuth'
import { 
  LayoutDashboard, 
  Building2, 
  BedDouble, 
  CalendarCheck, 
  TrendingUp, 
  Star, 
  Wallet,
  Globe,
  LogOut,
  Menu,
  X 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()

const mobileMenuOpen = ref(false)

const handleExit = async () => {
  try {
    await logout()
    router.push('/auth/login')
  } catch (err) {
    console.error('Logout error:', err)
  }
}

// Dynamic link for Rooms pointing to case-correct /owner/room
const roomTargetLink = computed(() => {
  if (route.query.hotelId) {
    return `/owner/room?hotelId=${route.query.hotelId}`
  }

  if (import.meta.client) {
    const cachedHotels = localStorage.getItem('sabay_hotels_cache')
    if (cachedHotels) {
      try {
        const parsed = JSON.parse(cachedHotels)
        if (parsed.length > 0 && parsed[0].id) {
          return `/owner/room?hotelId=${parsed[0].id}`
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  return '/owner/room'
})
</script>