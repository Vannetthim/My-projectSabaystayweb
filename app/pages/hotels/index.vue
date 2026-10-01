<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { collection, query, where, onSnapshot, type Firestore } from "firebase/firestore";
import { useNuxtApp } from "#imports";
import { useFavorites } from "~/composables/user/useFavorites";
import { Star, MapPin, Heart, ArrowRight, Loader2, Sparkles, Filter, RotateCcw } from "lucide-vue-next";

export interface UserHotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  badge?: string;
  amenities: string[];
}

const { isFavorite, toggleFavorite } = useFavorites();

const hotels = ref<UserHotel[]>([]);
const loading = ref(true);

const maxPrice = ref("");
const minPrice = ref("");
const minimumRating = ref(0);
const selectedAmenities = ref<string[]>([]);
const sortBy = ref("Recommended");

const amenitiesList = ["Infinity Pool", "Private Beach", "Spa & Wellness"];

let unsubscribe: (() => void) | null = null;

const fetchPublishedHotels = () => {
  const nuxtApp = useNuxtApp();
  const db = nuxtApp.$db as Firestore;
  if (!db) return;

  // Reads from top-level 'hotels' collection
  const q = query(collection(db, "hotels"), where("status", "==", "Published"));

  unsubscribe = onSnapshot(q, (snapshot) => {
    const fetched: UserHotel[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      fetched.push({
        id: doc.id,
        name: data.name || "",
        location: data.location || "",
        price: Number(data.price || 0),
        rating: Number(data.rating || 0),
        image: data.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
        badge: data.region || "",
        amenities: Array.isArray(data.amenities) ? data.amenities : []
      });
    });
    hotels.value = fetched;
    loading.value = false;
  });
};

