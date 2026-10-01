<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { definePageMeta, useNuxtApp } from '#imports';
import { useAuth } from '~/composables/auth/useAuth';
import { useFavorites } from "~/composables/user/useFavorites";
// Import Lucide Icons
import { Plane, Heart, Award, Calendar, TrendingUp } from 'lucide-vue-next';

definePageMeta({ layout: "user", middleware: "auth" });

const { user } = useAuth();
const { favorites } = useFavorites();
const { $db } = useNuxtApp() as any;

const bookingCount = ref(0);
const totalFavorites = computed(() => favorites.value.length);
const rewardPoints = computed(() => 500 + bookingCount.value * 1000);

// Resolve user display name robustly across different auth provider schemas
const userName = computed(() => {
  return user.value?.name || user.value?.displayName || (user.value?.email ? user.value.email.split('@')[0] : "Traveler");
});

// Dynamically generate the past 12 months ending with the current month
const dynamicMonths = computed(() => {
  const months = [];
  const date = new Date();
  // Go back 11 months to start a rolling 12-month view
  date.setMonth(date.getMonth() - 11);
  
  for (let i = 0; i < 12; i++) {
    const monthStr = date.toLocaleString('en-US', { month: 'short' });
    const yearNum = date.getFullYear();
    
    months.push({
      key: `${monthStr}-${yearNum}`,
      label: monthStr,
      year: yearNum
    });
    date.setMonth(date.getMonth() + 1);
  }
  return months;
});

const monthlyData = ref<Record<string, number>>({});

const maxMonthlyBookings = computed(() => {
  const values = Object.values(monthlyData.value);
  const max = Math.max(...values, 0);
  return max > 0 ? max : 5; // Default ceiling to prevent division by zero
});

let unsubscribe = () => {};

onMounted(() => {
  if (!$db || !user.value?.id) return;
  
  unsubscribe = onSnapshot(query(collection($db, "bookings"), where("userId", "==", user.value.id)), (snapshot) => {
    let activeBookingsCount = 0;
    const counts: Record<string, number> = {};

    snapshot.docs.forEach((item) => {
      const data = item.data();
      const status = String(data.status || "").toLowerCase();
      
      if (status !== "cancelled") {
        activeBookingsCount++;

        // Parse date from booking (supporting createdAt, checkIn, or date fields)
        const rawDate = data.createdAt || data.checkIn || data.date;
        if (rawDate) {
          const dateObj = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
          if (!isNaN(dateObj.getTime())) {
            const monthStr = dateObj.toLocaleString('en-US', { month: 'short' }); 
            const yearNum = dateObj.getFullYear();
            const compositeKey = `${monthStr}-${yearNum}`;
            
            counts[compositeKey] = (counts[compositeKey] || 0) + 1;
          }
        }
      }
    });

    bookingCount.value = activeBookingsCount;
    monthlyData.value = counts;
  });
});

onUnmounted(() => unsubscribe());
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto pb-12 text-slate-800 font-sans">
    <!-- Header Section -->
    <div class="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Welcome back, {{ userName }}.
        </h1>
        <p class="mt-1 text-sm text-slate-500 font-medium">
          Here is a summary of your recent travels and upcoming adventures from live Firebase collections.
        </p>
      </div>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <!-- Total Bookings Card -->
      <div class="flex items-center justify-between rounded-2xl border border-slate-300 bg-white p-6 shadow-lg">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Bookings
          </p>
          <p class="mt-3 text-3xl font-bold text-slate-900">
            {{ bookingCount }}
          </p>
        </div>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-slate-300 shadow-inner">
          <Plane class="w-6 h-6" />
        </span>
      </div>

      <!-- Saved Places Card -->
      <div class="flex items-center justify-between rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Saved Places
          </p>
          <p class="mt-3 text-3xl font-bold text-slate-900">
            {{ totalFavorites }}
          </p>
        </div>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-slate-300 shadow-inner">
          <Heart class="w-6 h-6" />
        </span>
      </div>

      <!-- Member Points Card -->
      <div class="rounded-2xl bg-indigo-950 p-6 text-white border border-slate-300 shadow-md flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Member Points
          </p>
          <p class="mt-3 text-3xl font-bold">
            {{ rewardPoints.toLocaleString() }}
          </p>
          <p class="mt-4 text-xs font-medium text-indigo-300">
            SabayStay Elite Tier
          </p>
        </div>
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-900/80 text-indigo-300 border border-indigo-700">
          <Award class="w-6 h-6" />
        </span>
      </div>
    </div>

    <!-- Travel Activity Overview Chart Section -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 sm:p-8 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-400 pb-5">
        <div>
          <div class="flex items-center gap-2">
            <TrendingUp class="w-5 h-5 text-indigo-600" />
            <h2 class="text-xl font-bold text-slate-900 tracking-tight">Travel Activity Overview</h2>
          </div>
          <p class="text-xs text-slate-500 mt-1 font-medium">Monthly reservation volume based on live Firebase collections</p>
        </div>
        <div class="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 w-fit flex items-center gap-2">
          <Calendar class="w-3.5 h-3.5 text-slate-400" />
          <span>Past 12 Months</span>
        </div>
      </div>

      <!-- Chart Visual Container -->
      <div class="relative h-64 w-full flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2">
        <!-- Background Grid Lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          <div class="border-b border-dashed border-slate-300 w-full text-[10px] text-slate-400 pl-1 font-semibold">100%</div>
          <div class="border-b border-dashed border-slate-300 w-full text-[10px] text-slate-400 pl-1 font-semibold">75%</div>
          <div class="border-b border-dashed border-slate-300 w-full text-[10px] text-slate-300 pl-1 font-semibold">50%</div>
          <div class="border-b border-dashed border-slate-300 w-full text-[10px] text-slate-400 pl-1 font-semibold">25%</div>
          <div class="border-b border-slate-300 w-full text-[10px] text-slate-400 pl-1 font-semibold">0%</div>
        </div>

        <!-- Dynamic Bars -->
        <template v-for="(m, index) in dynamicMonths" :key="m.key">
          <div class="relative z-10 flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
            <!-- Tooltip Popup -->
            <div class="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
              {{ monthlyData[m.key] || 0 }} booking(s)
            </div>

            <!-- Bar Fill -->
            <div 
              :style="{ height: `${Math.max(((monthlyData[m.key] || 0) / maxMonthlyBookings) * 100, 8)}%` }"
              :class="index % 2 === 0 ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-teal-500 hover:bg-teal-400'"
              class="w-full max-w-9 rounded-t-xl transition-all duration-500 shadow-sm"
            ></div>

            <!-- Month Label -->
            <span class="text-[11px] font-bold text-slate-500 mt-3">{{ m.label }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>