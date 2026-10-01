<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useAuth } from "~/composables/auth/useAuth";
import { useNuxtApp, definePageMeta } from "#imports";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  type Firestore 
} from "firebase/firestore";
import { Bell, Info, CheckCircle2 } from "lucide-vue-next";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: any;
}

definePageMeta({
  layout: "user",
  middleware: "auth",
});

const { $db } = useNuxtApp();
const db = $db as Firestore | undefined;
const { user } = useAuth();

const notifications = ref<NotificationItem[]>([]);
const isLoading = ref(true);
let stopListener: (() => void) | undefined;

const unreadCount = computed(() => 
  notifications.value.filter((n) => !n.isRead).length
);

async function markAsRead(id: string) {
  if (!db) return;
  try {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

async function markAllAsRead() {
  if (!db) return;
  const unreadItems = notifications.value.filter((n) => !n.isRead);
  for (const item of unreadItems) {
    await markAsRead(item.id);
  }
}

onMounted(() => {
  if (!db || !user.value?.id) {
    isLoading.value = false;
    return;
  }

  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", user.value.id)
  );

  stopListener = onSnapshot(
    q,
    (snapshot) => {
      notifications.value = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        title: String(docSnap.data().title || "Notification"),
        message: String(docSnap.data().message || ""),
        isRead: Boolean(docSnap.data().isRead),
        createdAt: docSnap.data().createdAt,
      }));
      isLoading.value = false;
    },
    (error) => {
      console.error("Firestore Notification Fetch Error:", error);
      isLoading.value = false;
    }
  );
});

onUnmounted(() => {
  stopListener?.();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-slate-200 pb-5">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Notifications</h1>
        <p class="text-sm text-slate-500">Manage and view all your updates and booking requests.</p>
      </div>

      <button
        v-if="unreadCount > 0"
        @click="markAllAsRead"
        class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <CheckCircle2 class="h-4 w-4 text-emerald-600" />
        <span>Mark all as read</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 text-center text-sm text-slate-400">
      Loading notifications...
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!notifications.length"
      class="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center"
    >
      <Bell class="mx-auto h-8 w-8 text-slate-300" />
      <p class="mt-2 text-sm font-semibold text-slate-700">No notifications found</p>
      <p class="text-xs text-slate-400">When you receive booking updates, they will appear here.</p>
    </div>

    <!-- Notification List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in notifications"
        :key="item.id"
        @click="markAsRead(item.id)"
        class="flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition"
        :class="
          !item.isRead
            ? 'border-amber-200 bg-amber-50/40'
            : 'border-slate-200 bg-white'
        "
      >
        <div class="flex items-start gap-3.5">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            :class="!item.isRead ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'"
          >
            <Info class="h-5 w-5" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-slate-900 text-sm">{{ item.title }}</h3>
              <span
                v-if="!item.isRead"
                class="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white"
              >
                New
              </span>
            </div>
            <p class="mt-1 text-xs text-slate-600 leading-relaxed">{{ item.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>