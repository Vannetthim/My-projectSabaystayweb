<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useNuxtApp } from "#imports";
import { collection, getDocs, query, limit } from "firebase/firestore";

import {
  Calendar,
  Users,
  Star,
  Heart,
  MapPin,
  Minus,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
} from "lucide-vue-next";

// Interface Definitions
interface Hotel {
  id: string;
  name: string;
  location: string;
  amenities: string[];
  badge?: string;
  price: number;
  image: string;
  imageUrl?: string;
  rating: number;
}

const router = useRouter();

// State
const hotels = ref<Hotel[]>([]);
const isLoadingHotels = ref(true);

const checkIn = ref("2026-09-10");
const checkOut = ref("2026-09-13");
const adults = ref(2);
const children = ref(0);
const isGuestsOpen = ref(false);
const guestsRef = ref<HTMLElement | null>(null);
const bookingError = ref("");
const favorites = ref<string[]>([]);

// Fallback Data
const fallbackHotels: Hotel[] = [
  {
    id: "sabay-angkor",
    name: "Sabay Angkor Resort",
    location: "Siem Reap, Cambodia",
    amenities: ["Infinity Pool", "Spa & Wellness"],
    badge: "Premium",
    price: 180,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85",
    rating: 4.9,
  },
  {
    id: "royal-phnom-penh",
    name: "Royal Phnom Penh Hotel",
    location: "Phnom Penh, Cambodia",
    amenities: ["Rooftop Pool", "City View"],
    price: 120,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85",
    rating: 4.8,
  },
  {
    id: "kep-seaside-resort",
    name: "Kep Seaside Resort",
    location: "Kep, Cambodia",
    amenities: ["Sea View", "Private Pool"],
    badge: "Luxury",
    price: 150,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85",
    rating: 4.8,
  },
];

