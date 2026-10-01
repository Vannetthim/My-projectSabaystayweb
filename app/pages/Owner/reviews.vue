<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <NuxtLink 
          to="/owner/owner_dashboard" 
          class="text-xs font-semibold text-gray-500 hover:text-indigo-950 flex items-center gap-1.5 transition mb-2"
        >
          <ArrowLeft class="w-4 h-4" />
          Back to Overview
        </NuxtLink>
        <h1 class="text-3xl font-serif font-bold text-gray-900">Reviews & Ratings</h1>
        <p class="text-sm text-gray-500 mt-1">Monitor guest feedback and manage property reputation.</p>
      </div>

      <!-- Property Selector -->
      <div>
        <select 
          v-model="selectedProperty" 
          class="bg-white border border-gray-200 text-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-950 shadow-xs cursor-pointer"
        >
          <option value="All">All Properties</option>
          <option v-for="prop in ownerProperties" :key="prop.id" :value="prop.name">
            {{ prop.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-500 shadow-xs mb-8">
      <Loader2 class="w-6 h-6 animate-spin mx-auto text-indigo-950 mb-2" />
      Loading guest reviews...
    </div>

    <template v-else>
      <!-- Rating Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Rating</span>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-bold text-gray-900">{{ averageRating }}</span>
            <span class="text-xs text-emerald-600 font-medium">★ Overall</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reviews</span>
          <div class="text-3xl font-bold text-gray-900 mt-2">{{ filteredReviews.length }}</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Response Rate</span>
          <div class="text-3xl font-bold text-gray-900 mt-2">{{ responseRate }}%</div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Replies</span>
          <div class="text-3xl font-bold text-indigo-950 mt-2">{{ pendingRepliesCount }}</div>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="space-y-4">
        <div 
          v-for="rev in filteredReviews" 
          :key="rev.id" 
          class="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="flex items-center gap-3">
                <h3 class="font-bold text-gray-900 text-base">{{ rev.guestName || rev.guest || 'Anonymous Guest' }}</h3>
                <span class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">
                  {{ rev.roomName || rev.property || 'Standard Room' }}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ rev.hotelName || rev.property || 'Property' }} • {{ formatDate(rev.createdAt || rev.date) }}
              </div>
            </div>
            <div class="flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold px-3 py-1 rounded-full text-xs">
              ★ {{ Number(rev.rating || 5).toFixed(1) }}
            </div>
          </div>

          <p class="text-sm text-gray-700 leading-relaxed mb-4">{{ rev.comment || rev.reviewText || 'No comment provided.' }}</p>

          <!-- Owner Response Section -->
          <div v-if="rev.reply" class="bg-gray-50 border-l-4 border-indigo-950 p-4 rounded-r-xl text-xs space-y-1">
            <div class="font-semibold text-indigo-950">Property Owner Response:</div>
            <p class="text-gray-600">{{ rev.reply }}</p>
          </div>

          <div v-else class="pt-2">
            <div v-if="activeReplyId === rev.id" class="space-y-3">
              <textarea 
                v-model="replyText" 
                placeholder="Write a polite response to the guest..." 
                rows="3"
                class="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 outline-none focus:border-indigo-950"
              ></textarea>
              <div class="flex justify-end gap-2">
                <button 
                  @click="cancelReply" 
                  class="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  @click="submitReply(rev)" 
                  :disabled="submittingReply"
                  class="px-4 py-1.5 text-xs bg-indigo-950 hover:bg-indigo-900 text-white font-medium rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Loader2 v-if="submittingReply" class="w-3.5 h-3.5 animate-spin" />
                  Post Reply
                </button>
              </div>
            </div>
            <button 
              v-else 
              @click="openReplyBox(rev.id)" 
              class="text-xs font-semibold text-indigo-950 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare class="w-3.5 h-3.5 text-indigo-950" />
              Reply to guest
            </button>
          </div>
        </div>

        <div v-if="filteredReviews.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          No reviews available for the selected property.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-vue-next'
import { useAuth } from '~/composables/auth/useAuth'
import { useFirestoreDB } from '~/composables/useFirestoreDB'

definePageMeta({
  layout: 'owner',
  middleware: ['owner']
})

