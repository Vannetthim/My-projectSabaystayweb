<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "~/composables/auth/useAuth";
import { navigateTo, useNuxtApp } from "#imports";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  updateDoc, 
  type Firestore 
} from "firebase/firestore";
import { 
  User, 
  LogOut, 
  Bell, 
  Info, 
  Menu, 
  X, 
  Home, 
  Building2, 
  Compass, 
  Sparkles, 
  Tag, 
  BookOpen, 
  PhoneCall 
} from "lucide-vue-next";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: any;
}

const route = useRoute();
const { $db } = useNuxtApp();
const db = $db as Firestore | undefined;
const { isLoggedIn, user, logout } = useAuth();

const isAccountMenuOpen = ref(false);
const isNotificationOpen = ref(false);
const isMobileMenuOpen = ref(false);
const notifications = ref<NotificationItem[]>([]);
const navbarRef = ref<HTMLElement | null>(null);

let stopNotificationListener: (() => void) | undefined;

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Hotels", path: "/hotels", icon: Building2 },
  { name: "Destinations", path: "/destinations", icon: Compass },
  { name: "Experiences", path: "/experiences", icon: Sparkles },
  { name: "Offers", path: "/offers", icon: Tag },
  { name: "About", path: "/about", icon: BookOpen },
  { name: "Contact", path: "/contact", icon: PhoneCall },
];

const userInitial = computed(() =>
  (user.value?.name?.trim().charAt(0) || "U").toUpperCase()
);

const unreadCount = computed(() => 
  notifications.value.filter((n) => !n.isRead).length
);

const isBookingConfirmation = computed(() =>
  route.path.startsWith("/dashboard/bookings/")
);

const isRegisterPage = computed(() => route.path === "/auth/register");
const isLoginPage = computed(() => route.path === "/auth/login");

const isActiveLink = (path: string) => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path === path || route.path.startsWith(path + "/");
};

function toggleNotificationMenu() {
  isNotificationOpen.value = !isNotificationOpen.value;
  if (isNotificationOpen.value) {
    isAccountMenuOpen.value = false;
  }
}

function toggleAccountMenu() {
  isAccountMenuOpen.value = !isAccountMenuOpen.value;
  if (isAccountMenuOpen.value) {
    isNotificationOpen.value = false;
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    isAccountMenuOpen.value = false;
    isNotificationOpen.value = false;
  }
}

function logoutUser() {
  logout();
  isAccountMenuOpen.value = false;
  isNotificationOpen.value = false;
  isMobileMenuOpen.value = false;
  navigateTo("/");
}

// Mark single notification as read in Firestore
async function markAsRead(id: string) {
  if (!db) return;
  try {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

// Close menus when clicking outside navbar
function handleClickOutside(event: MouseEvent) {
  if (navbarRef.value && !navbarRef.value.contains(event.target as Node)) {
    isNotificationOpen.value = false;
    isAccountMenuOpen.value = false;
  }
}

// Setup real-time notifications
function setupNotificationListener() {
  if (!db || !user.value?.id) return;

  stopNotificationListener?.();

  const q = query(
    collection(db, "notifications"),
    where("recipientId", "==", user.value.id)
  );

  stopNotificationListener = onSnapshot(q, (snapshot) => {
    notifications.value = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      title: String(docSnap.data().title || "Notification"),
      message: String(docSnap.data().message || ""),
      isRead: Boolean(docSnap.data().isRead),
      createdAt: docSnap.data().createdAt,
    }));
  });
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  setupNotificationListener();
});

watch(() => user.value?.id, () => {
  setupNotificationListener();
});

watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  stopNotificationListener?.();
});
</script>

