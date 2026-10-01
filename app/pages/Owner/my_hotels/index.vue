<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, type Firestore } from 'firebase/firestore'
import { definePageMeta, useNuxtApp } from '#imports'
import { Building2, Search, MapPin, ArrowRight, BedDouble, Hotel } from 'lucide-vue-next'

definePageMeta({
  layout: 'owner',
  middleware: 'owner'
})

interface HotelItem {
  id: string
  name: string
  location?: string
  price?: number
  rating?: number
  status?: string
  image?: string
  description?: string
}

const hotels = ref<HotelItem[]>([])
const loading = ref<boolean>(true)
const searchQuery = ref<string>('')

let stopHotelsListener = () => {}

const fallbackImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

const listenToAllAdminHotels = () => {
  loading.value = true
  const db = getDb()
  if (!db) {
    loading.value = false
    return
  }

  stopHotelsListener()

  // Real-time listener fetching ALL hotel properties created in Admin
  stopHotelsListener = onSnapshot(collection(db, 'hotels'), (snapshot) => {
    const fetched: HotelItem[] = []
    
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data()
      fetched.push({
        id: docSnap.id,
        name: data.name || data.title || 'Untitled Property',
        location: data.location || data.address || 'Cambodia',
        price: Number(data.price || data.pricePerNight || 0),
        rating: Number(data.rating || 4.5),
        status: data.status || 'Published',
        image: data.image || data.imageUrl || fallbackImage,
        description: data.description || ''
      })
    })

    hotels.value = fetched
    loading.value = false
  }, (error) => {
    console.error('Error fetching admin hotels:', error)
    loading.value = false
  })
}

const filteredHotels = computed(() => {
  if (!searchQuery.value.trim()) return hotels.value
  const q = searchQuery.value.toLowerCase().trim()
  return hotels.value.filter(h => 
    h.name.toLowerCase().includes(q) || 
    (h.location && h.location.toLowerCase().includes(q))
  )
})

onMounted(() => {
  listenToAllAdminHotels()
})

onUnmounted(() => {
  stopHotelsListener()
})
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-6 font-sans">
    <!-- Top Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-serif font-bold text-gray-900">Properties Overview</h1>
        <p class="text-xs text-gray-500 mt-1">View all hotel properties managed by Admin and manage their room inventory.</p>
      </div>

      <NuxtLink 
        to="/owner/room" 
        class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-indigo-950 text-white rounded-xl hover:bg-indigo-900 transition shadow-xs self-start sm:self-auto cursor-pointer"
      >
        <BedDouble class="w-4 h-4" />
        Manage Rooms
      </NuxtLink>
    </div>

    <!-- Search Bar & Property Count -->
    <div class="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search properties by name or location..." 
          class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-sm outline-none focus:border-indigo-950 transition"
        />
      </div>
      <div class="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <Building2 class="w-4 h-4 text-indigo-950" />
        Total Available Properties: {{ filteredHotels.length }}
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-3">
        <div class="h-44 bg-gray-200 rounded-xl"></div>
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Hotels List Grid -->
    <div v-else-if="filteredHotels.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="hotel in filteredHotels" 
        :key="hotel.id" 
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
      >
        <div>
          <div class="h-44 bg-gray-100 relative overflow-hidden">
            <img 
              :src="hotel.image" 
              :alt="hotel.name" 
              class="w-full h-full object-cover" 
            />
            <span class="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-indigo-950 shadow-xs">
              ${{ hotel.price }} / night
            </span>
          </div>

          <div class="p-5 space-y-2">
            <span class="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
              <MapPin class="w-3 h-3 text-indigo-700" />
              {{ hotel.location }}
            </span>
            <h2 class="text-lg font-bold text-gray-900">{{ hotel.name }}</h2>
            <p v-if="hotel.description" class="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {{ hotel.description }}
            </p>
          </div>
        </div>

        <div class="p-5 pt-3 border-t border-gray-50 flex items-center justify-between mt-auto">
          <span 
            :class="hotel.status === 'Published' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'" 
            class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
          >
            {{ hotel.status }}
          </span>

          <NuxtLink 
            :to="`/owner/room?hotelId=${hotel.id}`" 
            class="text-xs font-bold text-indigo-950 hover:underline flex items-center gap-1"
          >
            Manage Rooms
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center">
      <Hotel class="w-12 h-12 text-gray-300 mb-3" />
      <p class="text-gray-500 text-sm mb-1 font-medium">No properties found in Firestore.</p>
      <p class="text-xs text-gray-400">Ask the Admin to create hotel properties in the Admin Dashboard.</p>
    </div>
  </div>
</template>