const { user } = useAuth()
const { getHotels, getReviews, updateReview } = useFirestoreDB()

const loading = ref(true)
const submittingReply = ref(false)
const selectedProperty = ref('All')
const activeReplyId = ref(null)
const replyText = ref('')

const ownerProperties = ref([])
const allReviews = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const currentUid = user.value?.id || user.value?.uid
    const isAdmin = user.value?.role === 'admin'

    // 1. Fetch properties owned by user
    const hotels = await getHotels()
    if (hotels) {
      ownerProperties.value = isAdmin ? hotels : hotels.filter(h => !h.ownerId || h.ownerId === currentUid || h.ownerId === user.value?.email)
    }

    // 2. Fetch reviews belonging to owner properties
    const reviews = await getReviews()
    if (reviews && reviews.length > 0) {
      const propIds = ownerProperties.value.map(p => p.id)
      const propNames = ownerProperties.value.map(p => (p.name || '').toLowerCase())

      allReviews.value = isAdmin ? reviews : reviews.filter(r => {
        if (ownerProperties.value.length === 0) return true
        const isDirectOwner = r.ownerId === currentUid || r.ownerId === user.value?.email
        const matchesId = propIds.includes(r.hotelId) || propIds.includes(r.propertyId)
        const matchesName = propNames.includes((r.hotelName || r.property || '').toLowerCase())
        return isDirectOwner || matchesId || matchesName
      })
    }

    // Fallback sample reviews if none are in Firestore yet
    if (allReviews.value.length === 0) {
      allReviews.value = [
        {
          id: 'rev-1',
          guestName: 'Chanthy',
          hotelName: ownerProperties.value[0]?.name || 'Sabaysabay',
          roomName: 'Deluxe Room #1',
          rating: 5,
          comment: 'Wonderful stay! Clean, peaceful, and excellent hospitality.',
          createdAt: new Date().toISOString(),
          reply: ''
        },
        {
          id: 'rev-2',
          guestName: 'Sokha Dara',
          hotelName: ownerProperties.value[1]?.name || ownerProperties.value[0]?.name || 'Khos Rong Home stay',
          roomName: 'Couple Room',
          rating: 4.5,
          comment: 'Great location and very comfortable bed. Will definitely come back.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          reply: 'Thank you so much Sokha! We look forward to hosting you again.'
        }
      ]
    }
  } catch (err) {
    console.error('Error loading reviews:', err)
  } finally {
    loading.value = false
  }
}

const filteredReviews = computed(() => {
  if (selectedProperty.value === 'All') return allReviews.value
  return allReviews.value.filter(r => (r.hotelName || r.property || '').toLowerCase() === selectedProperty.value.toLowerCase())
})

const averageRating = computed(() => {
  if (filteredReviews.value.length === 0) return '5.0'
  const total = filteredReviews.value.reduce((sum, r) => sum + Number(r.rating || 5), 0)
  return (total / filteredReviews.value.length).toFixed(1)
})

const responseRate = computed(() => {
  if (filteredReviews.value.length === 0) return 100
  const replied = filteredReviews.value.filter(r => !!r.reply).length
  return Math.round((replied / filteredReviews.value.length) * 100)
})

const pendingRepliesCount = computed(() => {
  return filteredReviews.value.filter(r => !r.reply).length
})

const openReplyBox = (id) => {
  activeReplyId.value = id
  replyText.value = ''
}

const cancelReply = () => {
  activeReplyId.value = null
  replyText.value = ''
}

const submitReply = async (rev) => {
  if (!replyText.value.trim()) return

  submittingReply.value = true
  try {
    const responseMessage = replyText.value.trim()

    if (rev.id && !rev.id.startsWith('rev-') && typeof updateReview === 'function') {
      await updateReview(rev.id, { reply: responseMessage })
    }

    rev.reply = responseMessage
    cancelReply()
  } catch (err) {
    console.error('Failed to submit reply:', err)
  } finally {
    submittingReply.value = false
  }
}

const formatDate = (dateVal) => {
  if (!dateVal) return 'Recently'
  const d = new Date(dateVal)
  if (isNaN(d.getTime())) return String(dateVal)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  loadData()
})
</script>