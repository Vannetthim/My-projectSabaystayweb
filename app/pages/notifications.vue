<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { definePageMeta, useNuxtApp } from "#imports";
import { useAuth } from "~/composables/auth/useAuth";

definePageMeta({ middleware: "auth" });

type NotificationType = "booking" | "system" | "promo";
type NotificationFilter = "all" | NotificationType;

interface UserNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: NotificationType;
  isRead: boolean;
}

const filters: NotificationFilter[] = ["all", "booking", "promo", "system"];

const { user } = useAuth();
const { $db } = useNuxtApp() as any;
const notifications = ref<UserNotification[]>([]);
const loading = ref(true);
let unsubscribe = () => {};

const selectedNotification = ref<UserNotification | null>(null);
const activeFilter = ref<NotificationFilter>("all");

const filteredNotifications = computed(() => {
  if (activeFilter.value === "all") {
    return notifications.value;
  }

  return notifications.value.filter(
    (notification) => notification.type === activeFilter.value,
  );
});

const unreadCount = computed(
  () => notifications.value.filter((item) => !item.isRead).length,
);

const bookingCount = computed(
  () => notifications.value.filter((item) => item.type === "booking").length,
);

const promoCount = computed(
  () => notifications.value.filter((item) => item.type === "promo").length,
);

const typeMeta = {
  booking: {
    icon: "🏨",
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    title: "Stay",
  },
  promo: {
    icon: "🎁",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-200",
    title: "Offer",
  },
  system: {
    icon: "⚙️",
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    title: "Update",
  },
} as const;

const markAsRead = async (id: string) => {
  const item = notifications.value.find(
    (notification) => notification.id === id,
  );

  if (item && !item.isRead && $db) await updateDoc(doc($db, "notifications", id), { isRead: true });
};

const markAllAsRead = async () => {
  if (!$db) return;
  await Promise.all(notifications.value.filter((item) => !item.isRead).map((item) => updateDoc(doc($db, "notifications", item.id), { isRead: true })));
};

const removeNotification = async (id: string) => {
  if (!$db) return;
  await deleteDoc(doc($db, "notifications", id));

  if (selectedNotification.value?.id === id) {
    selectedNotification.value = null;
  }
};

const openNotification = async (item: UserNotification) => {
  selectedNotification.value = item;
  await markAsRead(item.id);
};

function notificationTime(value: any): string {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : "Just now";
}

onMounted(() => {
  if (!$db || !user.value?.id) {
    loading.value = false;
    return;
  }
  unsubscribe = onSnapshot(query(collection($db, "notifications"), where("recipientId", "==", user.value.id)), (snapshot) => {
    notifications.value = snapshot.docs.map((item) => {
      const data = item.data();
      return { id: item.id, title: String(data.title || "Notification"), message: String(data.message || ""), time: notificationTime(data.createdAt), type: ["booking", "promo", "system"].includes(data.type) ? data.type : "system", isRead: Boolean(data.isRead) } as UserNotification;
    });
    loading.value = false;
  }, () => { loading.value = false; });
});

onUnmounted(() => unsubscribe());
</script>

