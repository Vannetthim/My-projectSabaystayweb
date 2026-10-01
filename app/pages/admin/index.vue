<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  collection,
  onSnapshot,
  type Firestore
} from 'firebase/firestore'
import { definePageMeta, useNuxtApp } from '#imports'
import { useAuth } from '~/composables/auth/useAuth'
import { 
  DollarSign, 
  CalendarCheck, 
  Building2, 
  BedDouble, 
  Search, 
  Sparkles,
  Loader2
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const { user } = useAuth()

interface BookingItem {
  id: string
  bookingDate: string
  customerName: string
  customerAvatar?: string
  customerEmail?: string
  persons: string
  phone: string
  checkIn: string
  checkOut: string
  paymentStatus: string
}

const totalRevenueAmount = ref<number>(0)
const loadingRevenue = ref<boolean>(true)

const totalRooms = ref<number>(0)
const occupiedRooms = ref<number>(0)
const totalBookings = ref<number>(0)
const totalHotels = ref<number>(0)

const firebaseBookings = ref<BookingItem[]>([])
const loadingBookings = ref<boolean>(true)
const firebaseError = ref<string>('')

const searchQuery = ref<string>('')

const monthlyOccupancyData = ref<number[]>(new Array(12).fill(0))
const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

let stopBookingsListener = () => {}
let stopRoomsListener = () => {}
let stopHotelsListener = () => {}

const normalizeStatus = (value?: unknown) => String(value ?? '').trim().toLowerCase()

const availableRooms = computed(() => Math.max(0, totalRooms.value - occupiedRooms.value))

const formattedRevenue = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalRevenueAmount.value)
})

const filteredBookings = computed(() => {
  if (!searchQuery.value.trim()) return firebaseBookings.value
  const query = searchQuery.value.toLowerCase().trim()
  return firebaseBookings.value.filter((item) => {
    return (
      item.customerName.toLowerCase().includes(query) ||
      (item.customerEmail && item.customerEmail.toLowerCase().includes(query)) ||
      item.phone.toLowerCase().includes(query) ||
      item.paymentStatus.toLowerCase().includes(query)
    )
  })
})

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

