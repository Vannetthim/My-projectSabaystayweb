<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { collection, doc, onSnapshot, query, updateDoc, orderBy } from "firebase/firestore";
import { definePageMeta, useNuxtApp } from "#imports";

definePageMeta({ layout: "admin", middleware: "admin" });

const notifications = ref([]);
const loading = ref(true);
let unsubscribe = () => {};

const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length);

function formatTime(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "Just now";
}

const getDb = () => {
  const { $db } = useNuxtApp();
  return $db || null;
};

async function markRead(id) {
  const db = getDb();
  const notification = notifications.value.find((item) => item.id === id);
  if (notification && !notification.isRead && db) {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }
}

async function markAllRead() {
  await Promise.all(notifications.value.filter((item) => !item.isRead).map((item) => markRead(item.id)));
}

onMounted(() => {
  const db = getDb();
  if (!db) { 
    loading.value = false; 
    return; 
  }

  // Fetch all notifications in collection ordered by most recent date
  const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

  unsubscribe = onSnapshot(q, (snapshot) => {
    notifications.value = snapshot.docs.map((item) => {
      const data = item.data();
      return { 
        id: item.id, 
        title: String(data.title || "Notification"), 
        message: String(data.message || ""), 
        isRead: Boolean(data.isRead), 
        time: formatTime(data.createdAt) 
      };
    });
    loading.value = false;
  }, (error) => { 
    console.error("Error fetching notifications:", error);
    loading.value = false; 
  });
});

onUnmounted(() => unsubscribe());
</script>

<template>
  <section class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Notifications</h1>
        <p class="mt-1 text-sm text-slate-500">Notifications about bookings and system activities.</p>
      </div>
      <button 
        v-if="unreadCount" 
        type="button" 
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer" 
        @click="markAllRead"
      >
        Mark all as read
      </button>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <p v-if="loading" class="p-8 text-center text-sm text-slate-500">Loading notifications...</p>
      <p v-else-if="!notifications.length" class="p-8 text-center text-sm text-slate-500">No admin notifications yet.</p>
      
      <button 
        v-for="item in notifications" 
        :key="item.id" 
        type="button" 
        class="flex w-full items-start gap-4 border-b border-slate-100 p-5 text-left last:border-0 hover:bg-slate-50/80 transition-colors cursor-pointer" 
        :class="item.isRead ? 'bg-white' : 'bg-amber-50/50'" 
        @click="markRead(item.id)"
      >
        <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" :class="item.isRead ? 'bg-slate-300' : 'bg-amber-500'" />
        <span class="min-w-0 flex-1">
          <span class="block font-bold text-slate-900">{{ item.title }}</span>
          <span class="mt-1 block text-sm text-slate-600">{{ item.message }}</span>
          <span class="mt-2 block text-xs text-slate-400">{{ item.time }}</span>
        </span>
      </button>
    </div>
  </section>
</template>