<template>
  <nav
    v-if="!isBookingConfirmation && !isRegisterPage && !isLoginPage"
    ref="navbarRef"
    class="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300"
  >
    <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <span class="text-xl font-extrabold tracking-widest text-white uppercase sm:text-2xl">
          Sabay<span class="text-amber-400">Stay</span>
        </span>
      </NuxtLink>

      <!-- Desktop Navigation Links -->
      <div class="hidden items-center gap-1 lg:flex xl:gap-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="relative px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-300"
          :class="
            isActiveLink(item.path)
              ? 'text-amber-400 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-amber-400'
              : 'text-slate-300 hover:text-white'
          "
        >
          {{ item.name }}
        </NuxtLink>
      </div>

      <!-- Right Side Actions -->
      <div class="flex items-center gap-3 sm:gap-4">
        <!-- Authenticated Controls -->
        <template v-if="isLoggedIn">
          <!-- Notification Button with Dropdown -->
          <div class="relative">
            <button
              @click.stop="toggleNotificationMenu"
              class="relative border border-white/10 bg-slate-900/80 p-2.5 text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-400"
              aria-label="Notifications"
            >
              <Bell class="h-4 w-4" />
              <span
                v-if="unreadCount > 0"
                class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center border border-slate-950 bg-amber-500 text-[10px] font-bold text-slate-950"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <div
              v-if="isNotificationOpen"
              class="absolute right-0 z-50 mt-3 w-80 border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl sm:w-96"
            >
              <div class="flex items-center justify-between border-b border-white/10 pb-3">
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold uppercase tracking-widest text-white">Notifications</h3>
                  <span
                    v-if="unreadCount > 0"
                    class="border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400"
                  >
                    {{ unreadCount }} new
                  </span>
                </div>

                <NuxtLink
                  to="/dashboard/notifications"
                  @click="isNotificationOpen = false"
                  class="text-[10px] font-bold uppercase tracking-wider text-amber-400 hover:underline"
                >
                  View all
                </NuxtLink>
              </div>

              <!-- Notifications List -->
              <div class="mt-3 max-h-72 space-y-2 overflow-y-auto">
                <p v-if="!notifications.length" class="py-6 text-center text-xs font-light text-slate-400">
                  No notifications found.
                </p>

                <div
                  v-for="item in notifications.slice(0, 5)"
                  :key="item.id"
                  @click="markAsRead(item.id)"
                  class="group flex cursor-pointer items-start gap-3 border border-transparent p-2.5 text-xs transition-colors hover:border-white/10 hover:bg-slate-800/50"
                  :class="!item.isRead ? 'bg-amber-500/5' : ''"
                >
                  <Info class="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div class="flex-1">
                    <p class="font-bold text-white">{{ item.title }}</p>
                    <p class="mt-0.5 line-clamp-2 text-xs font-light text-slate-300">{{ item.message }}</p>
                  </div>
                  <span
                    v-if="!item.isRead"
                    class="mt-1 h-2 w-2 shrink-0 bg-amber-400"
                    title="Unread"
                  ></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Dropdown -->
          <div class="relative">
            <button
              @click.stop="toggleAccountMenu"
              class="flex items-center gap-2 border border-white/10 bg-slate-900/80 px-3 py-1.5 transition-all hover:border-amber-500/50"
            >
              <span class="flex h-7 w-7 items-center justify-center border border-amber-500/30 bg-amber-500/20 text-xs font-bold text-amber-400">
                {{ userInitial }}
              </span>

              <span class="hidden text-xs font-bold uppercase tracking-wider text-slate-200 sm:inline">
                {{ user?.name || "Account" }}
              </span>
            </button>

            <!-- Account Menu Dropdown -->
            <div
              v-if="isAccountMenuOpen"
              class="absolute right-0 z-50 mt-3 w-48 border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl"
            >
              <NuxtLink
                to="/dashboard"
                @click="isAccountMenuOpen = false"
                class="flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:bg-slate-800 hover:text-amber-400"
              >
                <User class="h-4 w-4 text-amber-400" />
                <span>Profile</span>
              </NuxtLink>

              <button
                @click="logoutUser"
                class="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-rose-400 transition hover:bg-rose-500/10"
              >
                <LogOut class="h-4 w-4 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </template>

        <!-- Guest Links -->
        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 transition-colors hover:text-amber-400"
          >
            Login
          </NuxtLink>

          <NuxtLink
            to="/auth/register"
            class="hidden border border-amber-500/30 bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-amber-400 sm:inline-flex"
          >
            Register
          </NuxtLink>
        </template>

        <!-- Mobile Menu Toggle Button -->
        <button
          @click="toggleMobileMenu"
          class="border border-white/10 bg-slate-900/80 p-2.5 text-slate-300 transition-colors hover:text-amber-400 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <X v-if="isMobileMenuOpen" class="h-5 w-5" />
          <Menu v-else class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="border-b border-white/10 bg-slate-950/95 px-6 py-6 backdrop-blur-2xl lg:hidden"
    >
      <div class="flex flex-col gap-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 border-l-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all"
          :class="
            isActiveLink(item.path)
              ? 'border-amber-400 bg-amber-500/10 text-amber-400'
              : 'border-transparent text-slate-300 hover:border-slate-700 hover:text-white'
          "
        >
          <component :is="item.icon" class="h-4 w-4 text-amber-400" />
          <span>{{ item.name }}</span>
        </NuxtLink>

        <!-- Guest Register CTA on Mobile -->
        <div v-if="!isLoggedIn" class="mt-4 pt-4 border-t border-white/10">
          <NuxtLink
            to="/auth/register"
            class="flex w-full items-center justify-center border border-amber-500/30 bg-amber-500 py-3 text-xs font-bold uppercase tracking-widest text-slate-950"
          >
            Register
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>