<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, type Firestore } from 'firebase/firestore'
import { useRoute, definePageMeta, useNuxtApp } from '#imports'
import { 
  Search, 
  Building2, 
  BedDouble, 
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-vue-next'

definePageMeta({
  layout: 'owner',
  middleware: 'owner'
})

const route = useRoute()

interface HotelOption {
  id: string
  name: string
}

interface RoomItem {
  id: string
  title: string
  roomNumber?: string
  floor?: string
  hotelId: string
  hotelName?: string
  type: string
  price: number
  status: string
  image?: string
}

const hotels = ref<HotelOption[]>([])
const rooms = ref<RoomItem[]>([])
const selectedHotelId = ref<string>((route.query.hotelId as string) || 'all')
const searchQuery = ref<string>('')
const loading = ref<boolean>(true)

let stopHotelsListener = () => {}
let stopRoomsListener = () => {}

const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

// 1. Fetch properties for dropdown selection
const listenToHotels = () => {
  const db = getDb()
  if (!db) return

  stopHotelsListener()
  stopHotelsListener = onSnapshot(collection(db, 'hotels'), (snapshot) => {
    hotels.value = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || doc.data().title || 'Untitled Property'
    }))
  })
}

// 2. Fetch all admin-created rooms from Firestore
const listenToRooms = () => {
  loading.value = true
  const db = getDb()
  if (!db) {
    loading.value = false
    return
  }

  stopRoomsListener()
  stopRoomsListener = onSnapshot(collection(db, 'rooms'), (snapshot) => {
    const fetched: RoomItem[] = []
    
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data()
      
      // Match property name from hotels collection
      const matchedHotel = hotels.value.find(h => h.id === data.hotelId)

      fetched.push({
        id: docSnap.id,
        title: data.title || data.name || 'Untitled Room',
        roomNumber: data.roomNumber || data.number || '1',
        floor: data.floor || '1',
        hotelId: data.hotelId || '',
        hotelName: matchedHotel?.name || data.hotelName || 'Property',
        type: data.type || 'Deluxe',
        price: Number(data.price || data.pricePerNight || 0),
        status: data.status || 'Available',
        image: data.image || data.imageUrl || fallbackImage
      })
    })

    rooms.value = fetched
    loading.value = false
  }, (err) => {
    console.error('Error fetching rooms:', err)
    loading.value = false
  })
}

// 3. Filter rooms by selected property dropdown & search input
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    const matchesHotel = selectedHotelId.value === 'all' || room.hotelId === selectedHotelId.value
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !q || 
      room.title.toLowerCase().includes(q) || 
      (room.roomNumber && room.roomNumber.toLowerCase().includes(q)) ||
      (room.hotelName && room.hotelName.toLowerCase().includes(q))

    return matchesHotel && matchesSearch
  })
})

onMounted(() => {
  listenToHotels()
  listenToRooms()
})

onUnmounted(() => {
  stopHotelsListener()
  stopRoomsListener()
})
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-6 font-sans bg-[#090d16] text-slate-200 min-h-screen">
    <!-- Back Button & Header -->
    <div>
      <NuxtLink 
        to="/owner/my_hotels" 
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition mb-3"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        Back to My Properties
      </NuxtLink>

      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Room Management</h1>
        <p class="text-xs text-slate-400 mt-1">Manage rooms, pricing, and availability for your properties.</p>
      </div>
    </div>

    <!-- Filter & Dropdown Toolbar -->
    <div class="bg-[#101524] p-4 rounded-lg border border-slate-800/80 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search rooms..." 
          class="w-full bg-[#141b2d] border border-slate-800 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 transition"
        />
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        <div class="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Building2 class="w-4 h-4 text-amber-500" />
          Selected Property:
        </div>

        <select 
          v-model="selectedHotelId" 
          class="bg-[#141b2d] border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-3 py-2 outline-none focus:border-amber-500/50 transition cursor-pointer"
        >
          <option value="all" class="bg-[#101524] text-slate-200">All My Properties</option>
          <option v-for="hotel in hotels" :key="hotel.id" :value="hotel.id" class="bg-[#101524] text-slate-200">
            {{ hotel.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="bg-[#101524] rounded-lg p-6 border border-slate-800/80 shadow-md animate-pulse space-y-4">
      <div v-for="n in 4" :key="n" class="h-16 bg-slate-800/60 rounded-lg"></div>
    </div>

    <!-- Rooms Table -->
    <div v-else-if="filteredRooms.length > 0" class="bg-[#101524] rounded-lg border border-slate-800/80 shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-[#141b2d] text-slate-400 uppercase tracking-wider border-b border-slate-800/80 font-bold">
            <tr>
              <th class="py-4 px-6">Room</th>
              <th class="py-4 px-6">Hotel Property</th>
              <th class="py-4 px-6">Type</th>
              <th class="py-4 px-6">Price / Night</th>
              <th class="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr v-for="room in filteredRooms" :key="room.id" class="hover:bg-[#141b2d]/60 transition">
              <!-- Room Info with Rounded Thumbnail -->
              <td class="py-4 px-6 flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-md overflow-hidden border border-slate-800/80 shrink-0 bg-[#141b2d]">
                  <img :src="room.image" class="w-full h-full object-cover rounded-md" />
                </div>
                <div>
                  <p class="font-bold text-white text-sm">{{ room.title }}</p>
                  <p class="text-[11px] text-slate-400 mt-0.5">Room #{{ room.roomNumber }} • Floor {{ room.floor }}</p>
                </div>
              </td>

              <!-- Hotel Property Badge -->
              <td class="py-4 px-6 font-semibold">
                <span class="inline-flex items-center gap-1.5 bg-[#151a30] text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-md text-xs font-medium">
                  <Building2 class="w-3.5 h-3.5 text-amber-500" />
                  {{ room.hotelName }}
                </span>
              </td>

              <!-- Room Type -->
              <td class="py-4 px-6 font-medium text-slate-300">{{ room.type }}</td>

              <!-- Price -->
              <td class="py-4 px-6 font-bold text-amber-400 text-sm">${{ room.price }}</td>

              <!-- Status -->
              <td class="py-4 px-6">
                <span 
                  :class="room.status === 'Available' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' : 'bg-rose-950/60 text-rose-400 border-rose-800/50'" 
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold border uppercase"
                >
                  <CheckCircle v-if="room.status === 'Available'" class="w-3 h-3 text-emerald-400" />
                  <XCircle v-else class="w-3 h-3 text-rose-400" />
                  {{ room.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-[#101524] rounded-lg border border-slate-800/80 shadow-md py-16 text-center flex flex-col items-center justify-center">
      <BedDouble class="w-12 h-12 text-slate-600 mb-3" />
      <p class="text-slate-300 text-sm font-medium mb-1">No rooms found for this selection.</p>
      <p class="text-xs text-slate-500">Ask the Admin to create rooms under your selected hotel property.</p>
    </div>
  </div>
</template>