onMounted(() => {
  fetchPublishedHotels();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const filteredHotels = computed(() => {
  const filtered = hotels.value.filter((hotel) => {
    const meetsPrice =
      (!minPrice.value || hotel.price >= Number(minPrice.value)) &&
      (!maxPrice.value || hotel.price <= Number(maxPrice.value));
    const meetsRating = hotel.rating >= minimumRating.value;
    const meetsAmenities = selectedAmenities.value.every((amenity) =>
      hotel.amenities.includes(amenity)
    );

    return meetsPrice && meetsRating && meetsAmenities;
  });

  if (sortBy.value === "Price: Low to High") return [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy.value === "Price: High to Low") return [...filtered].sort((a, b) => b.price - a.price);

  return filtered;
});

function toggleAmenity(amenity: string) {
  selectedAmenities.value = selectedAmenities.value.includes(amenity)
    ? selectedAmenities.value.filter((item) => item !== amenity)
    : [...selectedAmenities.value, amenity];
}

function handleFavorite(hotel: UserHotel) {
  toggleFavorite({
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    price: hotel.price,
    image: hotel.image,
    badge: hotel.badge,
    amenities: hotel.amenities,
  });
}

function resetFilters() {
  minPrice.value = "";
  maxPrice.value = "";
  minimumRating.value = 0;
  selectedAmenities.value = [];
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    
    <!-- Hero Banner Section -->
    <section class="relative overflow-hidden border-b border-white/10 py-16 sm:py-20">
      <div class="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=85"
          alt="Luxury Resorts"
          class="h-full w-full object-cover opacity-30 animate-kenburns"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      </div>

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="inline-flex items-center gap-2 rounded-none bg-amber-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400 backdrop-blur-md border border-amber-500/20 mb-4 animate-fade-in-down">
          <Sparkles class="h-3.5 w-3.5 shrink-0 animate-pulse" />
          <span>Exclusive Collection</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up">
          Curated Luxury <span class="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">Stays</span>
        </h1>
        <p class="mt-3 text-sm sm:text-base lg:text-lg text-slate-300 font-light max-w-2xl animate-fade-in-up delay-100">
          Discover our handcrafted selection of oceanfront resorts, private villas, and city escapes.
        </p>
      </div>
    </section>

    <!-- Main Content Container -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-8 lg:grid-cols-[260px_1fr]">
        
        <!-- Sidebar Filters -->
        <aside class="h-fit rounded-none border border-white/10 bg-slate-900/80 p-5 backdrop-blur-xl shadow-xl hover:border-amber-500/20 transition-all">
          <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <div class="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider">
              <Filter class="h-4 w-4 text-amber-400" />
              <span>Filters</span>
            </div>
            <button
              type="button"
              class="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition-colors"
              @click="resetFilters"
            >
              <RotateCcw class="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <!-- Price Range -->
          <fieldset class="mt-5">
            <legend class="text-xs font-bold uppercase tracking-wider text-slate-300">Price Range ($/Night)</legend>
            <div class="mt-2.5 flex items-center gap-2">
              <input
                v-model="minPrice"
                type="number"
                placeholder="Min"
                class="w-0 min-w-0 flex-1 rounded-none border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
              />
              <span class="text-xs text-slate-500">-</span>
              <input
                v-model="maxPrice"
                type="number"
                placeholder="Max"
                class="w-0 min-w-0 flex-1 rounded-none border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </fieldset>

          <!-- Rating -->
          <fieldset class="mt-6 border-t border-white/10 pt-5">
            <legend class="text-xs font-bold uppercase tracking-wider text-slate-300">Minimum Rating</legend>
            <div class="mt-2.5 space-y-2">
              <label
                v-for="rating in [5, 4]"
                :key="rating"
                class="flex cursor-pointer items-center justify-between rounded-none border border-white/5 bg-slate-950/40 p-2 text-xs font-medium text-slate-300 hover:border-amber-500/30 transition-all"
              >
                <span class="flex items-center gap-2">
                  <input
                    v-model="minimumRating"
                    type="radio"
                    :value="rating"
                    name="rating"
                    class="accent-amber-500"
                  />
                  <span>{{ rating }}+ Stars</span>
                </span>
                <div class="flex items-center gap-0.5 text-amber-400">
                  <Star v-for="i in rating" :key="i" class="h-3 w-3 fill-amber-400" />
                </div>
              </label>
            </div>
          </fieldset>

          <!-- Amenities -->
          <fieldset class="mt-6 border-t border-white/10 pt-5">
            <legend class="text-xs font-bold uppercase tracking-wider text-slate-300">Amenities</legend>
            <div class="mt-2.5 space-y-2">
              <label
                v-for="amenity in amenitiesList"
                :key="amenity"
                class="flex cursor-pointer items-center gap-2.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                <input
                  :checked="selectedAmenities.includes(amenity)"
                  type="checkbox"
                  class="rounded-none accent-amber-500 bg-slate-950 border-white/20"
                  @change="toggleAmenity(amenity)"
                />
                <span>{{ amenity }}</span>
              </label>
            </div>
          </fieldset>

          <button
            type="button"
            class="mt-6 w-full rounded-none border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950"
            @click="resetFilters"
          >
            Clear All Filters
          </button>
        </aside>

        <!-- Main Listing Grid -->
        <main>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/10">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-amber-400">Real-Time Listings</p>
              <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Showing {{ filteredHotels.length }} {{ filteredHotels.length === 1 ? 'property' : 'properties' }}
              </h2>
            </div>

            <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Sort by:</span>
              <select
                v-model="sortBy"
                class="rounded-none border border-white/10 bg-slate-900 px-3 py-2 text-xs font-bold text-white outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </label>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 class="h-8 w-8 animate-spin text-amber-500 mb-3" />
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading live hotel listings...</p>
          </div>

          <!-- Hotel Cards Grid -->
          <div v-else-if="filteredHotels.length" class="mt-6 grid gap-6 sm:grid-cols-2">
            <article
              v-for="(hotel, index) in filteredHotels"
              :key="hotel.id"
              class="group flex flex-col overflow-hidden rounded-none border border-white/10 bg-slate-900/90 transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 animate-fade-in-up"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <!-- Card Image Header -->
              <div class="relative aspect-[16/10] overflow-hidden bg-slate-800">
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
                  class="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-none bg-slate-950/80 text-slate-300 backdrop-blur-md transition-all duration-300 hover:bg-slate-900 hover:text-rose-400 active:scale-90"
                  @click.stop="handleFavorite(hotel)"
                >
                  <Heart
                    class="h-4 w-4 transition-colors duration-300"
                    :class="isFavorite(hotel.id) ? 'fill-rose-500 text-rose-500 animate-bounce-short' : ''"
                  />
                </button>

                <div class="absolute bottom-3.5 right-3.5 flex items-center gap-1 rounded-none bg-slate-950/90 px-2.5 py-1 text-xs font-bold text-amber-400 backdrop-blur-md border border-white/10">
                  <Star class="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span class="text-white">{{ hotel.rating.toFixed(1) }}</span>
                </div>
              </div>

              <!-- Card Body -->
              <div class="flex flex-1 flex-col p-5 sm:p-6">
                <h3 class="text-lg font-bold leading-snug text-white transition-colors duration-300 group-hover:text-amber-400">
                  {{ hotel.name }}
                </h3>

                <p class="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <MapPin class="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                  <span>{{ hotel.location }}</span>
                </p>

                <div v-if="hotel.amenities && hotel.amenities.length" class="mt-3.5 flex flex-wrap gap-1.5">
                  <span
                    v-for="amenity in hotel.amenities"
                    :key="amenity"
                    class="rounded-none bg-white/5 border border-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors duration-300 group-hover:border-amber-500/20 group-hover:bg-amber-500/5"
                  >
                    {{ amenity }}
                  </span>
                </div>

                <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <div>
                    <span class="text-[10px] font-medium uppercase tracking-wider text-slate-400">Starting from</span>
                    <p class="text-xl font-extrabold text-white">
                      ${{ hotel.price.toLocaleString() }}
                      <span class="text-xs font-normal text-slate-400">/ night</span>
                    </p>
                  </div>

                  <NuxtLink
                    :to="`/hotels/${hotel.id}`"
                    class="inline-flex items-center gap-1.5 rounded-none bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 text-xs font-bold text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
                  >
                    <span>Details</span>
                    <ArrowRight class="h-3.5 w-3.5" />
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div v-else class="mt-6 rounded-none border border-white/10 bg-slate-900/80 p-12 text-center backdrop-blur-xl shadow-xl">
            <p class="text-lg font-bold text-white">No stays match your filters.</p>
            <p class="mt-1 text-xs text-slate-400">Try adjusting your price range, ratings, or amenity filters.</p>
            <button
              type="button"
              class="mt-5 inline-block rounded-none bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 uppercase tracking-wider hover:bg-amber-400 transition-colors"
              @click="resetFilters"
            >
              Reset Filters
            </button>
          </div>
        </main>

      </div>
    </div>
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
</style>