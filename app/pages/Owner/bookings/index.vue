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
  if (s === 'confirmed') return 'bg-emerald-100 text-emerald-700'
  if (s === 'pending') return 'bg-amber-100 text-amber-700'
  if (s === 'completed') return 'bg-indigo-100 text-indigo-700'
  if (s === 'cancelled') return 'bg-rose-100 text-rose-700'
  return 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  loadOwnerBookings()
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-serif font-bold text-gray-900">Owner Bookings</h1>
        <p class="text-gray-500 text-sm mt-1">View guest reservations and stay details for your properties.</p>
      </div>
      <div class="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-sm font-semibold text-gray-700">
        Total Bookings: {{ bookings.length }}
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-2 mb-6">
      <button 
        v-for="tab in ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled']" 
        :key="tab"
        @click="currentFilter = tab"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition',
          currentFilter === tab ? 'bg-indigo-950 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
        ]"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-950" />
    </div>

    <!-- Bookings Table (View Only) -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div v-if="filteredBookings.length === 0" class="text-center py-16 text-gray-400 text-sm">
        No bookings found.
      </div>
      <table v-else class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-gray-50/75 text-xs text-gray-500 border-b border-gray-200">
            <th class="py-3 px-4 font-medium">Ref</th>
            <th class="py-3 px-4 font-medium">Hotel Name</th>
            <th class="py-3 px-4 font-medium">Guest</th>
            <th class="py-3 px-4 font-medium">Stay Dates</th>
            <th class="py-3 px-4 font-medium">Price</th>
            <th class="py-3 px-4 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="b in filteredBookings" :key="b.id" class="hover:bg-gray-50/50 transition">
            <td class="py-3.5 px-4 font-mono text-xs text-gray-500">{{ b.ref }}</td>
            <td class="py-3.5 px-4 font-medium text-gray-900">{{ b.hotelName }}</td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2.5">
                <span class="w-7 h-7 bg-indigo-950 text-white rounded-full text-xs flex items-center justify-center font-semibold flex-shrink-0">
                  {{ b.initials }}
                </span>
                <div>
                  <p class="font-medium text-gray-900 text-xs">{{ b.guest }}</p>
                  <p class="text-[11px] text-gray-400">{{ b.email }}</p>
                </div>
              </div>
            </td>
            <td class="py-3.5 px-4 text-xs text-gray-600">{{ b.dates }}</td>
            <td class="py-3.5 px-4 font-semibold text-gray-900">${{ b.price }}</td>
            <td class="py-3.5 px-4 text-right">
              <span :class="statusBadgeClass(b.status)" class="px-2.5 py-1 text-[11px] rounded-full font-medium inline-block">
                {{ b.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>