const parseDate = (data: any): Date => {
  const dateVal = 
    data?.checkIn || 
    data?.checkInDate || 
    data?.createdAt || 
    data?.created_at || 
    data?.date || 
    data?.timestamp || 
    data?.updatedAt

  if (!dateVal) return new Date()
  if (typeof dateVal.toDate === 'function') return dateVal.toDate()
  
  const parsed = new Date(dateVal)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

const formatDateString = (dateInput: any): string => {
  const d = parseDate({ checkIn: dateInput })
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

const formatDateTimeString = (dateInput: any): string => {
  const d = parseDate({ checkIn: dateInput })
  const dateStr = formatDateString(d)
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12
  return `${dateStr} • ${hours}:${minutes}${ampm}`
}

const getCustomMonthIndex = (date: Date): number => {
  const m = date.getMonth()
  const mapping: Record<number, number> = {
    4: 0,  // May
    5: 1,  // Jun
    6: 2,  // Jul
    7: 3,  // Aug
    8: 4,  // Sep
    9: 5,  // Oct
    10: 6, // Nov
    11: 7, // Dec
    0: 8,  // Jan
    1: 9,  // Feb
    2: 10, // Mar
    3: 11  // Apr
  }
  return mapping[m] ?? 0
}

const watchFirebaseData = () => {
  loadingRevenue.value = true
  loadingBookings.value = true
  firebaseError.value = ''
  const db = getDb()
  if (!db) {
    firebaseError.value = 'Firebase is not configured.'
    loadingRevenue.value = false
    loadingBookings.value = false
    return
  }

  stopBookingsListener()
  stopRoomsListener()
  stopHotelsListener()

  stopHotelsListener = onSnapshot(collection(db, 'hotels'), (hotelsSnapshot) => {
    totalHotels.value = hotelsSnapshot.size
  }, (error) => {
    console.error('Hotels snapshot error:', error)
    firebaseError.value = 'Hotels could not be loaded from Firebase.'
  })

  stopRoomsListener = onSnapshot(collection(db, 'rooms'), (roomsSnapshot) => {
    totalRooms.value = roomsSnapshot.size
    occupiedRooms.value = roomsSnapshot.docs.filter((item) => {
      const status = normalizeStatus(item.data().status)
      return ['occupied', 'maintenance'].includes(status)
    }).length
  }, (error) => {
    console.error('Rooms snapshot error:', error)
    firebaseError.value = 'Rooms could not be loaded from Firebase.'
  })

  stopBookingsListener = onSnapshot(collection(db, 'bookings'), (bookingsSnapshot) => {
    totalBookings.value = bookingsSnapshot.size
    let sumRevenue = 0
    const monthlyBookingsCount = new Array(12).fill(0)
    const mappedBookings: BookingItem[] = []

    bookingsSnapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as any
      const status = normalizeStatus(data.status)
      const isPaid = ['paid', 'confirmed', 'completed', 'check-in', 'check-out', 'received'].includes(status)
      const price = Number(data.totalPrice ?? data.total ?? data.amount ?? data.price ?? 0)

      if (isPaid) sumRevenue += price

      const bookingDate = parseDate(data)
      const idx = getCustomMonthIndex(bookingDate)
      
      if (isPaid) {
        monthlyBookingsCount[idx] = (monthlyBookingsCount[idx] || 0) + 1
      }

      const adults = data.adults ?? data.guestsCount ?? data.guests ?? 2
      const children = data.children ?? data.kids ?? 0

      mappedBookings.push({
        id: docSnap.id,
        bookingDate: formatDateString(data.createdAt || data.date || data.bookedAt),
        customerName: data.customerName || data.name || data.fullName || data.guestName || 'Valued Guest',
        customerAvatar: data.avatar || data.photoURL || data.image || data.profileImage || data.photo,
        customerEmail: data.email || data.customerEmail,
        persons: children > 0 ? `${adults} Adults, ${children} Child${children > 1 ? 's' : ''}` : `${adults} Adults`,
        phone: data.phone || data.phoneNumber || data.contact || '+855 12 345 678',
        checkIn: formatDateTimeString(data.checkIn || data.checkInDate),
        checkOut: formatDateTimeString(data.checkOut || data.checkOutDate),
        paymentStatus: isPaid ? 'Received' : (data.paymentStatus || 'Pending')
      })
    })

    totalRevenueAmount.value = sumRevenue
    firebaseBookings.value = mappedBookings

    monthlyOccupancyData.value = monthlyBookingsCount.map((count) => {
      const totalAvailable = Math.max(totalRooms.value, 1)
      const rate = Math.round((count / totalAvailable) * 100)
      return Math.min(100, rate)
    })

    loadingRevenue.value = false
    loadingBookings.value = false
  }, (error) => {
    console.error('Bookings snapshot error:', error)
    firebaseError.value = 'Bookings could not be loaded from Firebase.'
    loadingRevenue.value = false
    loadingBookings.value = false
  })
}

const barGradients = [
  'from-amber-500 to-amber-600',
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-sky-500 to-sky-600',
  'from-purple-500 to-purple-600',
  'from-amber-400 to-amber-500',
  'from-indigo-400 to-indigo-500',
  'from-emerald-400 to-emerald-500',
  'from-sky-400 to-sky-500',
  'from-purple-400 to-purple-500',
  'from-amber-500 to-amber-600',
  'from-indigo-500 to-indigo-600'
]

onMounted(() => {
  watchFirebaseData()
})

onUnmounted(() => {
  stopBookingsListener()
  stopRoomsListener()
  stopHotelsListener()
})