// Close guest dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (guestsRef.value && !guestsRef.value.contains(event.target as Node)) {
    isGuestsOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener("click", handleClickOutside);

  const { $db } = useNuxtApp();

  if (!$db) {
    hotels.value = fallbackHotels;
    isLoadingHotels.value = false;
    return;
  }

  try {
    const q = query(collection($db as any, "hotels"), limit(6));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      hotels.value = fallbackHotels;
    } else {
      const fetched: Hotel[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetched.push({
          id: doc.id,
          name: data.name || "Unnamed Hotel",
          location: data.location || data.address || "Cambodia",
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          badge: data.badge || undefined,
          price: Number(data.price) || 0,
          image:
            data.imageUrl ||
            data.heroImage ||
            data.image ||
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1000&q=85",
          rating: Number(data.rating) || 5.0,
        });
      });
      hotels.value = fetched;
    }
  } catch (err) {
    console.error("Firestore Fetch Error:", err);
    hotels.value = fallbackHotels;
  } finally {
    isLoadingHotels.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const guestsLabel = computed(() => {
  const adultText = `${adults.value} Adult${adults.value === 1 ? "" : "s"}`;
  const childText = `${children.value} Child${children.value === 1 ? "" : "ren"}`;
  return `${adultText}, ${childText}`;
});

function adjustGuests(type: "adult" | "child", delta: number) {
  if (type === "adult") {
    adults.value = Math.max(1, adults.value + delta);
    return;
  }
  children.value = Math.max(0, children.value + delta);
}

function checkAvailability() {
  if (!checkIn.value || !checkOut.value) {
    bookingError.value = "Please choose both dates.";
    return;
  }

  if (checkOut.value <= checkIn.value) {
    bookingError.value = "Check-out must be after check-in.";
    return;
  }

  bookingError.value = "";
  router.push({
    path: "/hotels",
    query: {
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      adults: adults.value,
      children: children.value,
    },
  });
}

function toggleFavorite(id: string) {
  favorites.value = favorites.value.includes(id)
    ? favorites.value.filter((favorite) => favorite !== id)
    : [...favorites.value, id];
}

const testimonials = [
  {
    name: "Jessica M.",
    location: "Miami, FL",
    text: "The most beautiful resort we've ever stayed at. The views, service, and attention to detail are absolutely perfect.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    name: "Michael T.",
    location: "Austin, TX",
    text: "From the oceanfront room to the amazing food, everything was beyond our expectations. Can't wait to come back!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
  },
  {
    name: "Sarah L.",
    location: "Chicago, IL",
    text: "A true paradise! The staff made our anniversary unforgettable. Everything exceeded our expectations.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80",
  },
];

const experiences = [
  {
    name: "Water Activities",
    description: "Snorkeling, kayaking, paddleboarding & more",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Romantic Dining",
    description: "Private dinners & unforgettable gastronomic experiences",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Spa & Wellness",
    description: "Signature treatments for mind, body & complete relaxation",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Explore & Discover",
    description: "Discover the island's charm, history & hidden gems",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
  },
];
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
    <!-- Hero Section -->
    <section class="relative min-h-[88vh] sm:min-h-[82vh] overflow-hidden flex items-center py-12 sm:py-20">
      <!-- Animated Background Zoom -->
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85"
          alt="Oceanfront luxury resort"
          class="h-full w-full object-cover opacity-60 scale-100 animate-kenburns transition-transform duration-1000"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 w-full">
        <div class="max-w-3xl">
          <!-- Tagline Badge -->
          <div class="inline-flex items-center gap-2 rounded-none bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400 backdrop-blur-md border border-amber-500/20 mb-4 sm:mb-6 animate-fade-in-down">
            <Sparkles class="h-3.5 w-3.5 shrink-0 animate-pulse" />
            <span>Luxury Hospitality & Resorts</span>
          </div>
          
          <!-- Title -->
          <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl leading-[1.12] animate-fade-in-up">
            Your Oceanfront <span class="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">Paradise</span> Awaits
          </h1>
          
          <p class="mt-4 sm:mt-6 max-w-2xl text-sm sm:text-lg lg:text-xl text-slate-300 font-light leading-relaxed animate-fade-in-up delay-100">
            Oceanfront luxury, world-class comfort, and unforgettable tailored experiences in the heart of paradise.
          </p>

          <!-- Floating Glassmorphic Search Container -->
          <div class="mt-8 sm:mt-10 rounded-none border border-white/10 bg-slate-900/80 p-3.5 sm:p-6 shadow-2xl backdrop-blur-xl animate-fade-in-up delay-200 hover:border-amber-500/30 transition-all duration-300">
            <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] items-center">
              
              <!-- Check In Input -->
              <label
                class="group flex items-center gap-3 rounded-none border border-white/10 bg-slate-950/60 p-3 sm:p-3.5 transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-950/90 focus-within:ring-1 focus-within:ring-amber-500/50 cursor-pointer"
                for="check-in"
              >
                <div class="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-none bg-amber-500/10 text-amber-400 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-slate-950">
                  <Calendar class="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span class="flex flex-col flex-1 min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check In</span>
                  <input
                    id="check-in"
                    v-model="checkIn"
                    type="date"
                    :max="checkOut || undefined"
                    class="w-full bg-transparent text-xs sm:text-sm font-semibold text-white outline-none cursor-pointer [color-scheme:dark]"
                    aria-label="Check-in date"
                  />
                </span>
              </label>

              <!-- Check Out Input -->
              <label
                class="group flex items-center gap-3 rounded-none border border-white/10 bg-slate-950/60 p-3 sm:p-3.5 transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-950/90 focus-within:ring-1 focus-within:ring-amber-500/50 cursor-pointer"
                for="check-out"
              >
                <div class="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-none bg-amber-500/10 text-amber-400 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-slate-950">
                  <Calendar class="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span class="flex flex-col flex-1 min-w-0">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Check Out</span>
                  <input
                    id="check-out"
                    v-model="checkOut"
                    type="date"
                    :min="checkIn || undefined"
                    class="w-full bg-transparent text-xs sm:text-sm font-semibold text-white outline-none cursor-pointer [color-scheme:dark]"
                    aria-label="Check-out date"
                  />
                </span>
              </label>

              <!-- Guest Dropdown -->
              <div ref="guestsRef" class="relative sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  class="group flex w-full items-center gap-3 rounded-none border border-white/10 bg-slate-950/60 p-3 sm:p-3.5 text-left transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-950/90"
                  @click="isGuestsOpen = !isGuestsOpen"
                >
                  <div class="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-none bg-amber-500/10 text-amber-400 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-slate-950">
                    <Users class="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <span class="flex flex-col flex-1 min-w-0">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guests</span>
                    <span class="truncate text-xs sm:text-sm font-semibold text-white">{{ guestsLabel }}</span>
                  </span>
                </button>

                <!-- Transition Animated Dropdown Card -->
                <transition
                  enter-active-class="transition duration-200 ease-out"
                  enter-from-class="transform scale-95 opacity-0 -translate-y-2"
                  enter-to-class="transform scale-100 opacity-100 translate-y-0"
                  leave-active-class="transition duration-150 ease-in"
                  leave-from-class="transform scale-100 opacity-100 translate-y-0"
                  leave-to-class="transform scale-95 opacity-0 -translate-y-2"
                >
                  <div
                    v-if="isGuestsOpen"
                    class="absolute left-0 right-0 top-full z-30 mt-2 sm:mt-3 rounded-none border border-white/10 bg-slate-900 p-4 sm:p-5 shadow-2xl backdrop-blur-xl"
                  >
                    <div class="flex items-center justify-between pb-2 border-b border-white/10 sm:hidden mb-2">
                      <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Select Guests</span>
                      <button type="button" @click="isGuestsOpen = false" class="p-1 text-slate-400 hover:text-white transition-colors">
                        <X class="h-4 w-4" />
                      </button>
                    </div>

                    <div class="flex items-center justify-between py-1.5">
                      <div>
                        <p class="text-sm font-semibold text-white">Adults</p>
                        <p class="text-xs text-slate-400">Ages 13+</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button
                          type="button"
                          class="flex h-8 w-8 items-center justify-center rounded-none border border-white/20 text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
                          :disabled="adults <= 1"
                          @click.stop="adjustGuests('adult', -1)"
                        >
                          <Minus class="h-3.5 w-3.5" />
                        </button>
                        <span class="w-4 text-center text-sm font-bold text-white">{{ adults }}</span>
                        <button
                          type="button"
                          class="flex h-8 w-8 items-center justify-center rounded-none border border-white/20 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                          @click.stop="adjustGuests('adult', 1)"
                        >
                          <Plus class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div class="my-2.5 border-t border-white/10" />

                    <div class="flex items-center justify-between py-1.5">
                      <div>
                        <p class="text-sm font-semibold text-white">Children</p>
                        <p class="text-xs text-slate-400">Ages 0 - 12</p>
                      </div>
                      <div class="flex items-center gap-3">
                        <button
                          type="button"
                          class="flex h-8 w-8 items-center justify-center rounded-none border border-white/20 text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30"
                          :disabled="children <= 0"
                          @click.stop="adjustGuests('child', -1)"
                        >
                          <Minus class="h-3.5 w-3.5" />
                        </button>
                        <span class="w-4 text-center text-sm font-bold text-white">{{ children }}</span>
                        <button
                          type="button"
                          class="flex h-8 w-8 items-center justify-center rounded-none border border-white/20 text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                          @click.stop="adjustGuests('child', 1)"
                        >
                          <Plus class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Submit Button -->
              <button
                type="button"
                class="sm:col-span-2 lg:col-span-1 h-12 sm:h-full min-h-[48px] sm:min-h-[52px] w-full rounded-none bg-gradient-to-r from-amber-500 to-amber-600 px-6 font-bold text-sm sm:text-base text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/40 active:scale-98"
                @click="checkAvailability"
              >
                Check Availability
              </button>
            </div>

            <p v-if="bookingError" class="mt-3 text-center text-xs font-medium text-rose-400 animate-shake" role="alert">
              {{ bookingError }}
            </p>
          </div>
        </div>
      </div>j
    </section>

    <!-- Accommodations Section -->
    <section class="py-14 sm:py-20 lg:py-28 bg-slate-950">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Accommodations</span>
            <h2 class="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Featured Hotels & Resorts</h2>
          </div>
          <NuxtLink
            to="/hotels"
            class="hidden md:inline-flex items-center gap-2 font-semibold text-amber-400 hover:text-amber-300 transition-colors duration-300 group text-sm"
          >
            <span>View All Accommodations</span>
            <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </NuxtLink>
        </div>

        <div v-if="isLoadingHotels" class="flex items-center justify-center py-16">
          <Loader2 class="h-8 w-8 animate-spin text-amber-500" />
        </div>

        <!-- Sharp Corner Hotel Cards -->
        <div v-else class="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="(hotel, index) in hotels"
            :key="hotel.id"
            class="group flex flex-col overflow-hidden rounded-none border border-white/10 bg-slate-900/90 transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 animate-fade-in-up"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <!-- Image Card Header -->
            <div class="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-800">
              <img
                :src="hotel.image"
                :alt="hotel.name"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />

              <span
                v-if="hotel.badge"
                class="absolute left-3.5 top-3.5 rounded-none bg-slate-950/90 px-2.5 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-md border border-amber-500/20 shadow-md uppercase tracking-wider"
              >
                {{ hotel.badge }}
              </span>

              <button
                type="button"
                aria-label="Toggle favorite"
                class="absolute right-3.5 top-3.5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-none bg-slate-950/80 text-slate-300 backdrop-blur-md transition-all duration-300 hover:bg-slate-900 hover:text-rose-400 active:scale-90"
                @click.stop="toggleFavorite(hotel.id)"
              >
                <Heart
                  class="h-4 w-4 transition-colors duration-300"
                  :class="favorites.includes(hotel.id) ? 'fill-rose-500 text-rose-500 animate-bounce-short' : ''"
                />
              </button>

              <div class="absolute bottom-3.5 right-3.5 flex items-center gap-1 rounded-none bg-slate-950/90 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10">
                <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span class="text-white">{{ hotel.rating.toFixed(1) }}</span>
              </div>
            </div>

            <!-- Card Body -->
            <div class="flex flex-1 flex-col p-5 sm:p-6">
              <h3 class="text-lg sm:text-xl font-bold leading-snug text-white transition-colors duration-300 group-hover:text-amber-400">
                {{ hotel.name }}
              </h3>

              <p class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <MapPin class="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                <span>{{ hotel.location }}</span>
              </p>

              <div class="mt-3.5 flex flex-wrap gap-1.5">
                <span
                  v-for="amenity in hotel.amenities"
                  :key="amenity"
                  class="rounded-none bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-300 transition-colors duration-300 group-hover:border-amber-500/20 group-hover:bg-amber-500/5"
                >
                  {{ amenity }}
                </span>
              </div>

              <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div>
                  <span class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-slate-400">Starting from</span>
                  <p class="text-xl sm:text-2xl font-extrabold text-white">
                    ${{ hotel.price.toLocaleString() }}
                    <span class="text-xs font-normal text-slate-400">/ night</span>
                  </p>
                </div>

                <NuxtLink
                  :to="`/hotels/${hotel.id}`"
                  class="inline-flex items-center gap-1.5 rounded-none bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs font-bold text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
                >
                  <span>Book Now</span>
                  <ArrowRight class="h-3.5 w-3.5" />
                </NuxtLink>
              </div>
            </div>
          </article>
        </div>

        <div class="mt-10 text-center md:hidden">
          <NuxtLink
            to="/hotels"
            class="inline-flex items-center justify-center gap-2 rounded-none border border-amber-500/30 bg-slate-900 px-6 py-3 text-sm font-bold text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950 w-full sm:w-auto"
          >
            <span>View All Accommodations</span>
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Experiences Section -->
    <section class="border-y border-white/10 bg-slate-900/50 py-14 sm:py-20 lg:py-28">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div class="mb-10 sm:mb-14 text-center">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Unforgettable Moments</span>
          <h2 class="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Experiences to Inspire</h2>
        </div>

        <!-- Sharp Corner Experience Cards -->
        <div class="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(exp, index) in experiences"
            :key="exp.name"
            class="group cursor-pointer animate-fade-in-up"
            :style="{ animationDelay: `${index * 120}ms` }"
          >
            <div class="relative mb-3 h-48 sm:h-64 overflow-hidden rounded-none bg-slate-800 border border-white/10 shadow-lg transition-all duration-500 group-hover:border-amber-500/40 group-hover:shadow-amber-500/10 group-hover:-translate-y-1.5">
              <img
                :src="exp.image"
                :alt="exp.name"
                class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-base sm:text-lg font-bold text-white leading-tight transition-colors duration-300 group-hover:text-amber-400">{{ exp.name }}</h3>
              </div>
            </div>
            <p class="text-xs sm:text-sm leading-relaxed text-slate-400 font-normal transition-colors duration-300 group-hover:text-slate-300">{{ exp.description }}</p>
          </div>
        </div>

        <div class="mt-10 sm:mt-14 text-center">
          <NuxtLink
            to="/experiences"
            class="inline-flex items-center gap-2 rounded-none bg-gradient-to-r from-amber-500 to-amber-600 px-6 sm:px-8 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/40 active:scale-95"
          >
            <span>View All Experiences</span>
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-14 sm:py-20 lg:py-28 bg-slate-950">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
        <div class="mb-10 sm:mb-14 text-center">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">What Our Guests Say</span>
          <h2 class="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Memories That Last a Lifetime</h2>
        </div>

        <!-- Sharp Corner Testimonial Cards -->
        <div class="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            class="flex flex-col justify-between rounded-none border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-sm transition-all duration-500 hover:border-amber-500/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-amber-500/5 animate-fade-in-up"
            :style="{ animationDelay: `${index * 150}ms` }"
          >
            <div>
              <span class="font-serif text-3xl sm:text-4xl text-amber-400 leading-none">“</span>
              <p class="mt-2.5 leading-relaxed text-slate-300 text-xs sm:text-sm italic">{{ testimonial.text }}</p>
            </div>
            <div class="mt-6 sm:mt-8 flex items-center gap-3.5 border-t border-white/10 pt-4 sm:pt-5">
              <img :src="testimonial.image" :alt="testimonial.name" class="h-10 w-10 sm:h-12 sm:w-12 rounded-none object-cover ring-1 ring-amber-500/40" />
              <div>
                <p class="font-bold text-white text-xs sm:text-sm">{{ testimonial.name }}</p>
                <p class="text-[11px] sm:text-xs text-slate-400">{{ testimonial.location }}</p>
                <div class="mt-1 flex gap-0.5">
                  <Star v-for="i in testimonial.rating" :key="i" class="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-amber-400 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call-To-Action Banner -->
    <section class="relative overflow-hidden py-16 sm:py-24 lg:py-32 bg-slate-900 border-t border-white/10">
      <div class="absolute inset-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80"
          alt="Tropical beach"
          class="h-full w-full object-cover animate-kenburns duration-1000"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />
      </div>

      <div class="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-12 text-center animate-fade-in-up">
        <h2 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">Plan Your Perfect Getaway</h2>
        <p class="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
          Book directly with us for exclusive rates, complimentary room upgrades & unforgettable memories.
        </p>
        <NuxtLink
          to="/hotels"
          class="mt-6 sm:mt-8 inline-block rounded-none bg-gradient-to-r from-amber-500 to-amber-600 px-8 sm:px-10 py-3.5 sm:py-4 font-bold text-sm sm:text-base text-slate-950 shadow-xl shadow-amber-500/20 transition-all duration-300 hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/40 active:scale-95"
        >
          Book Your Stay Now
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes kenburns {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounceShort {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.25);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-fade-in-down {
  animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.animate-kenburns {
  animation: kenburns 25s ease-in-out infinite alternate;
}

.animate-bounce-short {
  animation: bounceShort 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.delay-100 {
  animation-delay: 100ms;
}

.delay-200 {
  animation-delay: 200ms;
}
</style>