<script setup lang="ts">
import { computed, ref } from "vue";
import { Search, Compass, Sparkles, MapPin, ArrowRight, Filter } from "lucide-vue-next";

type Destination = {
  slug: string;
  country: string;
  name: string;
  description: string;
  image: string;
  region: string;
  season: string;
  metric: string;
};

const destinations: Destination[] = [
  {
    slug: "koh-rong",
    country: "Cambodia",
    name: "Koh Rong",
    description:
      "Dramatic coastline, pristine turquoise waters, and vibrant island life.",
    image:
      "https://visitcambodia.b-cdn.net/city/koh-rong-sanloem-hero.jpg",
    region: "Coastal",
    season: "Summer",
    metric: "24k travelers this year",
  },
  {
    slug: "angkor-wat",
    country: "Cambodia",
    name: "Angkor Wat",
    description: "Ancient temple complex and profound cultural heritage.",
    image:
      "https://res.cloudinary.com/rainforest-cruises/images/c_fill,g_auto/f_auto,q_auto/v1617662182/Angkor-Wat/Angkor-Wat.jpg?_i=AA",
    region: "Cultural",
    season: "Spring",
    metric: "98% guest love",
  },
  {
    slug: "koh-sdach",
    country: "Cambodia",
    name: "Koh Sdach",
    description: "Ultimate overwater serenity and quiet island days.",
    image:
      "https://ik.imagekit.io/tvlk/apr-asset/dgXfoyh24ryQLRcGq00cIdKHRmotrWLNlvG-TxlcLxGkiDwaUSggleJNPRgIHCX6/hotel/asset/20027582-eb5b23c6f1ac2447990e361083d364b6.jpeg?tr=q-80,c-at_max,w-740,h-500&_src=imagekit",
    region: "Coastal",
    season: "Winter",
    metric: "4.9 guest rating",
  },
  {
    slug: "song-saa",
    country: "Cambodia",
    name: "Song Saa",
    description: "Eco-luxury private islands amid vibrant biodiversity.",
    image:
      "https://media.cntravellerme.com/photos/6571f2bde3ac838218269ae3/16:9/w_2560,c_limit/Song-Saa-Private-Island__2018_Josejouland_Over-Water-Villa_Two-Bedroom_Pool_12.jpg",
    region: "Coastal",
    season: "Winter",
    metric: "Wild by nature",
  },
  {
    slug: "chiso-mountain",
    country: "Cambodia",
    name: "Chiso Mountain",
    description:
      "Panoramic vistas, historical temples, and exclusive retreats.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85",
    region: "Mountains",
    season: "Winter",
    metric: "Peak season",
  },
];

const regions = ["All Regions", "Coastal", "Cultural", "Mountains", "Tropical"];
const searchQuery = ref("");
const selectedRegion = ref("All Regions");
const selectedSeason = ref("Any Season");