const stats = computed(() => [
  {
    title: 'TOTAL REVENUE',
    value: loadingRevenue.value ? 'Loading...' : formattedRevenue.value,
    change: 'Live Firestore',
    changeColor: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold',
    icon: DollarSign,
    iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  },
  {
    title: 'TOTAL BOOKINGS',
    value: totalBookings.value.toString(),
    change: 'Live reservations',
    changeColor: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold',
    icon: CalendarCheck,
    iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
  },
  {
    title: 'TOTAL HOTELS',
    value: totalHotels.value.toString(),
    change: 'Active properties',
    changeColor: 'text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold',
    icon: Building2,
    iconBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  },
  {
    title: 'TOTAL ROOMS',
    value: `${totalRooms.value}`,
    change: `${occupiedRooms.value} Occ / ${availableRooms.value} Avail`,
    changeColor: 'text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full text-[10px] font-semibold',
    icon: BedDouble,
    iconBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
  }
])
</script>

<template>
  <div class="relative min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950 px-4 py-6 sm:px-8 sm:py-10">
    
    <!-- Ambient Gold Glow Backdrops -->
    <div class="pointer-events-none fixed inset-0 flex justify-center overflow-hidden">
      <div class="h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto space-y-6">
      
      <!-- Top Header & Search Banner -->
      <div class="border border-white/10 bg-slate-900/60 p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
            Administration Platform
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Admin Dashboard
          </h1>
          <p class="text-xs font-light text-slate-400 mt-1">
            Real-time property oversight and central system metrics.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search booking data..."
              class="w-full bg-slate-950/80 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-all duration-300"
            />
          </div>

          <!-- Status Indicator -->
          <div class="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2.5 shrink-0">
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">System Online</span>
          </div>
        </div>
      </div>

      <!-- Sync Alert Ribbon -->
      <div class="border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-950/40 p-4 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] px-2.5 py-1 font-bold uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <Sparkles class="h-3 w-3" /> Live Sync
          </span>
          <span class="text-xs font-light text-slate-300">Connected securely to Firebase Firestore Database.</span>
        </div>
        <span class="text-[10px] font-bold uppercase tracking-widest bg-slate-950/80 border border-white/10 px-3 py-1 text-amber-400 shrink-0">
          SabayStay Admin Engine
        </span>
      </div>

      <!-- Error Alert -->
      <div v-if="firebaseError" class="border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-400" role="alert">
        {{ firebaseError }}
      </div>

      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          v-for="stat in stats" 
          :key="stat.title" 
          class="border border-white/10 bg-slate-900/60 p-5 sm:p-6 flex items-center justify-between shadow-xl backdrop-blur-md hover:border-amber-500/40 transition-all duration-300"
        >
          <div class="space-y-1.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{{ stat.title }}</span>
            <h3 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{{ stat.value }}</h3>
            <div>
              <span :class="stat.changeColor" class="inline-block">{{ stat.change }}</span>
            </div>
          </div>
          <div :class="stat.iconBg" class="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <component :is="stat.icon" class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      <!-- Occupancy Chart Box -->
      <div class="border border-white/10 bg-slate-900/60 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-6">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 class="font-extrabold text-white text-base sm:text-lg tracking-tight">Occupancy Rate Overview</h3>
            <p class="text-xs font-light text-slate-400 mt-0.5">Monthly platform occupancy percentage computed live from active Firebase records.</p>
          </div>
          <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-slate-950 border border-white/10 text-amber-400 px-3 py-1.5 self-start sm:self-auto">
            May - Apr
          </span>
        </div>

        <!-- Chart Graphic Container -->
        <div class="bg-slate-950/80 p-4 sm:p-6 border border-white/5 overflow-x-auto">
          <div class="min-w-[550px] flex h-64 items-end pt-4 relative px-2">
            <!-- Y-Axis -->
            <div class="flex flex-col justify-between h-full text-[10px] font-bold text-slate-500 pr-3 sm:pr-4 border-r border-white/10 shrink-0 text-right">
              <span>100%</span><span>80%</span><span>60%</span><span>40%</span><span>20%</span><span>0%</span>
            </div>

            <!-- Bar Columns -->
            <div class="relative flex-1 h-full flex items-end justify-around pl-3 sm:pl-4">
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div v-for="n in 6" :key="n" class="border-b border-white/5 w-full"></div>
              </div>

              <div 
                v-for="(rate, idx) in monthlyOccupancyData" 
                :key="idx" 
                class="relative z-10 flex flex-col items-center group h-full justify-end w-6 sm:w-8 lg:w-10"
              >
                <!-- Hover Tooltip -->
                <div class="absolute -top-9 bg-slate-900 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                  {{ rate }}%
                </div>
                <div 
                  class="w-full bg-gradient-to-t transition-all duration-500 group-hover:brightness-125 shadow-lg" 
                  :class="barGradients[idx % barGradients.length]"
                  :style="{ height: rate > 0 ? `${rate}%` : '4px' }"
                />
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute -bottom-7">{{ monthLabels[idx] }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Booking Table Box -->
      <div class="border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div class="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="font-extrabold text-white text-base sm:text-lg tracking-tight">Booking Details</h3>
            <p class="text-xs font-light text-slate-400 mt-0.5">Live reservations fetched across all hotels in your Firebase database.</p>
          </div>
          <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-slate-950 text-slate-300 px-3 py-1.5 border border-white/10 self-start sm:self-auto">
            Showing Records: {{ filteredBookings.length }} / {{ firebaseBookings.length }}
          </span>
        </div>

        <!-- Responsive Table Wrapper -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr class="bg-slate-950/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-4 px-6">Booking Date</th>
                <th class="py-4 px-6">Customer</th>
                <th class="py-4 px-6">Persons</th>
                <th class="py-4 px-6">Phone</th>
                <th class="py-4 px-6">Check-in</th>
                <th class="py-4 px-6">Check-out</th>
                <th class="py-4 px-6 text-center">Payment</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr 
                v-for="item in filteredBookings" 
                :key="item.id" 
                class="text-slate-300 hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-4 px-6 font-bold text-slate-200 whitespace-nowrap">{{ item.bookingDate }}</td>
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3 min-w-[160px]">
                    <div class="w-9 h-9 border border-white/10 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center text-amber-400 font-bold">
                      <img 
                        v-if="item.customerAvatar" 
                        :src="item.customerAvatar" 
                        alt="Customer Avatar" 
                        class="w-full h-full object-cover" 
                      />
                      <span v-else class="text-xs uppercase">
                        {{ item.customerName.charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <p class="font-bold text-white text-xs">{{ item.customerName }}</p>
                      <p v-if="item.customerEmail" class="text-slate-500 text-[11px] truncate max-w-[140px]">{{ item.customerEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-300 whitespace-nowrap">{{ item.persons }}</td>
                <td class="py-4 px-6 text-amber-400 font-mono font-medium whitespace-nowrap">{{ item.phone }}</td>
                <td class="py-4 px-6 whitespace-pre-line text-slate-400 min-w-[120px]">{{ item.checkIn }}</td>
                <td class="py-4 px-6 whitespace-pre-line text-slate-400 min-w-[120px]">{{ item.checkOut }}</td>
                <td class="py-4 px-6 text-center whitespace-nowrap">
                  <span 
                    :class="[
                      ['received', 'paid', 'confirmed'].includes(normalizeStatus(item.paymentStatus))
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    ]"
                    class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider inline-block text-center"
                  >
                    {{ item.paymentStatus }}
                  </span>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="loadingBookings">
                <td colspan="7" class="py-16 text-center text-slate-400 text-xs font-medium">
                  <div class="inline-flex items-center gap-2">
                    <Loader2 class="h-4 w-4 animate-spin text-amber-400" />
                    <span>Loading Firebase booking records...</span>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="!loadingBookings && filteredBookings.length === 0">
                <td colspan="7" class="py-16 text-center text-slate-500 text-xs font-medium">
                  No matching booking records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>