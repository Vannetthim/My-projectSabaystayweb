<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  collection, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  type Firestore 
} from 'firebase/firestore'
import { useNuxtApp } from '#imports'

interface Hotel {
  id: string
  name?: string
  location?: string
  price?: number | string
  rating?: number | string
  image?: string
  imageUrl?: string
  heroImage?: string
}

const hotels = ref<Hotel[]>([])
const loading = ref<boolean>(true)
let unsubscribe: (() => void) | null = null

// Access Firestore instance from Nuxt
const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

// Real-time listener for hotel records
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
            image: data.image || data.imageUrl || data.heroImage || ''
          } as Hotel)
        })
        hotels.value = fetched
        loading.value = false
      },
      (error) => {
        console.error('Firestore listener error:', error)
        loading.value = false
      }
    )
  } catch (error) {
    console.error('Error starting listener:', error)
    loading.value = false
  }
}

// Delete handler
const handleDelete = async (id: string, name?: string) => {
  const hotelName = name || 'this property'
  if (!confirm(`Are you sure you want to delete "${hotelName}"?`)) return

  const db = getDb()
  if (!db) return

  try {
    await deleteDoc(doc(db, 'hotels', id))
  } catch (error) {
    console.error('Error deleting hotel:', error)
  }
}

onMounted(() => {
  initFirestoreListener()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

// Image fallback handler
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
  if (target.nextElementSibling) {
    (target.nextElementSibling as HTMLElement).style.display = 'flex'
  }
}

// Currency formatter
const formatPrice = (price?: number | string) => {
  const numericPrice = Number(price) || 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(numericPrice)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
      <div>
        <h3 class="font-serif font-bold text-slate-900 text-lg">Hotel Management</h3>
        <p class="text-xs text-slate-400">Manage all hotel properties in the system</p>
      </div>
      <NuxtLink 
        to="/admin/hotels/new" 
        class="px-4 py-2 bg-indigo-900 text-white rounded-xl text-xs font-semibold hover:bg-indigo-800 transition-colors shadow-sm"
      >
        + Add Hotel
      </NuxtLink>
    </div>

    <!-- Table Content -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm text-slate-600 border-collapse">
        <thead class="bg-slate-50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
          <tr>
            <th class="px-6 py-3">Hotel</th>
            <th class="px-6 py-3">Location</th>
            <th class="px-6 py-3">Price / Night</th>
            <th class="px-6 py-3">Rating</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        
        <tbody class="divide-y divide-slate-100">
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-8 text-center text-slate-400 text-sm">
              ⏳ Loading hotel data...
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="!hotels || hotels.length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-slate-400 text-sm">
              🏨 No hotel data found.
            </td>
          </tr>

          <!-- Data List -->
          <tr 
            v-else 
            v-for="h in hotels" 
            :key="h.id" 
            class="hover:bg-slate-50/50 transition-colors"
          >
            <td class="px-6 py-4 font-semibold text-slate-900 flex items-center gap-3">
              <img 
                v-if="h.image" 
                :src="h.image" 
                :alt="h.name || 'Hotel image'"
                @error="handleImageError"
                class="w-10 h-10 rounded-lg object-cover border border-slate-100" 
              />
              <div 
                v-show="!h.image" 
                class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0"
              >
                🏨
              </div>
              <span class="truncate max-w-xs">{{ h.name || 'N/A' }}</span>
            </td>

            <td class="px-6 py-4 text-xs">{{ h.location || 'N/A' }}</td>
            <td class="px-6 py-4 font-bold text-slate-900">{{ formatPrice(h.price) }}</td>
            <td class="px-6 py-4">
              <span class="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                ★ {{ h.rating || '4.8' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-3 whitespace-nowrap">
              <NuxtLink 
                :to="`/admin/hotels/${h.id}`" 
                class="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
              >
                Edit
              </NuxtLink>

              <button 
                @click="handleDelete(h.id, h.name)" 
                class="text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>