const filteredDestinations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return destinations.filter((destination) => {
    const matchesRegion =
      selectedRegion.value === "All Regions" ||
      destination.region === selectedRegion.value;
    const matchesSeason =
      selectedSeason.value === "Any Season" ||
      destination.season === selectedSeason.value;
    const matchesQuery =
      !query ||
      `${destination.name} ${destination.country} ${destination.description}`
        .toLowerCase()
        .includes(query);
    return matchesRegion && matchesSeason && matchesQuery;
  });
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <!-- Hero Section -->
    <section class="relative min-h-[85vh] overflow-hidden border-b border-white/10 bg-slate-950 text-white flex items-center">
      <!-- Background Video -->
      <div class="absolute inset-0 z-0 h-full w-full overflow-hidden">
        <video
          autoplay
          loop
          muted
          playsinline
          class="h-full w-full object-cover scale-105"
        >
          <!-- High-reliability travel/resort background MP4 stream -->
          <source
            src="../../assets/css/videos/Video_destination.mp4"
            type="video/mp4"
          />
        </video>
        
        <!-- Dark Overlay Layer for Legibility & Luxury Contrast -->
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_60%)]" />
      </div>/destination-hero.mp4
      
      <div class="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
        <div class="max-w-3xl">
          <div class="animate-fade-in inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
            <Sparkles class="h-3.5 w-3.5 animate-pulse text-amber-300" />
            <span>Your world, beautifully considered</span>
          </div>
          
          <h1 class="animate-slide-up mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Discover the 
            <span class="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
              extraordinary
            </span>.
          </h1>
          
          <p class="animate-slide-up delay-100 mt-6 max-w-2xl text-base font-light leading-relaxed text-slate-300 sm:text-lg">
            Curated destinations, remarkable stays, and the kind of places that make you want to stay a little longer.
          </p>
        </div>

        <!-- Floating Search Bar -->
        <div class="animate-slide-up delay-200 mt-10 grid gap-3 border border-white/15 bg-slate-900/80 p-3 shadow-2xl backdrop-blur-xl md:grid-cols-[1.4fr_0.8fr_auto]">
          <label class="flex items-center gap-3 border border-white/10 bg-slate-950/80 px-4 py-3 transition-colors focus-within:border-amber-500/50">
            <Search class="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span class="sr-only">Search destinations</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search regions, cities, or islands..."
              class="w-full bg-transparent text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </label>

          <label class="flex items-center gap-3 border border-white/10 bg-slate-950/80 px-4 py-3 transition-colors focus-within:border-amber-500/50">
            <Filter class="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
            <span class="sr-only">Choose a season</span>
            <select
              v-model="selectedSeason"
              class="w-full bg-transparent text-xs text-white outline-none [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option>Any Season</option>
              <option>Spring</option>
              <option>Summer</option>
              <option>Winter</option>
            </select>
          </label>

          <button
            type="button"
            class="border border-amber-500/30 bg-amber-500 px-8 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
            @click="selectedRegion = 'All Regions'"
          >
            Explore
          </button>
        </div>
      </div>
    </section>

    <!-- Content Section -->
    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Choose your next chapter</span>
          <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Places that stay with you
          </h2>
        </div>
        <p class="max-w-sm text-xs font-medium text-slate-400 md:text-right">
          {{ filteredDestinations.length }} destination{{ filteredDestinations.length === 1 ? '' : 's' }} selected for your kind of escape.
        </p>
      </div>

      <!-- Region Filter Tabs -->
      <nav class="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Destination regions">
        <button
          v-for="region in regions"
          :key="region"
          type="button"
          :class="[
            'whitespace-nowrap border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300',
            selectedRegion === region
              ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-md shadow-amber-500/5'
              : 'border-white/10 bg-slate-900/60 text-slate-400 hover:border-white/20 hover:text-white',
          ]"
          @click="selectedRegion = region"
        >
          {{ region }}
        </button>
      </nav>

      <!-- Destination Cards Grid -->
      <div v-if="filteredDestinations.length" class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(destination, index) in filteredDestinations"
          :key="destination.slug"
          class="group relative overflow-hidden border border-white/10 bg-slate-900/60 shadow-xl transition-all duration-500 hover:border-amber-500/40 hover:-translate-y-1"
          :class="index === 0 ? 'md:col-span-2 lg:col-span-2' : ''"
        >
          <div
            class="relative h-80 overflow-hidden"
            :class="index === 0 ? 'lg:h-[420px]' : ''"
          >
            <img
              :src="destination.image"
              :alt="destination.name"
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div class="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
              <div class="flex items-end justify-between gap-3">
                <div>
                  <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
                    <MapPin class="h-3.5 w-3.5" />
                    <span>{{ destination.country }}</span>
                  </p>
                  <h3 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    {{ destination.name }}
                  </h3>
                </div>
                
                <span class="shrink-0 border border-white/20 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md">
                  {{ destination.metric }}
                </span>
              </div>

              <p class="mt-3 max-w-lg text-xs leading-relaxed text-slate-300 font-light">
                {{ destination.description }}
              </p>

              <NuxtLink
                :to="`/destinations/${destination.slug}`"
                class="mt-5 inline-flex items-center gap-2 border border-white/20 bg-slate-900/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-300 hover:border-amber-500/50 hover:bg-amber-500 hover:text-slate-950"
              >
                <span>Explore destination</span>
                <ArrowRight class="h-3.5 w-3.5" />
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-else class="mt-8 border border-white/10 bg-slate-900/60 p-12 text-center shadow-xl backdrop-blur-xl">
        <Compass class="mx-auto h-8 w-8 text-slate-600 mb-3" />
        <p class="text-sm font-bold text-white uppercase tracking-wider">No destinations found</p>
        <p class="mt-1 text-xs text-slate-400">Try adjusting your search query, season, or region filter.</p>
      </div>

      <!-- Concierge CTA Banner -->
      <section class="mt-16 flex flex-col gap-6 border border-amber-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Not sure where to begin?</span>
          <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Let your stay find its setting.
          </h2>
          <p class="mt-2 max-w-xl text-xs font-light leading-relaxed text-slate-300">
            Our concierge can match your mood, pace, and travel style with a destination made specifically for you.
          </p>
        </div>

        <NuxtLink
          to="/contact"
          class="inline-flex shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
        >
          Talk to a concierge
        </NuxtLink>
      </section>
    </main>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-100 {
  animation-delay: 0.15s;
}

.delay-200 {
  animation-delay: 0.3s;
}
</style>