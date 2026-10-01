<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  serverTimestamp,
  type Firestore 
} from 'firebase/firestore'
import { definePageMeta, useNuxtApp } from '#imports'
// Import Lucide Icons
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  DollarSign, 
  Star, 
  Pencil, 
  Trash2, 
  X,
  UploadCloud,
  ImageIcon,
  Loader2,
  Sparkles
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

export interface Hotel {
  id?: string
  hotelId: string
  name: string
  location: string
  region: string
  rooms: number
  price: number
  rating: number
  status: 'Published' | 'Draft'
  imageUrl?: string
  heroImage?: string
  image?: string
  amenities?: string[]
}

const hotels = ref<Hotel[]>([])
const loading = ref<boolean>(true)
const isModalOpen = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const currentEditId = ref<string | null>(null)

// Search & Filter State
const searchQuery = ref<string>('')
const selectedStatus = ref<string>('All Statuses')
const selectedRegion = ref<string>('All Regions')

// Form State
const formData = ref<Omit<Hotel, 'id'>>({
  hotelId: '',
  name: '',
  location: '',
  region: 'Kampot',
  rooms: 10,
  price: 100,
  rating: 4.5,
  status: 'Published',
  imageUrl: '',
  amenities: ['Spa & Wellness']
})

let unsubscribe: (() => void) | null = null

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

const initFirestoreListener = () => {
  loading.value = true
  const db = getDb()
  if (!db) {
    loading.value = false
    return
  }

  try {
    const q = query(collection(db, 'hotels'))
    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetched: Hotel[] = []
        snapshot.forEach((docSnap) => {
          const data = docSnap.data()
          fetched.push({
            id: docSnap.id,
            ...data,
            // Dynamic fallback chain to catch any property name used in Firestore
            imageUrl: data.imageUrl || data.heroImage || data.image || ''
          } as Hotel)
        })
        hotels.value = fetched
        loading.value = false
      },
      (error) => {
        console.error('Firestore error:', error)
        loading.value = false
      }
    )
  } catch (error) {
    console.error('Error binding listener:', error)
    loading.value = false
  }
}

