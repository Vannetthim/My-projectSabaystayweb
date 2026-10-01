<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <!-- Breadcrumb & Navigation Actions -->
    <div class="flex items-center justify-between">
      <NuxtLink 
        to="/owner/my_hotels" 
        class="text-xs font-semibold text-gray-500 hover:text-indigo-950 flex items-center gap-1.5 transition"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to My Properties
      </NuxtLink>

      <div v-if="hotel" class="flex items-center gap-3">
        <button 
          @click="openEditModal" 
          class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition shadow-xs cursor-pointer"
        >
          <Pencil class="w-3.5 h-3.5" />
          Edit Property
        </button>
        <button 
          @click="handleDelete" 
          class="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition shadow-xs cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden p-6 animate-pulse space-y-4">
      <div class="h-60 bg-gray-200 rounded-2xl w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      <div class="h-8 bg-gray-200 rounded w-1/2"></div>
      <div class="h-16 bg-gray-200 rounded w-3/4"></div>
    </div>

    <!-- Hotel Details Header Card -->
    <div v-else-if="hotel" class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Property Banner Image -->
      <div class="h-64 sm:h-80 bg-gray-100 relative overflow-hidden">
        <img 
          :src="getHotelImageUrl(hotel.image)" 
          :alt="hotel.name"
          loading="lazy"
          class="w-full h-full object-cover" 
        />
        <span class="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-gray-800 border border-gray-100 shadow-xs">
          <Star class="w-4 h-4 text-amber-500 fill-amber-400" />
          {{ hotel.rating || '5.0' }}
        </span>
      </div>

      <div class="p-6 sm:p-8 space-y-4">
        <div>
          <span class="flex items-center gap-1.5 text-xs font-bold text-indigo-950 uppercase tracking-wider mb-1">
            <MapPin class="w-3.5 h-3.5 text-indigo-800" />
            City: {{ hotel.city || hotel.location || 'Location Not Specified' }}
          </span>
          <h1 class="text-3xl font-serif font-bold text-gray-900">{{ hotel.name }}</h1>
        </div>

        <p class="text-sm text-gray-600 leading-relaxed max-w-3xl">
          {{ hotel.description || 'No description added yet for this property.' }}
        </p>

        <!-- Quick Action Link to Rooms -->
        <div class="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="p-2.5 bg-indigo-50 text-indigo-900 rounded-xl">
              <Building2 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">Rooms Management</h3>
              <p class="text-xs text-gray-500">Add or modify room types and availability for this property.</p>
            </div>
          </div>
          <NuxtLink 
            :to="`/owner/room?hotelId=${hotel.id}`" 
            class="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-indigo-950 text-white rounded-xl hover:bg-indigo-900 transition shadow-xs self-start sm:self-auto"
          >
            Manage Rooms
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Fallback / Not Found State -->
    <div v-else class="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center">
      <Building2 class="w-12 h-12 text-gray-300 mb-3" />
      <p class="text-gray-600 text-sm font-medium">Property details could not be found or access is restricted.</p>
      <NuxtLink to="/owner/my_hotels" class="mt-4 px-4 py-2 text-xs font-bold text-indigo-950 bg-indigo-50 rounded-xl">
        Return to My Properties
      </NuxtLink>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-xl w-full p-6 space-y-5">
        <div class="flex justify-between items-center border-b border-gray-100 pb-4">
          <h2 class="text-xl font-serif font-bold text-gray-900 flex items-center gap-2.5">
            <Pencil class="w-5 h-5 text-indigo-950" />
            Edit Property Details
          </h2>
          <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-600 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleUpdate" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Property Name</label>
            <input 
              v-model="editForm.name" 
              type="text" 
              required 
              placeholder="e.g. Sunset Boutique Hotel"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-950 focus:ring-1 focus:ring-indigo-950 transition" 
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-gray-400" />
              City / Location
            </label>
            <input 
              v-model="editForm.city" 
              type="text" 
              required 
              placeholder="e.g. Siem Reap"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-950 focus:ring-1 focus:ring-indigo-950 transition" 
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
            <textarea 
              v-model="editForm.description" 
              rows="3" 
              placeholder="Tell guests about the vibe, amenities, and what makes this property special..."
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-950 focus:ring-1 focus:ring-indigo-950 transition"
            ></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center gap-1.5">
              <UploadCloud class="w-3.5 h-3.5 text-gray-400" />
              Cover Image URL
            </label>
            <input 
              v-model="editForm.image" 
              type="url" 
              placeholder="https://example.com/your-hotel-photo.jpg"
              class="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-indigo-950 focus:ring-1 focus:ring-indigo-950 transition" 
            />
            <p class="text-[11px] text-gray-400 mt-1">Leave blank to use a default cover image.</p>
          </div>

          <div class="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button type="button" @click="showEditModal = false" class="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer">
              <X class="w-3.5 h-3.5" />
              Cancel
            </button>
            <button type="submit" :disabled="isUpdating" class="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-indigo-950 text-white rounded-xl shadow-xs disabled:opacity-60 cursor-pointer">
              <Loader2 v-if="isUpdating" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              {{ isUpdating ? 'Saving...' : 'Update Property' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowLeft, ArrowRight, Pencil, Trash2, Star, MapPin, Building2, X, UploadCloud, Save, Loader2 } from 'lucide-vue-next'
import { useAuth } from '~/composables/auth/useAuth'

definePageMeta({ 
  layout: 'owner',
  middleware: ['owner']
})

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { getHotels, updateHotel, deleteHotel } = useFirestoreDB()

const hotel = ref(null)
const loading = ref(true)
const showEditModal = ref(false)
const isUpdating = ref(false)

const fallbackImageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'
const editForm = ref({ name: '', city: '', description: '', image: '' })

const getHotelImageUrl = (imageUrl) => {
  if (imageUrl?.trim()) {
    return imageUrl
  }
  return fallbackImageUrl
}

const isOwnerAuthorized = (item) => {
  if (!item) return false
  const currentUid = user.value?.id || user.value?.uid
  const isOwnerRole = user.value?.role === 'owner'
  
  // Allow admins full access; filter owners to only their own property ID
  if (isOwnerRole) {
    return item.ownerId === currentUid
  }
  return true
}

const loadHotelData = async () => {
  const hotelId = route.params.id

  if (import.meta.client) {
    const cached = localStorage.getItem('sabay_hotels_cache')
    if (cached) {
      try {
        const list = JSON.parse(cached)
        const found = list.find(h => h.id === hotelId)
        if (found && isOwnerAuthorized(found)) {
          hotel.value = found
          loading.value = false
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  try {
    const allHotels = await getHotels()
    if (allHotels) {
      const found = allHotels.find(h => h.id === hotelId)
      if (found && isOwnerAuthorized(found)) {
        hotel.value = found
      } else {
        hotel.value = null
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openEditModal = () => {
  if (!hotel.value) return
  editForm.value = {
    name: hotel.value.name || '',
    city: hotel.value.city || hotel.value.location || '',
    description: hotel.value.description || '',
    image: hotel.value.image || ''
  }
  showEditModal.value = true
}

const handleUpdate = async () => {
  if (isUpdating.value) return
  isUpdating.value = true

  const payload = {
    name: editForm.value.name,
    city: editForm.value.city,
    description: editForm.value.description || '',
    image: editForm.value.image?.trim() ? editForm.value.image : ''
  }

  hotel.value = { ...hotel.value, ...payload }
  showEditModal.value = false

  // Update Local Storage Cache
  if (import.meta.client) {
    const cached = localStorage.getItem('sabay_hotels_cache')
    if (cached) {
      try {
        const list = JSON.parse(cached)
        const index = list.findIndex(h => h.id === route.params.id)
        if (index !== -1) {
          list[index] = { ...list[index], ...payload }
          localStorage.setItem('sabay_hotels_cache', JSON.stringify(list))
        }
      } catch (e) {
        console.error(e)
      }
    }
  }

  try {
    await updateHotel(route.params.id, payload)
  } catch (err) {
    console.error(err)
  } finally {
    isUpdating.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this property?')) return

  const hotelId = route.params.id

  if (import.meta.client) {
    const cached = localStorage.getItem('sabay_hotels_cache')
    if (cached) {
      try {
        const list = JSON.parse(cached).filter(h => h.id !== hotelId)
        localStorage.setItem('sabay_hotels_cache', JSON.stringify(list))
      } catch (e) {
        console.error(e)
      }
    }
  }

  try {
    await deleteHotel(hotelId)
    router.push('/owner/my_hotels')
  } catch (err) {
    alert('Failed to delete: ' + err.message)
  }
}

onMounted(() => {
  loadHotelData()
})
</script>