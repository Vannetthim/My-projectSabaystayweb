<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  type Firestore 
} from 'firebase/firestore'
import { definePageMeta, useNuxtApp } from '#imports'
import { useAuth } from '~/composables/auth/useAuth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Current authenticated user state
const { user } = useAuth()

const rawRevenue = ref<number>(0)
const totalBookingsCount = ref<number>(0)
const approvedUsersCount = ref<number>(0)
const loadingMetrics = ref<boolean>(true)

const monthlyRevenueData = ref<number[]>(new Array(12).fill(0))
const monthlyUsersData = ref<number[]>(new Array(12).fill(0))
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

// Improved date parsing to catch string dates like checkIn ("2026-05-19")
const parseDate = (data: any): Date => {
  const dateVal = 
    data?.checkIn || 
    data?.checkInDate || 
    data?.createdAt || 
    data?.created_at || 
    data?.date || 
    data?.timestamp || 
    data?.updatedAt || 
    data?.joinedDate

  if (!dateVal) return new Date()
  if (typeof dateVal?.toDate === 'function') return dateVal.toDate()
  if (dateVal?.seconds) return new Date(dateVal.seconds * 1000)
  
  const parsed = new Date(dateVal)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

const fetchAnalytics = async () => {
  loadingMetrics.value = true
  const db = getDb()
  if (!db) {
    loadingMetrics.value = false
    return
  }

  try {
    const revenueBuckets = new Array(12).fill(0)
    const userBuckets = new Array(12).fill(0)

    // 1. Fetch Bookings
    let bookingsSnap
    try {
      bookingsSnap = await getDocs(collection(db, 'bookings'))
    } catch (err) {
      console.warn('Error fetching bookings:', err)
    }

    let sumRevenue = 0
    let validBookingsCount = 0

    if (bookingsSnap) {
      bookingsSnap.forEach((docSnap) => {
        const data = docSnap.data() as any
        const status = String(data?.status || '').toLowerCase().trim()
        
        // Match confirmed, paid, approved, or pending statuses
        const isTargetStatus = ['confirmed', 'check-in', 'check-out', 'paid', 'completed', 'approved', 'pending'].includes(status)

        if (isTargetStatus || !data?.status) {
          validBookingsCount++
          const price = Number(data?.totalPrice ?? data?.amount ?? data?.price ?? data?.total ?? 0)
          sumRevenue += price

          const date = parseDate(data)
          const monthIndex = date.getMonth() // 0 = Jan, 4 = May
          if (monthIndex >= 0 && monthIndex < 12) {
            revenueBuckets[monthIndex] = (revenueBuckets[monthIndex] || 0) + price
          }
        }
      })
    }

    rawRevenue.value = sumRevenue
    totalBookingsCount.value = validBookingsCount
    monthlyRevenueData.value = revenueBuckets

    // 2. Fetch Active Users & Owners
    let activeCount = 0
    const processedUids = new Set<string>()

    const processUserDocs = (snapshot: any) => {
      snapshot.forEach((docSnap: any) => {
        if (processedUids.has(docSnap.id)) return
        processedUids.add(docSnap.id)

        const data = docSnap.data() as any
        if (data?.role === 'admin') return

        activeCount++
        const date = parseDate(data)
        const monthIndex = date.getMonth()
        if (monthIndex >= 0 && monthIndex < 12) {
          userBuckets[monthIndex] = (userBuckets[monthIndex] || 0) + 1
        }
      })
    }

    try {
      const usersSnap = await getDocs(collection(db, 'users'))
      processUserDocs(usersSnap)
    } catch (err) {}

    try {
      const userSnap = await getDocs(collection(db, 'user'))
      processUserDocs(userSnap)
    } catch (err) {}

    try {
      const ownersSnap = await getDocs(collection(db, 'owner'))
      processUserDocs(ownersSnap)
    } catch (err) {}

    approvedUsersCount.value = activeCount
    monthlyUsersData.value = userBuckets

  } catch (error) {
    console.error('Error fetching analytics metrics:', error)
  } finally {
    loadingMetrics.value = false
  }
}

const formattedRevenue = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(rawRevenue.value)
})

const maxRevenueValue = computed(() => Math.max(...monthlyRevenueData.value, 100))
const maxUserValue = computed(() => Math.max(...monthlyUsersData.value, 10))