onMounted(() => {
  initFirestoreListener()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filteredHotels = computed(() => {
  const queryText = searchQuery.value.trim().toLowerCase()
  return hotels.value.filter((hotel) => {
    const matchesSearch = !queryText || 
      hotel.name.toLowerCase().includes(queryText) || 
      hotel.location.toLowerCase().includes(queryText)
    const matchesStatus = selectedStatus.value === 'All Statuses' || hotel.status === selectedStatus.value
    const matchesRegion = selectedRegion.value === 'All Regions' || hotel.region === selectedRegion.value
    return matchesSearch && matchesStatus && matchesRegion
  })
})

// File Upload Handler (Converts File to Base64 Data URL)
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Limit file size to 1MB to prevent exceeding Firestore document limits
  if (file.size > 1024 * 1024) {
    alert('Please upload an image smaller than 1MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      formData.value.imageUrl = e.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

const openAddModal = () => {
  isEditing.value = false
  currentEditId.value = null
  formData.value = {
    hotelId: `#HTL-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    location: '',
    region: 'Kampot',
    rooms: 10,
    price: 120,
    rating: 4.5,
    status: 'Published',
    imageUrl: '',
    amenities: ['Infinity Pool']
  }
  isModalOpen.value = true
}

const openEditModal = (hotel: Hotel) => {
  isEditing.value = true
  currentEditId.value = hotel.id || null
  formData.value = {
    hotelId: hotel.hotelId || hotel.id || '',
    name: hotel.name,
    location: hotel.location,
    region: hotel.region,
    rooms: hotel.rooms,
    price: hotel.price || 0,
    rating: hotel.rating,
    status: hotel.status,
    imageUrl: hotel.imageUrl || hotel.heroImage || hotel.image || '',
    amenities: hotel.amenities || []
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveHotel = async () => {
  const db = getDb()
  if (!db) return

  try {
    if (isEditing.value && currentEditId.value) {
      const docRef = doc(db, 'hotels', currentEditId.value)
      await updateDoc(docRef, {
        ...formData.value,
        updatedAt: serverTimestamp()
      })
    } else {
      await addDoc(collection(db, 'hotels'), {
        ...formData.value,
        createdAt: serverTimestamp()
      })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving hotel:', error)
  }
}

const deleteHotel = async (id?: string) => {
  if (!id || !confirm('Are you sure you want to delete this property?')) return
  const db = getDb()
  if (!db) return

  try {
    await deleteDoc(doc(db, 'hotels', id))
  } catch (error) {
    console.error('Error deleting hotel:', error)
  }
}
</script>

<template>
  <div class="relative min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950 px-4 py-6 sm:px-8 sm:py-10">
    
    <!-- Ambient Gold Glow Backdrops -->
    <div class="pointer-events-none fixed inset-0 flex justify-center overflow-hidden">
      <div class="h-[600px] w-[600px] rounded-full bg-amber-500/5 blur-[120px]" />
    </div>

    <div class="relative z-10 max-w-7xl mx-auto space-y-6">
      
      <!-- Top Header -->
      <div class="border border-white/10 bg-slate-900/60 p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <Sparkles class="w-3 h-3" /> Property Directory
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Hotel Management
          </h1>
          <p class="text-xs font-light text-slate-400 mt-1">
            Manage and publish luxury hotel properties in real-time.
          </p>
        </div>

        <button 
          @click="openAddModal"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-none text-xs shadow-lg transition-all duration-300 shrink-0 cursor-pointer uppercase tracking-wider"
        >
          <PlusCircle class="w-4 h-4" />
          Add New Hotel
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 border border-white/10 shadow-xl backdrop-blur-xl">
        <div class="relative md:col-span-2">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search hotels by name or location..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <select 
          v-model="selectedStatus" 
          class="px-3 py-2.5 bg-slate-950/80 border border-white/10 text-xs text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="All Statuses" class="bg-slate-900 text-white">All Statuses</option>
          <option value="Published" class="bg-slate-900 text-white">Published</option>
          <option value="Draft" class="bg-slate-900 text-white">Draft</option>
        </select>
        <select 
          v-model="selectedRegion" 
          class="px-3 py-2.5 bg-slate-950/80 border border-white/10 text-xs text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="All Regions" class="bg-slate-900 text-white">All Regions</option>
          <option value="Kampot" class="bg-slate-900 text-white">Kampot</option>
          <option value="Siem Reap" class="bg-slate-900 text-white">Siem Reap</option>
          <option value="Koh Kong" class="bg-slate-900 text-white">Koh Kong</option>
        </select>
      </div>

      <!-- Hotels Table Container -->
      <div class="border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr class="bg-slate-950/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-4 px-6">Hotel</th>
                <th class="py-4 px-6">Location</th>
                <th class="py-4 px-6">Price / Night</th>
                <th class="py-4 px-6">Rating</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr 
                v-for="hotel in filteredHotels" 
                :key="hotel.id" 
                class="text-slate-300 hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold border border-white/10 relative">
                      <img v-if="hotel.imageUrl" :src="hotel.imageUrl" class="w-full h-full object-cover" />
                      <ImageIcon v-else class="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p class="font-bold text-white text-xs">{{ hotel.name }}</p>
                      <p class="text-[11px] text-slate-500 font-mono">ID: {{ hotel.hotelId || hotel.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-300 font-medium whitespace-nowrap">
                  <div class="flex items-center gap-1.5">
                    <MapPin class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {{ hotel.location }}
                  </div>
                </td>
                <td class="py-4 px-6 font-bold text-white whitespace-nowrap">
                  <div class="flex items-center gap-0.5">
                    <DollarSign class="w-3.5 h-3.5 text-amber-400" />
                    {{ hotel.price || 0 }}
                  </div>
                </td>
                <td class="py-4 px-6 font-bold text-amber-400 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {{ Number(hotel.rating || 0).toFixed(1) }}
                  </div>
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span
                    class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider inline-block text-center border"
                    :class="hotel.status === 'Published' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-white/10'"
                  >
                    {{ hotel.status }}
                  </span>
                </td>
                <!-- Updated Icon-Only Actions Column -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-1.5">
                    <button 
                      @click="openEditModal(hotel)" 
                      title="Edit Hotel"
                      aria-label="Edit Hotel"
                      class="p-2 text-slate-300 bg-slate-950 hover:bg-amber-500/10 hover:text-amber-400 transition-colors border border-white/10 hover:border-amber-500/30 cursor-pointer"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="deleteHotel(hotel.id)" 
                      title="Delete Hotel"
                      aria-label="Delete Hotel"
                      class="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/30 cursor-pointer"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="6" class="py-16 text-center text-slate-400 text-xs font-medium">
                  <div class="inline-flex items-center gap-2">
                    <Loader2 class="w-4 h-4 text-amber-400 animate-spin" />
                    Loading hotel properties...
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="!loading && filteredHotels.length === 0">
                <td colspan="6" class="py-16 text-center text-slate-500 text-xs font-medium">
                  No matching hotel records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="isModalOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-white/10 p-6 w-full max-w-lg shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 class="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {{ isEditing ? 'Edit Hotel Property' : 'Add New Hotel Property' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveHotel" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold mb-1 text-slate-300">Hotel Name</label>
              <input 
                v-model="formData.name" 
                type="text" 
                required 
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-amber-500" 
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Location</label>
                <input 
                  v-model="formData.location" 
                  type="text" 
                  required 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Region</label>
                <select 
                  v-model="formData.region" 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Kampot" class="bg-slate-900">Kampot</option>
                  <option value="Siem Reap" class="bg-slate-900">Siem Reap</option>
                  <option value="Koh Kong" class="bg-slate-900">Koh Kong</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Price / Night ($)</label>
                <input 
                  v-model.number="formData.price" 
                  type="number" 
                  required 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Rating</label>
                <input 
                  v-model.number="formData.rating" 
                  type="number" 
                  step="0.1" 
                  min="1" 
                  max="5" 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Status</label>
                <select 
                  v-model="formData.status" 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Published" class="bg-slate-900">Published</option>
                  <option value="Draft" class="bg-slate-900">Draft</option>
                </select>
              </div>
            </div>

            <!-- File Upload Input & Image Preview -->
            <div>
              <label class="block font-semibold mb-1 flex items-center gap-1.5 text-slate-300">
                <UploadCloud class="w-4 h-4 text-amber-400" />
                Upload Hotel Image
              </label>
              <input 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                class="w-full px-3 py-2 bg-slate-950 border border-white/10 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer" 
              />

              <!-- Image Preview Area -->
              <div v-if="formData.imageUrl" class="mt-2 flex items-center gap-3 bg-slate-950 p-2 border border-white/10">
                <div class="w-16 h-16 border border-white/10 shrink-0 overflow-hidden">
                  <img :src="formData.imageUrl" class="w-full h-full object-cover" />
                </div>
                <button 
                  type="button" 
                  @click="formData.imageUrl = ''" 
                  class="flex items-center gap-1 text-xs text-rose-400 font-semibold hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                  Remove Image
                </button>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                type="button" 
                @click="closeModal" 
                class="flex items-center gap-1.5 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium transition-colors cursor-pointer border border-white/10"
              >
                <X class="w-4 h-4" />
                Cancel
              </button>
              <button 
                type="submit" 
                class="flex items-center gap-1.5 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer uppercase tracking-wider"
              >
                <PlusCircle class="w-4 h-4" />
                Save Property
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>