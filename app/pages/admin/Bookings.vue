<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { 
  collection, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  onSnapshot, 
  query, 
  where,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { definePageMeta, useNuxtApp } from '#imports'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Fix: Extract nuxtApp at the top level to avoid context loss after async/await operations
const nuxtApp = useNuxtApp()

const bookings = ref([])
const selectedStatus = ref('All')
const searchQuery = ref('')
const loading = ref(true)
const actionLoadingId = ref(null)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(10)

let unsubscribe = null

const normalizeStatus = (status) => {
  return String(status || '').trim().toLowerCase()
}

const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A'
  if (typeof dateVal === 'object' && dateVal !== null) {
    if (typeof dateVal.toDate === 'function') {
      return dateVal.toDate().toISOString().split('T')[0]
    }
    if (typeof dateVal.seconds === 'number') {
      return new Date(dateVal.seconds * 1000).toISOString().split('T')[0]
    }
  }
  const parsed = new Date(dateVal)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }
  return String(dateVal)
}

const parsePrice = (data) => {
  const rawPrice = 
    data?.totalPrice ?? 
    data?.total ?? 
    data?.amount ?? 
    data?.price ?? 
    data?.grandTotal ?? 
    data?.total_price ?? 
    0

  if (typeof rawPrice === 'number') {
    return isNaN(rawPrice) ? 0 : rawPrice
  }

  if (typeof rawPrice === 'string') {
    const cleaned = rawPrice.replace(/[^0-9.-]+/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  return 0
}

const formatPrice = (value) => {
  const num = Number(value) || 0
  return num.toLocaleString()
}

const getDb = () => {
  return nuxtApp.$db || null
}

const initFirestoreListener = () => {
  loading.value = true
  const db = getDb()
  if (!db) {
    console.error('Firestore instance not found')
    loading.value = false
    return
  }

  try {
    const q = query(collection(db, 'bookings'))

    unsubscribe = onSnapshot(q, (snapshot) => {
      const list = []

      snapshot.forEach((docSnap) => {
        const data = docSnap.data()

        const guestName = String(data.guestName || data.userName || data.name || data.fullName || data.customerName || 'Valued Guest')
        const guestEmail = String(data.guestEmail || data.userEmail || data.email || '')
        const guestAvatar = String(data.guestAvatar || data.avatar || data.photoURL || data.image || data.profileImage || '')
        const rawUserId = String(data.userId || data.user_id || data.uid || data.createdBy || data.memberId || data.customerID || '').trim()
        const hotelName = String(data.hotelName || data.title || data.propertyName || 'Hotel Reservation')
        const statusVal = String(data.status || 'pending')
        const refVal = data.ref ? String(data.ref) : undefined

        list.push({
          ...data,
          id: docSnap.id,
          userId: rawUserId,
          guestName,
          guestEmail,
          guestAvatar,
          hotelName,
          status: statusVal,
          ref: refVal,
          totalPrice: parsePrice(data),
          checkIn: formatDate(data.checkIn || data.checkInDate),
          checkOut: formatDate(data.checkOut || data.checkOutDate)
        })
      })

      bookings.value = list
      loading.value = false
    }, (error) => {
      console.error('Firestore listener error:', error)
      loading.value = false
    })
  } catch (error) {
    console.error('Error binding listener:', error)
    loading.value = false
  }
}

const changeStatus = async (id, newStatus) => {
  const targetId = String(id || '').trim()
  const db = getDb()

  if (!db || !targetId) return

  actionLoadingId.value = targetId

  try {
    const bookingRef = doc(db, 'bookings', targetId)
    
    await updateDoc(bookingRef, { 
      status: newStatus,
      updatedAt: serverTimestamp()
    })

    const booking = bookings.value.find((item) => item.id === targetId)
    
    // Fix: Using the top-level nuxtApp reference, as useNuxtApp() will throw an error if called after `await`
    const authUser = nuxtApp.$auth?.currentUser
    const actorId = authUser?.uid || 'admin'
    
    let targetUserId = booking?.userId || ''

    if (!targetUserId && booking?.guestEmail) {
      try {
        const usersRef = collection(db, 'users')
        const qUsers = query(usersRef, where('email', '==', booking.guestEmail))
        const userSnap = await getDocs(qUsers)
        if (!userSnap.empty) {
          targetUserId = userSnap.docs[0].id
        }
      } catch (err) {
        console.error('Could not resolve user by email:', err)
      }
    }
    
    if (targetUserId) {
      const hotel = booking?.hotelName || 'SabayStay'
      let notifTitle = `Booking Status: ${newStatus}`
      let notifMessage = `Your booking request for ${hotel} has been updated to ${newStatus}.`

      const norm = normalizeStatus(newStatus)
      if (norm === 'confirmed') {
        notifTitle = 'Booking Confirmed!'
        notifMessage = `Your reservation for ${hotel} has been approved and confirmed.`
      } else if (norm === 'check-in') {
        notifTitle = 'Checked In Successfully'
        notifMessage = `You are now checked in for your stay at ${hotel}. Enjoy your trip!`
      } else if (norm === 'check-out') {
        notifTitle = 'Checked Out'
        notifMessage = `Thank you for staying at ${hotel}. We hope to see you again soon!`
      } else if (norm === 'cancelled') {
        notifTitle = 'Booking Request Cancelled'
        notifMessage = `Your request for ${hotel} could not be completed or has been cancelled.`
      }

      await addDoc(collection(db, 'notifications'), {
        recipientId: targetUserId,
        userId: targetUserId,
        actorId,
        bookingId: targetId,
        type: 'booking',
        title: notifTitle,
        message: notifMessage,
        isRead: false,
        createdAt: serverTimestamp()
      })
    }
  } catch (error) {
    console.error('Error updating status:', error)
    alert(`Update failed: ${error.message || error}`)
  } finally {
    actionLoadingId.value = null
  }
}

const deleteBooking = async (id) => {
  const targetId = String(id || '').trim()
  const db = getDb()

  if (!db || !targetId) return
  if (!confirm('Are you sure you want to delete this booking permanent record? This action cannot be undone.')) return

  actionLoadingId.value = targetId

  try {
    await deleteDoc(doc(db, 'bookings', targetId))
  } catch (error) {
    console.error('Error deleting booking:', error)
    alert(`Deletion failed: ${error.message || error}`)
  } finally {
    actionLoadingId.value = null
  }
}

const filteredBookings = computed(() => {
  let list = bookings.value || []

  if (selectedStatus.value !== 'All') {
    list = list.filter(b => normalizeStatus(b.status) === normalizeStatus(selectedStatus.value))
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(b =>
      (b.hotelName && String(b.hotelName).toLowerCase().includes(q)) ||
      (b.guestName && String(b.guestName).toLowerCase().includes(q)) ||
      (b.ref && String(b.ref).toLowerCase().includes(q)) ||
      String(b.id).toLowerCase().includes(q)
    )
  }

  return list
})

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage.value) || 1
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBookings.value.slice(start, end)
})