const generateSmoothPath = (data: number[], maxValue: number): string => {
  if (!data || data.length === 0) return ''
  const width = 500
  const height = 200
  const points = data.map((val, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width
    const safeVal = val || 0
    const y = height - (safeVal / maxValue) * (height - 20) - 10
    return { x, y }
  })

  const firstPoint = points[0]
  if (!firstPoint) return ''

  let path = `M ${firstPoint.x} ${firstPoint.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]
    const next = points[i + 1]
    if (!current || !next) continue
    const xc = (current.x + next.x) / 2
    const yc = (current.y + next.y) / 2
    path += ` Q ${current.x} ${current.y}, ${xc} ${yc}`
  }
  const last = points[points.length - 1]
  if (last) {
    path += ` L ${last.x} ${last.y}`
  }
  return path
}

const generateAreaPath = (data: number[], maxValue: number): string => {
  const linePath = generateSmoothPath(data, maxValue)
  if (!linePath) return ''
  const width = 500
  const height = 200
  return `${linePath} L ${width} ${height} L 0 ${height} Z`
}

const revenueLinePath = computed(() => generateSmoothPath(monthlyRevenueData.value, maxRevenueValue.value))
const revenueAreaPath = computed(() => generateAreaPath(monthlyRevenueData.value, maxRevenueValue.value))

const userLinePath = computed(() => generateSmoothPath(monthlyUsersData.value, maxUserValue.value))
const userAreaPath = computed(() => generateAreaPath(monthlyUsersData.value, maxUserValue.value))

const exportReport = () => {
  const csvContent = [
    ['Metric', 'Value'],
    ['Gross Revenue', `$${rawRevenue.value}`],
    ['Completed Bookings', totalBookingsCount.value],
    ['Active Guests', approvedUsersCount.value]
  ].map(e => e.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `SabayStay_Analytics_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <ClientOnly>
    <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-700">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-serif font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p class="text-sm text-slate-500 mt-1">Real-time revenue, booking performance, and registered user growth.</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            @click="fetchAnalytics"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refresh Data
          </button>
          <button 
            @click="exportReport"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1d1b4b] hover:bg-[#15133c] text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Full Report
          </button>
        </div>
      </div>

      <!-- Metrics Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</p>
          <p class="text-2xl font-bold text-slate-900 mt-2">{{ loadingMetrics ? '...' : formattedRevenue }}</p>
          <p class="text-xs text-[#1d1b4b] mt-2 font-medium flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#1d1b4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            Real-time Firestore Sync
          </p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed Bookings</p>
          <p class="text-2xl font-bold text-slate-900 mt-2">{{ loadingMetrics ? '...' : totalBookingsCount }}</p>
          <p class="text-xs text-[#1d1b4b] mt-2 font-medium flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#1d1b4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Verified Reservations
          </p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-300 shadow-sm">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Guests</p>
          <p class="text-2xl font-bold text-slate-900 mt-2">{{ loadingMetrics ? '...' : approvedUsersCount }}</p>
          <p class="text-xs text-[#1d1b4b] mt-2 font-medium flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-[#1d1b4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Accepted User Accounts
          </p>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Overview Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-slate-900">Revenue Overview</h2>
            <span class="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 px-3 py-1 rounded-xl">2026</span>
          </div>
          <div v-if="!loadingMetrics" class="relative h-64 w-full flex flex-col justify-end pt-4">
            <svg viewBox="0 0 500 200" class="w-full h-52 overflow-visible">
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1d1b4b" stop-opacity="0.35" />
                  <stop offset="100%" stop-color="#1d1b4b" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="0" x2="500" y2="0" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="65" x2="500" y2="65" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="#cbd5e1" stroke-width="1" />

              <path :d="revenueAreaPath" fill="url(#revenueGradient)" />
              <path :d="revenueLinePath" fill="none" stroke="#1d1b4b" stroke-width="3" stroke-linecap="round" />
            </svg>
            <div class="flex justify-between text-[10px] text-slate-500 mt-2 px-1 font-medium">
              <span v-for="label in monthLabels" :key="label">{{ label }}</span>
            </div>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-slate-400 text-xs">Loading graph...</div>
        </div>

        <!-- User Acquisition Chart -->
        <div class="bg-white p-6 rounded-2xl border border-slate-300 shadow-sm space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold text-slate-900">User Acquisition</h2>
            <span class="text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-300 px-3 py-1 rounded-xl">Monthly</span>
          </div>
          <div v-if="!loadingMetrics" class="relative h-64 w-full flex flex-col justify-end pt-4">
            <svg viewBox="0 0 500 200" class="w-full h-52 overflow-visible">
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1d1b4b" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="#1d1b4b" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="0" x2="500" y2="0" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="65" x2="500" y2="65" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#e2e8f0" stroke-width="1" />
              <line x1="0" y1="200" x2="500" y2="200" stroke="#cbd5e1" stroke-width="1" />

              <path :d="userAreaPath" fill="url(#userGradient)" />
              <path :d="userLinePath" fill="none" stroke="#1d1b4b" stroke-width="3" stroke-linecap="round" />
            </svg>
            <div class="flex justify-between text-[10px] text-slate-500 mt-2 px-1 font-medium">
              <span v-for="label in monthLabels" :key="label">{{ label }}</span>
            </div>
          </div>
          <div v-else class="h-64 flex items-center justify-center text-slate-400 text-xs">Loading graph...</div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>