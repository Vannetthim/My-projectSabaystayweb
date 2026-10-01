<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, type Firestore } from 'firebase/firestore'
import { useNuxtApp } from '#imports'

const loading = ref(true)
const monthlyData = ref([
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 0 },
  { month: 'Mar', revenue: 0 },
  { month: 'Apr', revenue: 0 },
  { month: 'May', revenue: 0 },
  { month: 'Jun', revenue: 0 },
  { month: 'Jul', revenue: 0 },
  { month: 'Aug', revenue: 0 },
  { month: 'Sep', revenue: 0 },
  { month: 'Oct', revenue: 0 },
  { month: 'Nov', revenue: 0 },
  { month: 'Dec', revenue: 0 },
])


const maxRevenue = computed(() => {
  const max = Math.max(...monthlyData.value.map(d => d.revenue))
  return max > 0 ? max : 10000 
})


const totalRevenue = computed(() => {
  return monthlyData.value.reduce((sum, item) => sum + item.revenue, 0)
})

const fetchAnalytics = async () => {
  loading.value = true
  const nuxtApp = useNuxtApp()
  const db = nuxtApp.$db as Firestore

  if (!db) {
    loading.value = false
    return
  }

  try {
    const q = query(
      collection(db, 'bookings'),
      where('status', 'in', ['Confirmed', 'Check-in', 'Check-out'])
    )
    const snap = await getDocs(q)
    const buckets = new Array(12).fill(0)

    snap.forEach((docSnap) => {
      const data = docSnap.data()
      const price = Number(data.totalPrice ?? data.amount ?? data.price ?? 0)
      

      let monthIndex = new Date().getMonth()
      if (data.createdAt) {
        const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        if (!isNaN(d.getTime())) monthIndex = d.getMonth()
      }
      
      buckets[monthIndex] += price
    })

    monthlyData.value = monthlyData.value.map((item, index) => ({
      ...item,
      revenue: buckets[index]
    }))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnalytics()
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="font-serif font-bold text-slate-900 text-lg">Revenue Overview</h3>
        <p class="text-xs text-slate-400">Monthly earnings summary (2026)</p>
      </div>
      <span class="text-2xl font-bold text-emerald-600">
        ${{ totalRevenue.toLocaleString() }}
      </span>
    </div>


    <div class="h-48 flex items-end justify-between gap-2 pt-6">
      <div 
        v-for="item in monthlyData" 
        :key="item.month" 
        class="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
      >

        <div class="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded transition-opacity pointer-events-none whitespace-nowrap">
          ${{ item.revenue.toLocaleString() }}
        </div>


        <div 
          class="w-full bg-indigo-900 rounded-t-lg transition-all duration-500 hover:bg-amber-400"
          :style="{ height: item.revenue > 0 ? `${(item.revenue / maxRevenue) * 100}%` : '4px' }"
        ></div>
        
        <span class="text-[10px] font-medium text-slate-400">{{ item.month }}</span>
      </div>
    </div>
  </div>
</template>
