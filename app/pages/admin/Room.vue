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
  BedDouble, 
  Pencil, 
  Trash2, 
  X,
  UploadCloud,
  ImageIcon,
  Building,
  Users,
  DollarSign,
  Loader2,
  Sparkles
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

export interface Room {
  id?: string
  roomNumber: string
  hotelName: string
  type: string
  price: number
  capacity: number
  status: 'Available' | 'Booked' | 'Maintenance'
  description: string
  image: string
}

const rooms = ref<Room[]>([])
const loading = ref<boolean>(true)
const isModalOpen = ref<boolean>(false)
const isEditing = ref<boolean>(false)
const currentEditId = ref<string | null>(null)

// Filters
const searchQuery = ref<string>('')
const statusFilter = ref<string>('All')

// Form State
const defaultForm: Omit<Room, 'id'> = {
  roomNumber: '',
  hotelName: 'SabayStay Grand Hotel',
  type: 'Deluxe Suite',
  price: 120,
  capacity: 2,
  status: 'Available',
  description: 'A spacious room with modern amenities, a king-size bed, and a city view.',
  image: ''
}

const formData = ref<Omit<Room, 'id'>>({ ...defaultForm })

let unsubscribeRooms: (() => void) | null = null

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

const cleanImageUrl = (url?: string): string => {
  if (!url) return ''
  return url.replace(/[\[\]"']/g, '').trim()
}

// File Upload Handler (Converts File to Base64)
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (file.size > 1024 * 1024) {
    alert('Please upload an image smaller than 1MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      formData.value.image = e.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

// Fetch Realtime Rooms from Firestore
const initRoomsListener = () => {
  loading.value = true
  const db = getDb()
  if (!db) {
    loading.value = false
    return
  }

  const q = query(collection(db, 'rooms'))
  unsubscribeRooms = onSnapshot(
    q,
    (snapshot) => {
      const fetched: Room[] = []
      snapshot.forEach((docSnap) => {
        const data = docSnap.data()
        fetched.push({
          id: docSnap.id,
          roomNumber: data.roomNumber || '',
          hotelName: data.hotelName || '',
          type: data.type || '',
          price: data.price || 0,
          capacity: data.capacity || 1,
          status: data.status || 'Available',
          description: data.description || '',
          image: cleanImageUrl(data.image || data.imageUrl || '')
        })
      })
      rooms.value = fetched
      loading.value = false
    },
    (error) => {
      console.error('Firestore listener error:', error)
      loading.value = false
    }
  )
}

const filteredRooms = computed(() => {
  return rooms.value.filter((room) => {
    const matchesSearch =
      room.roomNumber?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.hotelName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.type?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = statusFilter.value === 'All' || room.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

const openAddModal = () => {
  isEditing.value = false
  currentEditId.value = null
  formData.value = { ...defaultForm }
  isModalOpen.value = true
}

const openEditModal = (room: Room) => {
  if (!room.id) return
  isEditing.value = true
  currentEditId.value = room.id
  formData.value = {
    roomNumber: room.roomNumber || '',
    hotelName: room.hotelName || '',
    type: room.type || 'Deluxe Suite',
    price: room.price || 0,
    capacity: room.capacity || 2,
    status: room.status || 'Available',
    description: room.description || '',
    image: cleanImageUrl(room.image)
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveRoom = async () => {
  const db = getDb()
  if (!db) return

  try {
    if (isEditing.value && currentEditId.value) {
      await updateDoc(doc(db, 'rooms', currentEditId.value), {
        ...formData.value
      })
    } else {
      await addDoc(collection(db, 'rooms'), {
        ...formData.value,
        createdAt: serverTimestamp()
      })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving room:', error)
  }
}

const deleteRoomItem = async (id?: string) => {
  if (!id) return
  const db = getDb()
  if (!db) return

  try {
    await deleteDoc(doc(db, 'rooms', id))
  } catch (error) {
    console.error('Error deleting room:', error)
  }
}

onMounted(() => {
  initRoomsListener()
})

onUnmounted(() => {
  if (unsubscribeRooms) unsubscribeRooms()
})
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
            <Sparkles class="w-3 h-3" /> Accommodation Directory
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Room Management
          </h1>
          <p class="text-xs font-light text-slate-400 mt-1">
            Manage hotel rooms, room types, pricing, capacity, and availability in real time.
          </p>
        </div>

        <button 
          @click="openAddModal"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-none text-xs shadow-lg transition-all duration-300 shrink-0 cursor-pointer uppercase tracking-wider"
        >
          <PlusCircle class="w-4 h-4" />
          Add New Room
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900/60 p-4 border border-white/10 shadow-xl backdrop-blur-xl">
        <div class="relative md:col-span-3">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by room number, hotel, or room type..."
            class="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <select 
          v-model="statusFilter" 
          class="px-3 py-2.5 bg-slate-950/80 border border-white/10 text-xs text-slate-300 outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="All" class="bg-slate-900 text-white">All Statuses</option>
          <option value="Available" class="bg-slate-900 text-white">Available</option>
          <option value="Booked" class="bg-slate-900 text-white">Booked</option>
          <option value="Maintenance" class="bg-slate-900 text-white">Maintenance</option>
        </select>
      </div>

      <!-- Rooms Table Container -->
      <div class="border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr class="bg-slate-950/80 border-b border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th class="py-4 px-6">Room / Hotel</th>
                <th class="py-4 px-6">Type & Guests</th>
                <th class="py-4 px-6">Price / Night</th>
                <th class="py-4 px-6">Status</th>
                <th class="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr 
                v-for="room in filteredRooms" 
                :key="room.id" 
                class="text-slate-300 hover:bg-slate-800/40 transition-colors"
              >
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-slate-950 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold border border-white/10 relative">
                      <img v-if="room.image" :src="room.image" class="w-full h-full object-cover" />
                      <ImageIcon v-else class="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p class="font-bold text-white text-xs flex items-center gap-1.5">
                        <BedDouble class="w-3.5 h-3.5 text-amber-400" />
                        Room {{ room.roomNumber }}
                      </p>
                      <p class="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building class="w-3 h-3 text-slate-500" />
                        {{ room.hotelName }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-300 font-medium whitespace-nowrap">
                  <div>
                    <span class="font-semibold text-white block text-xs">{{ room.type }}</span>
                    <div class="flex items-center gap-1 text-slate-400 text-[11px] mt-0.5">
                      <Users class="w-3 h-3 text-amber-400" />
                      Max {{ room.capacity }} {{ room.capacity > 1 ? 'Guests' : 'Guest' }}
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 font-bold text-white whitespace-nowrap">
                  <div class="flex items-center gap-0.5">
                    <DollarSign class="w-3.5 h-3.5 text-amber-400" />
                    {{ room.price }}
                    <span class="text-[10px] text-slate-500 font-normal ml-0.5">/ night</span>
                  </div>
                </td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span
                    class="px-3 py-1 text-[10px] font-bold uppercase tracking-wider inline-block text-center border"
                    :class="{
                      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30': room.status === 'Available',
                      'bg-amber-500/10 text-amber-400 border-amber-500/30': room.status === 'Booked',
                      'bg-rose-500/10 text-rose-400 border-rose-500/30': room.status === 'Maintenance'
                    }"
                  >
                    {{ room.status }}
                  </span>
                </td>

                <!-- Icon-Only Actions Column -->
                <td class="py-4 px-6 text-right whitespace-nowrap">
                  <div class="inline-flex items-center justify-end gap-1.5">
                    <button 
                      @click="openEditModal(room)" 
                      title="Edit Room"
                      aria-label="Edit Room"
                      class="p-2 text-slate-300 bg-slate-950 hover:bg-amber-500/10 hover:text-amber-400 transition-colors border border-white/10 hover:border-amber-500/30 cursor-pointer"
                    >
                      <Pencil class="w-3.5 h-3.5" />
                    </button>
                    <button 
                      @click="deleteRoomItem(room.id)" 
                      title="Delete Room"
                      aria-label="Delete Room"
                      class="p-2 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors border border-rose-500/30 cursor-pointer"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="5" class="py-16 text-center text-slate-400 text-xs font-medium">
                  <div class="inline-flex items-center gap-2">
                    <Loader2 class="w-4 h-4 text-amber-400 animate-spin" />
                    Loading room records...
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="!loading && filteredRooms.length === 0">
                <td colspan="5" class="py-16 text-center text-slate-500 text-xs font-medium">
                  No matching room records found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Form -->
      <div v-if="isModalOpen" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-white/10 p-6 w-full max-w-2xl shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 class="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {{ isEditing ? 'Edit Room' : 'Add New Room' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveRoom" class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Room Number / Identifier</label>
                <input 
                  v-model="formData.roomNumber" 
                  type="text" 
                  placeholder="e.g. 101, A-202" 
                  required 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Hotel Name</label>
                <input 
                  v-model="formData.hotelName" 
                  type="text" 
                  placeholder="e.g. SabayStay Phnom Penh" 
                  required 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-amber-500" 
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Room Type</label>
                <select 
                  v-model="formData.type" 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="Single Room" class="bg-slate-900">Single Room</option>
                  <option value="Double Room" class="bg-slate-900">Double Room</option>
                  <option value="Deluxe Suite" class="bg-slate-900">Deluxe Suite</option>
                  <option value="Executive Suite" class="bg-slate-900">Executive Suite</option>
                  <option value="Family Room" class="bg-slate-900">Family Room</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Price Per Night ($)</label>
                <input 
                  v-model.number="formData.price" 
                  type="number" 
                  min="0" 
                  step="1" 
                  required 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500" 
                />
              </div>
              <div>
                <label class="block font-semibold mb-1 text-slate-300">Max Guests</label>
                <input 
                  v-model.number="formData.capacity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  required 
                  class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500" 
                />
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1 text-slate-300">Availability Status</label>
              <select 
                v-model="formData.status" 
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Available" class="bg-slate-900">Available</option>
                <option value="Booked" class="bg-slate-900">Booked</option>
                <option value="Maintenance" class="bg-slate-900">Maintenance</option>
              </select>
            </div>

            <!-- File Upload Input & Image Preview -->
            <div>
              <label class="block font-semibold mb-1 flex items-center gap-1.5 text-slate-300">
                <UploadCloud class="w-4 h-4 text-amber-400" />
                Upload Room Image
              </label>
              <input 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                class="w-full px-3 py-2 bg-slate-950 border border-white/10 text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-amber-500/10 file:text-amber-400 hover:file:bg-amber-500/20 cursor-pointer" 
              />

              <!-- Image Preview Area -->
              <div v-if="formData.image" class="mt-2 flex items-center gap-3 bg-slate-950 p-2 border border-white/10">
                <div class="w-16 h-16 border border-white/10 shrink-0 overflow-hidden">
                  <img :src="formData.image" class="w-full h-full object-cover" />
                </div>
                <button 
                  type="button" 
                  @click="formData.image = ''" 
                  class="flex items-center gap-1 text-xs text-rose-400 font-semibold hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                  Remove Image
                </button>
              </div>
            </div>

            <div>
              <label class="block font-semibold mb-1 text-slate-300">Room Description & Amenities</label>
              <textarea 
                v-model="formData.description" 
                rows="3" 
                class="w-full px-3 py-2.5 bg-slate-950 border border-white/10 text-white placeholder-slate-600 outline-none focus:border-amber-500"
              ></textarea>
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
                <BedDouble class="w-4 h-4" />
                {{ isEditing ? 'Update Room' : 'Save Room' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>