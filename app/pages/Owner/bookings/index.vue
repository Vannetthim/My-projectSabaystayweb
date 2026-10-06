<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/auth/useAuth'
import { useFirestoreDB } from '~/composables/useFirestoreDB'
import { Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'owner',
  middleware: ['owner']
})

const { user } = useAuth()
const { getHotels, getBookings } = useFirestoreDB()

const loading = ref(true)
const bookings = ref([])
const currentFilter = ref('All')

const loadOwnerBookings = async () => {
  loading.value = true
  try {
    const currentUid = user.value?.id || user.value?.uid
    const isAdmin = user.value?.role === 'admin'

    // 1. Fetch hotels with fallback support for unassigned ownerIds
    const hotels = await getHotels()
    const ownerHotels = isAdmin ? hotels : hotels.filter(h => !h.ownerId || h.ownerId === currentUid || h.ownerId === user.value?.email)
    const ownerHotelIds = ownerHotels.map(h => h.id)
    const ownerHotelNames = ownerHotels.map(h => h.name?.toLowerCase())

    // 2. Fetch Bookings with fallback
    const allBookings = await getBookings()
    const filteredBookings = isAdmin ? allBookings : allBookings.filter(b => {
      if (ownerHotels.length === 0) return true
      const isDirectOwner = b.ownerId === currentUid || b.ownerId === user.value?.email
      const matchesHotelId = ownerHotelIds.includes(b.hotelId)
      const matchesHotelName = ownerHotelNames.includes((b.property || b.hotelName || '').toLowerCase())
      return isDirectOwner || matchesHotelId || matchesHotelName
    })

    bookings.value = filteredBookings.map((b, index) => {
      const guestName = b.guest || b.guestName || b.userName || 'Guest'
      const initials = guestName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

      return {
        id: b.id || index,
        ref: b.ref || `#${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        hotelName: b.property || b.hotelName || 'Property Name',
        guest: guestName,
        email: b.email || b.guestEmail || 'guest@example.com',
        initials: initials || 'GS',
        dates: `${b.checkIn || 'TBD'} — ${b.checkOut || 'TBD'}`,
        price: Number(b.totalPrice || b.payout || b.price || 100),
        status: b.status ? b.status.charAt(0).toUpperCase() + b.status.slice(1) : 'Pending'
      }
    })
  } catch (err) {
    console.error('Error loading owner bookings:', err)
  } finally {
    loading.value = false
  }
}

const filteredBookings = computed(() => {
  if (currentFilter.value === 'All') return bookings.value
  return bookings.value.filter(b => b.status.toLowerCase() === currentFilter.value.toLowerCase())
})

const statusBadgeClass = (status) => {
  const s = status?.toLowerCase()
  if (s === 'confirmed') return 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
  if (s === 'pending') return 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
  if (s === 'completed') return 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/50'
  if (s === 'cancelled') return 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
  return 'bg-slate-800 text-slate-400 border border-slate-700'
}

onMounted(() => {
  loadOwnerBookings()
})
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-6 font-sans bg-[#090d16] text-slate-200 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Owner Bookings</h1>
        <p class="text-xs text-slate-400 mt-1">View guest reservations and stay details for your properties.</p>
      </div>
      <div class="bg-[#101524] px-4 py-2 rounded-lg border border-slate-800/80 shadow-md text-xs font-semibold text-slate-300 self-start sm:self-auto">
        Total Bookings: <span class="text-amber-400 font-bold">{{ bookings.length }}</span>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex flex-wrap gap-2">
      <button 
        v-for="tab in ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']" 
        :key="tab"
        @click="currentFilter = tab"
        :class="[
          'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer',
          currentFilter === tab 
            ? 'bg-[#151a30] text-amber-400 border-amber-500/40 shadow-sm' 
            : 'bg-[#101524] text-slate-400 border-slate-800/80 hover:text-white hover:bg-[#141b2d]'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-amber-500" />
    </div>

    <!-- Bookings Table (View Only) -->
    <div v-else class="bg-[#101524] rounded-lg border border-slate-800/80 shadow-md overflow-hidden">
      <div v-if="filteredBookings.length === 0" class="text-center py-16 text-slate-400 text-sm">
        No bookings found.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-[#141b2d] text-slate-400 uppercase tracking-wider border-b border-slate-800/80 font-bold">
              <th class="py-4 px-6">Ref</th>
              <th class="py-4 px-6">Hotel Name</th>
              <th class="py-4 px-6">Guest</th>
              <th class="py-4 px-6">Stay Dates</th>
              <th class="py-4 px-6">Price</th>
              <th class="py-4 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr v-for="b in filteredBookings" :key="b.id" class="hover:bg-[#141b2d]/60 transition">
              <td class="py-4 px-6 font-mono text-xs text-slate-400">{{ b.ref }}</td>
              <td class="py-4 px-6 font-bold text-white">{{ b.hotelName }}</td>
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md text-xs flex items-center justify-center font-bold shrink-0">
                    {{ b.initials }}
                  </span>
                  <div>
                    <p class="font-bold text-slate-200 text-xs">{{ b.guest }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5">{{ b.email }}</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-6 text-xs text-slate-300 font-medium">{{ b.dates }}</td>
              <td class="py-4 px-6 font-bold text-amber-400 text-sm">${{ b.price }}</td>
              <td class="py-4 px-6 text-right">
                <span :class="statusBadgeClass(b.status)" class="px-2.5 py-1 text-[10px] rounded-md font-bold uppercase inline-block">
                  {{ b.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>