watch([searchQuery, selectedStatus, itemsPerPage], () => {
  currentPage.value = 1
})

const exportCSV = () => {
  if (!filteredBookings.value.length) {
    alert('No data available to export.')
    return
  }

  const headers = ['Ref', 'Hotel Name', 'Guest Name', 'Guest Email', 'Check-In', 'Check-Out', 'Total Price ($)', 'Status']
  const rows = filteredBookings.value.map(b => [
    `"${b.ref || b.id}"`,
    `"${(b.hotelName || '').replace(/"/g, '""')}"`,
    `"${(b.guestName || '').replace(/"/g, '""')}"`,
    `"${(b.guestEmail || '').replace(/"/g, '""')}"`,
    `"${b.checkIn}"`,
    `"${b.checkOut}"`,
    b.totalPrice,
    `"${b.status}"`
  ])

  const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  
  // Fix: Use Blob instead of encodeURI. Special characters like '#' (common in IDs) break encodeURI string downloads
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  
  link.setAttribute('href', url)
  link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  initFirestoreListener()
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
  <ClientOnly>
    <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-700">
      <!-- Header -->
      <div class="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight font-serif">Booking Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage room reservations and send updates to guests</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="exportCSV" 
            class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4 text-[#1d1b4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <span class="text-xs bg-[#1d1b4b] text-white font-bold px-3.5 py-2 rounded-xl shadow-sm">
            Total: {{ bookings.length }}
          </span>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-300 shadow-sm">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by hotel name, guest name, or Ref ID..."
          class="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1d1b4b] focus:bg-white transition-colors"
        />
        <select
          v-model="selectedStatus"
          class="px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1d1b4b] focus:bg-white transition-colors"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Check-in">Check-in</option>
          <option value="Check-out">Check-out</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <!-- Bookings Table Wrapper -->
      <div class="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-300 text-[11px] text-slate-500 uppercase tracking-wider font-bold">
                <th class="py-3.5 px-6">Ref</th>
                <th class="py-3.5 px-6">Hotel Name</th>
                <th class="py-3.5 px-6">Guest</th>
                <th class="py-3.5 px-6">Dates</th>
                <th class="py-3.5 px-6">Price</th>
                <th class="py-3.5 px-6">Status</th>
                <th class="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-300 text-xs">
              <tr v-for="b in paginatedBookings" :key="b.id" class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-6 font-mono font-bold text-slate-600">{{ b.ref || `#${String(b.id).slice(0, 6)}` }}</td>
                <td class="py-4 px-6 font-bold text-slate-900">{{ b.hotelName }}</td>
                <td class="py-4 px-6 text-slate-700 font-medium">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
                      <img 
                        v-if="b.guestAvatar" 
                        :src="b.guestAvatar" 
                        alt="Guest Avatar" 
                        class="w-full h-full object-cover" 
                      />
                      <span v-else class="text-xs font-bold text-[#1d1b4b]">
                        {{ (b.guestName || 'U').charAt(0).toUpperCase() }}
                      </span>
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ b.guestName }}</p>
                      <p v-if="b.guestEmail" class="mt-0.5 text-[11px] text-slate-500">{{ b.guestEmail }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-slate-500 whitespace-nowrap">{{ b.checkIn }} — {{ b.checkOut }}</td>
                <td class="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">${{ formatPrice(b.totalPrice) }}</td>
                <td class="py-4 px-6 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-amber-50 text-amber-700 border-amber-300': normalizeStatus(b.status) === 'pending',
                      'bg-emerald-50 text-emerald-700 border-emerald-300': normalizeStatus(b.status) === 'confirmed',
                      'bg-indigo-50 text-indigo-700 border-indigo-300': normalizeStatus(b.status) === 'check-in',
                      'bg-slate-100 text-slate-700 border-slate-300': normalizeStatus(b.status) === 'check-out',
                      'bg-rose-50 text-rose-700 border-rose-300': normalizeStatus(b.status) === 'cancelled'
                    }"
                    class="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="{
                      'bg-amber-500': normalizeStatus(b.status) === 'pending',
                      'bg-emerald-500': normalizeStatus(b.status) === 'confirmed',
                      'bg-[#1d1b4b]': normalizeStatus(b.status) === 'check-in',
                      'bg-slate-500': normalizeStatus(b.status) === 'check-out',
                      'bg-rose-500': normalizeStatus(b.status) === 'cancelled'
                    }"></span>
                    {{ b.status }}
                  </span>
                </td>
                <td class="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                  <button
                    v-if="normalizeStatus(b.status) === 'pending'"
                    :disabled="actionLoadingId === b.id"
                    @click="changeStatus(b.id, 'Confirmed')"
                    class="px-3 py-1.5 bg-[#1d1b4b] hover:bg-[#1a1843] text-white rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Approve
                  </button>

                  <button
                    v-if="normalizeStatus(b.status) === 'confirmed'"
                    :disabled="actionLoadingId === b.id"
                    @click="changeStatus(b.id, 'Check-in')"
                    class="px-3 py-1.5 bg-[#1d1b4b] hover:bg-[#1a1843] text-white rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Check In
                  </button>

                  <button
                    v-if="normalizeStatus(b.status) === 'check-in'"
                    :disabled="actionLoadingId === b.id"
                    @click="changeStatus(b.id, 'Check-out')"
                    class="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Check Out
                  </button>

                  <button
                    v-if="!['cancelled', 'check-out'].includes(normalizeStatus(b.status))"
                    :disabled="actionLoadingId === b.id"
                    @click="changeStatus(b.id, 'Cancelled')"
                    class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    :disabled="actionLoadingId === b.id"
                    @click="deleteBooking(b.id)"
                    title="Delete Booking"
                    class="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center align-middle disabled:opacity-50"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>

              <tr v-if="loading">
                <td colspan="7" class="py-16 text-center text-slate-500 text-xs font-medium">
                  <div class="inline-flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full border-2 border-[#1d1b4b] border-t-transparent animate-spin"></div>
                    Fetching live booking data from Firestore...
                  </div>
                </td>
              </tr>

              <tr v-if="!loading && filteredBookings.length === 0">
                <td colspan="7" class="py-16 text-center text-slate-400 text-xs font-medium">
                  No booking records match your search criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="!loading && filteredBookings.length > 0" class="px-6 py-4 bg-slate-50 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <span>Show</span>
            <select 
              v-model="itemsPerPage"
              class="bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:outline-none focus:border-[#1d1b4b]"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span>entries per page</span>
          </div>

          <div class="flex items-center gap-4">
            <span>
              Page <strong class="text-slate-900">{{ currentPage }}</strong> of <strong class="text-slate-900">{{ totalPages }}</strong>
            </span>
            <div class="inline-flex gap-1">
              <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                Previous
              </button>
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>