<template>
  <main class="min-h-screen bg-[#f5f3ef] px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">
      <div
        class="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm"
      >
        <header
          class="flex flex-col gap-5 border-b border-slate-200/80 px-5 py-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
            >
              Inbox
            </p>
            <div class="mt-3 flex items-center gap-3">
              <h1 class="text-3xl font-bold text-slate-900">Notifications</h1>
              <span
                v-if="unreadCount"
                class="rounded-full bg-[#edf2ff] px-2.5 py-1 text-xs font-semibold text-[#1e3a8a]"
              >
                {{ unreadCount }} new
              </span>
            </div>
          </div>

          <button
            v-if="unreadCount"
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            @click="markAllAsRead"
          >
            Mark all as read
          </button>
        </header>

        <section
          class="grid gap-4 border-b border-slate-200/80 bg-slate-50/80 p-5 sm:grid-cols-3 sm:px-8"
        >
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <p
              class="text-xs font-medium uppercase tracking-[0.2em] text-slate-500"
            >
              Total
            </p>
            <p class="mt-3 text-2xl font-bold text-slate-900">
              {{ notifications.length }}
            </p>
          </div>
          <div class="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p
              class="text-xs font-medium uppercase tracking-[0.2em] text-indigo-600"
            >
              Unread
            </p>
            <p class="mt-3 text-2xl font-bold text-indigo-900">
              {{ unreadCount }}
            </p>
          </div>
          <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p
              class="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700"
            >
              Bookings
            </p>
            <p class="mt-3 text-2xl font-bold text-emerald-900">
              {{ bookingCount }}
            </p>
          </div>
        </section>

        <div class="flex flex-wrap gap-2 px-5 py-5 sm:px-8">
          <button
            v-for="filter in filters"
            :key="filter"
            type="button"
            class="rounded-full px-3.5 py-2 text-sm font-medium transition"
            :class="
              activeFilter === filter
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            "
            @click="activeFilter = filter"
          >
            {{ filter === "all" ? "All" : typeMeta[filter].title }}
          </button>
        </div>

        <div class="space-y-3 px-5 pb-8 sm:px-8">
          <p v-if="loading" class="py-8 text-center text-sm text-slate-500">Loading notifications...</p>
          <article
            v-for="item in filteredNotifications"
            :key="item.id"
            class="group flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            :class="
              item.isRead
                ? 'border-slate-200 bg-white'
                : 'border-indigo-100 bg-indigo-50/40'
            "
          >
            <div class="flex min-w-0 flex-1 items-start gap-3.5">
              <div
                class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg shadow-inner"
                :class="typeMeta[item.type].badge"
              >
                {{ typeMeta[item.type].icon }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="truncate text-base font-bold text-slate-900">
                    {{ item.title }}
                  </h2>
                  <span
                    v-if="!item.isRead"
                    class="inline-block h-2.5 w-2.5 rounded-full bg-indigo-600"
                  />
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ring-1"
                    :class="typeMeta[item.type].badge"
                  >
                    {{ typeMeta[item.type].title }}
                  </span>
                </div>

                <p class="mt-2 text-sm leading-6 text-slate-600">
                  {{ item.message }}
                </p>

                <div
                  class="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500"
                >
                  <span>{{ item.time }}</span>
                  <button
                    type="button"
                    class="font-semibold text-indigo-700 underline-offset-2 transition hover:text-indigo-900 hover:underline"
                    @click="openNotification(item)"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Remove notification"
              @click="removeNotification(item.id)"
            >
              ✕
            </button>
          </article>

          <div
            v-if="!filteredNotifications.length"
            class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center"
          >
            <p class="text-base font-semibold text-slate-700">
              No notifications
            </p>
            <p class="mt-2 text-sm text-slate-500">
              You're all caught up for this category.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedNotification"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-5"
      @click.self="selectedNotification = null"
    >
      <section
        class="w-full max-w-lg rounded-t-[28px] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:rounded-[28px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-detail-title"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-700"
            >
              Notification details
            </p>
            <h2
              id="notification-detail-title"
              class="mt-2 text-2xl font-bold text-slate-900"
            >
              {{ selectedNotification.title }}
            </h2>
          </div>

          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-xl leading-none text-slate-500 transition hover:bg-slate-200"
            aria-label="Close notification details"
            @click="selectedNotification = null"
          >
            ×
          </button>
        </div>

        <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-sm leading-7 text-slate-700">
            {{ selectedNotification.message }}
          </p>
        </div>

        <div
          class="mt-5 flex items-center justify-between border-t border-slate-200 pt-4"
        >
          <div>
            <p class="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Sent
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-700">
              {{ selectedNotification.time }}
            </p>
          </div>

          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 bg-emerald-50"
          >
            {{ selectedNotification.isRead ? "Read" : "Unread" }}
          </span>
        </div>
      </section>
    </div>
  </main>
</template>
