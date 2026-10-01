<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  type Firestore 
} from 'firebase/firestore'
import { definePageMeta, useNuxtApp } from '#imports'
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Mail,
  Trash2,
  Eye,
  X,
  Calendar,
  Shield,
  User as UserIcon,
  Phone
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface GuestUser {
  id: string
  name?: string
  fullName?: string
  email: string
  phone?: string
  phoneNumber?: string
  role?: string
  status?: string
  avatar?: string
  photoURL?: string
  image?: string
  profileImage?: string
  photo?: string
  createdAt?: any
  collectionSource?: string
}

const guests = ref<GuestUser[]>([])
const loading = ref<boolean>(true)
const actionLoadingId = ref<string | null>(null)
const searchQuery = ref<string>('')
const selectedStatus = ref<string>('All Statuses')

// Profile Modal State
const selectedUserForView = ref<GuestUser | null>(null)
const isViewModalOpen = ref<boolean>(false)

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

const parseDateString = (dateVal: any): string => {
  if (!dateVal) return 'N/A'
  let date: Date
  if (typeof dateVal?.toDate === 'function') {
    date = dateVal.toDate()
  } else if (dateVal?.seconds) {
    date = new Date(dateVal.seconds * 1000)
  } else {
    date = new Date(dateVal)
  }
  return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const fetchGuests = async () => {
  loading.value = true
  const db = getDb()
  if (!db) {
    loading.value = false
    return
  }

  try {
    const list: GuestUser[] = []
    const processedIds = new Set<string>()
    const collectionsToFetch = ['user', 'users', 'owner']

    for (const colName of collectionsToFetch) {
      try {
        const querySnapshot = await getDocs(collection(db, colName))
        querySnapshot.forEach((docSnap) => {
          if (!processedIds.has(docSnap.id)) {
            processedIds.add(docSnap.id)
            list.push({
              id: docSnap.id,
              collectionSource: colName,
              ...docSnap.data()
            } as GuestUser)
          }
        })
      } catch (err) {
        console.warn(`Could not query collection ${colName}:`, err)
      }
    }

    guests.value = list
  } catch (error) {
    console.error('Error fetching registered guests:', error)
  } finally {
    loading.value = false
  }
}

const openProfileModal = (guest: GuestUser) => {
  selectedUserForView.value = guest
  isViewModalOpen.value = true
}

const closeProfileModal = () => {
  isViewModalOpen.value = false
  selectedUserForView.value = null
}

const acceptUser = async (guest: GuestUser) => {
  const db = getDb()
  if (!db) return

  actionLoadingId.value = guest.id
  const targetCol = guest.collectionSource || 'user'

  try {
    const userRef = doc(db, targetCol, guest.id)
    await updateDoc(userRef, { status: 'Approved' })
    if (selectedUserForView.value?.id === guest.id) {
      selectedUserForView.value.status = 'Approved'
    }
    await fetchGuests()
  } catch (error) {
    console.error('Error approving user:', error)
  } finally {
    actionLoadingId.value = null
  }
}

const blockUser = async (guest: GuestUser) => {
  const db = getDb()
  if (!db) return

  actionLoadingId.value = guest.id
  const targetCol = guest.collectionSource || 'user'

  try {
    const userRef = doc(db, targetCol, guest.id)
    await updateDoc(userRef, { status: 'Blocked' })
    if (selectedUserForView.value?.id === guest.id) {
      selectedUserForView.value.status = 'Blocked'
    }
    await fetchGuests()
  } catch (error) {
    console.error('Error blocking user:', error)
  } finally {
    actionLoadingId.value = null
  }
}

const deleteUser = async (guest: GuestUser) => {
  const db = getDb()
  if (!db || !guest.id) return

  if (!confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) {
    return
  }

  actionLoadingId.value = guest.id
  const targetCol = guest.collectionSource || 'user'

  try {
    const userRef = doc(db, targetCol, guest.id)
    await deleteDoc(userRef)
    if (selectedUserForView.value?.id === guest.id) {
      closeProfileModal()
    }
    await fetchGuests()
  } catch (error) {
    console.error('Error deleting user:', error)
    alert(`Deletion failed: ${error instanceof Error ? error.message : error}`)
  } finally {
    actionLoadingId.value = null
  }
}

const getUserAvatar = (guest: GuestUser): string | null => {
  return guest.avatar || guest.photoURL || guest.image || guest.profileImage || guest.photo || null
}

const getUserDisplayName = (guest: GuestUser): string => {
  return guest.name || guest.fullName || 'N/A'
}

const filteredGuests = computed(() => {
  return guests.value.filter((guest) => {
    const name = getUserDisplayName(guest).toLowerCase()
    const email = (guest.email || '').toLowerCase()
    const matchesSearch = name.includes(searchQuery.value.toLowerCase()) || email.includes(searchQuery.value.toLowerCase())
    
    const currentStatus = (guest.status || 'Active').toLowerCase()
    const filterStatus = selectedStatus.value.toLowerCase()
    const matchesStatus = selectedStatus.value === 'All Statuses' || currentStatus === filterStatus

    return matchesSearch && matchesStatus
  })
})

onMounted(() => {
  fetchGuests()
})
</script>

<template>
  <ClientOnly>
    <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-700">
      <!-- Search & Refresh Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search..." 
            class="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1d1b4b] focus:bg-white transition-colors" 
          />
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="fetchGuests" 
            class="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            :disabled="loading"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
            Refresh
          </button>
        </div>
      </div>

      <!-- Users Table Container -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-175">
            <tbody class="divide-y divide-slate-100 text-xs">
              <tr v-for="guest in filteredGuests" :key="guest.id" class="hover:bg-slate-50/80 transition-colors">
                <!-- User Info & Avatar -->
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <div 
                      @click="openProfileModal(guest)"
                      class="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 cursor-pointer"
                    >
                      <img 
                        v-if="getUserAvatar(guest)" 
                        :src="getUserAvatar(guest)!" 
                        alt="User Avatar" 
                        class="w-full h-full object-cover" 
                      />
                      <span v-else class="text-xs font-bold text-[#1d1b4b] uppercase">
                        {{ (getUserDisplayName(guest) || guest.email || 'U').charAt(0) }}
                      </span>
                    </div>
                    <div>
                      <p 
                        @click="openProfileModal(guest)"
                        class="font-bold text-slate-900 cursor-pointer hover:text-[#1d1b4b] transition-colors"
                      >
                        {{ getUserDisplayName(guest) }}
                      </p>
                      <div class="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                        <Mail class="w-3 h-3 text-slate-300" />
                        {{ guest.email }}
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="py-4 px-6 text-slate-600 font-medium lowercase">
                  {{ guest.role || 'user' }}
                </td>

                <!-- Status Badge -->
                <td class="py-4 px-6 whitespace-nowrap">
                  <span 
                    :class="{
                      'bg-emerald-50 text-emerald-700 border-emerald-200': (guest.status || '').toLowerCase() === 'active' || (guest.status || '').toLowerCase() === 'approved',
                      'bg-amber-50 text-amber-700 border-amber-200': (guest.status || '').toLowerCase() === 'pending',
                      'bg-rose-50 text-rose-700 border-rose-200': (guest.status || '').toLowerCase() === 'blocked' || (guest.status || '').toLowerCase() === 'rejected'
                    }" 
                    class="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="{
                      'bg-emerald-500': (guest.status || '').toLowerCase() === 'active' || (guest.status || '').toLowerCase() === 'approved',
                      'bg-amber-500': (guest.status || '').toLowerCase() === 'pending',
                      'bg-rose-500': (guest.status || '').toLowerCase() === 'blocked' || (guest.status || '').toLowerCase() === 'rejected'
                    }"></span>
                    {{ guest.status || 'Active' }}
                  </span>
                </td>

                <!-- Action Buttons -->
                <td class="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                  <!-- View Profile Button -->
                  <button 
                    @click="openProfileModal(guest)"
                    title="View Profile Details"
                    class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center align-middle"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>

                  <!-- Accept Button -->
                  <button 
                    v-if="(guest.status || '').toLowerCase() !== 'approved' && (guest.status || '').toLowerCase() !== 'active'"
                    :disabled="actionLoadingId === guest.id"
                    @click="acceptUser(guest)" 
                    class="px-3.5 py-1.5 bg-[#1d1b4b] hover:bg-[#15133c] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UserCheck class="w-3.5 h-3.5" />
                    Accept
                  </button>

                  <!-- Block Button -->
                  <button 
                    :disabled="actionLoadingId === guest.id"
                    @click="blockUser(guest)" 
                    class="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UserX class="w-3.5 h-3.5" />
                    Block
                  </button>

                  <!-- Delete Account Button -->
                  <button
                    :disabled="actionLoadingId === guest.id"
                    @click="deleteUser(guest)"
                    title="Delete Account"
                    class="p-2 bg-white hover:bg-red-50 text-slate-300 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center align-middle disabled:opacity-50"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>

              <!-- Loading State -->
              <tr v-if="loading">
                <td colspan="4" class="py-16 text-center text-slate-500 text-xs font-medium">
                  <div class="inline-flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full border-2 border-[#1d1b4b] border-t-transparent animate-spin"></div>
                    Loading users...
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="!loading && filteredGuests.length === 0">
                <td colspan="4" class="py-16 text-center text-slate-400 text-xs font-medium">
                  No users found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Profile View Modal -->
      <div 
        v-if="isViewModalOpen && selectedUserForView" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
        @click.self="closeProfileModal"
      >
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-[#1d1b4b] p-6 text-white relative">
            <button 
              @click="closeProfileModal" 
              class="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold">
                <img 
                  v-if="getUserAvatar(selectedUserForView)" 
                  :src="getUserAvatar(selectedUserForView)!" 
                  alt="Profile Photo" 
                  class="w-full h-full object-cover" 
                />
                <span v-else>{{ (getUserDisplayName(selectedUserForView) || 'U').charAt(0) }}</span>
              </div>
              <div>
                <h2 class="text-xl font-bold leading-tight">{{ getUserDisplayName(selectedUserForView) }}</h2>
                <p class="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <Mail class="w-3.5 h-3.5" />
                  {{ selectedUserForView.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 text-xs">
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">User ID</span>
                <span class="font-mono text-slate-800 break-all">{{ selectedUserForView.id }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role</span>
                <span class="font-semibold text-slate-800 flex items-center gap-1">
                  <Shield class="w-3.5 h-3.5 text-slate-500" />
                  {{ selectedUserForView.role || 'user' }}
                </span>
              </div>
            </div>

            <div class="space-y-3 pt-2">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="text-slate-500 font-medium flex items-center gap-2">
                  <UserIcon class="w-4 h-4 text-slate-400" />
                  Status
                </span>
                <span 
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': (selectedUserForView.status || '').toLowerCase() === 'active' || (selectedUserForView.status || '').toLowerCase() === 'approved',
                    'bg-amber-50 text-amber-700 border-amber-200': (selectedUserForView.status || '').toLowerCase() === 'pending',
                    'bg-rose-50 text-rose-700 border-rose-200': (selectedUserForView.status || '').toLowerCase() === 'blocked' || (selectedUserForView.status || '').toLowerCase() === 'rejected'
                  }" 
                  class="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider"
                >
                  {{ selectedUserForView.status || 'Active' }}
                </span>
              </div>

              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="text-slate-500 font-medium flex items-center gap-2">
                  <Phone class="w-4 h-4 text-slate-400" />
                  Phone
                </span>
                <span class="font-semibold text-slate-800">
                  {{ selectedUserForView.phone || selectedUserForView.phoneNumber || 'Not provided' }}
                </span>
              </div>

              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <span class="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar class="w-4 h-4 text-slate-400" />
                  Joined Date
                </span>
                <span class="font-semibold text-slate-800">
                  {{ parseDateString(selectedUserForView.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button 
              @click="closeProfileModal" 
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button 
              v-if="(selectedUserForView.status || '').toLowerCase() !== 'approved' && (selectedUserForView.status || '').toLowerCase() !== 'active'"
              @click="acceptUser(selectedUserForView)" 
              class="px-4 py-2 bg-[#1d1b4b] hover:bg-[#15133c] text-white rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Approve User
            </button>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>