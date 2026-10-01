<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
    <!-- Mobile Top Navigation Bar -->
    <header class="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between">
      <NuxtLink to="/owner/owner_dashboard" class="text-xl font-serif font-bold text-indigo-950">
        SabayStay <span class="text-xs font-sans px-2 py-0.5 rounded bg-amber-100 text-amber-800 ml-1">Owner</span>
      </NuxtLink>
      <button 
        @click="mobileMenuOpen = !mobileMenuOpen" 
        class="p-2 text-gray-600 hover:text-indigo-950 focus:outline-none"
      >
        <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
        <X v-else class="w-6 h-6" />
      </button>
    </header>

    <!-- Desktop Sidebar & Mobile Dropdown -->
    <aside 
      :class="[
        mobileMenuOpen ? 'block' : 'hidden',
        'w-full md:w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 md:flex shrink-0'
      ]"
    >
      <div>
        <!-- Brand Logo (Desktop) -->
        <NuxtLink to="/owner/owner_dashboard" class="hidden md:block text-2xl font-serif font-bold text-indigo-950 mb-8">
          SabayStay 
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="space-y-1" @click="mobileMenuOpen = false">
          <NuxtLink 
            to="/owner/owner_dashboard" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <LayoutDashboard class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            Overview
          </NuxtLink>

          <NuxtLink 
            to="/owner/my_hotels" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <Building2 class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            My Properties
          </NuxtLink>
          
          <NuxtLink 
            :to="roomTargetLink" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <BedDouble class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            Rooms
          </NuxtLink>

          <NuxtLink 
            to="/owner/bookings" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <CalendarCheck class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            Bookings
          </NuxtLink>

          <NuxtLink 
            to="/owner/revenue" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <TrendingUp class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            Revenue
          </NuxtLink>

          <NuxtLink 
            to="/owner/reviews" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <Star class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            Reviews
          </NuxtLink>

          <NuxtLink 
            to="/owner/earnings" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors group"
            active-class="bg-indigo-950 !text-white font-semibold"
          >
            <Wallet class="w-5 h-5 transition-colors group-[.bg-indigo-950]:text-white text-gray-500" />
            Earnings
          </NuxtLink>
        </nav>
      </div>

      <!-- Action Section -->
      <div class="pt-4 border-t border-gray-100 space-y-2 mt-6 md:mt-0">
        <NuxtLink 
          to="/" 
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Globe class="w-5 h-5 text-gray-500" />
          User View
        </NuxtLink>
        <button 
          @click="handleExit" 
          class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut class="w-5 h-5 text-red-500" />
          Exit & Logout
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
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