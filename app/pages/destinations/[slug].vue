<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "#app";
import { BedDouble, ArrowLeft, ArrowRight, MapPin, Compass, Sparkles, CheckCircle2 } from "lucide-vue-next";

const route = useRoute();
const selectedGuests = ref("2 adults, 0 children");

interface DestinationInfo {
  country: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
  highlights: string[];
}

const destinationDetails: Record<string, DestinationInfo> = {
  "koh-rong": {
    country: "Cambodia",
    name: "Koh Rong",
    tagline: "Turquoise waters, untouched sands, and vibrant island life.",
    description:
      "A serene tropical escape where turquoise waters meet pristine white sands, peaceful bays, and unhurried days.",
    image:
      "https://visitcambodia.b-cdn.net/city/koh-rong-sanloem-hero.jpg",
    accent: "Coastal escape",
    highlights: ["Bioluminescent plankton", "White sand beaches", "Island boat charters"],
  },
  "angkor-wat": {
    country: "Cambodia",
    name: "Angkor Wat",
    tagline: "Ancient calm, thoughtfully reimagined.",
    description:
      "Move between sacred temples, quiet forest shrines, and timeless streets where ancient heritage tells an unforgettable story.",
    image:
      "https://res.cloudinary.com/rainforest-cruises/images/c_fill,g_auto/f_auto,q_auto/v1617662182/Angkor-Wat/Angkor-Wat.jpg?_i=AA",
    accent: "Cultural escape",
    highlights: ["Sunrise over Angkor", "Private temple tours", "Khmer fine dining"],
  },
  "koh-sdach": {
    country: "Cambodia",
    name: "Koh Sdach",
    tagline: "Ultimate overwater serenity and quiet island days.",
    description:
      "Find pure stillness on the King Island archipelago with unspoiled marine life, fresh local seafood, and tranquil sea views.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85",
    accent: "Island escape",
    highlights: ["Archipelago cruising", "Coral reef snorkeling", "Local fishing villages"],
  },
  "song-saa": {
    country: "Cambodia",
    name: "Song Saa",
    tagline: "Eco-luxury amid vibrant biodiversity.",
    description:
      "A private sanctuary across twin islands blending sustainable luxury, overwater dining, and secluded coastal hideaways.",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1800&q=85",
    accent: "Eco-luxury escape",
    highlights: ["Private island villas", "Marine conservation tours", "Sunset spa rituals"],
  },
  "chiso-mountain": {
    country: "Cambodia",
    name: "Chiso Mountain",
    tagline: "High-altitude quiet and historical wonder.",
    description:
      "Climb to ancient hilltop sanctuaries overlooking emerald rice fields and dramatic horizons of Takeo province.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1800&q=85",
    accent: "Mountain escape",
    highlights: ["Historical temple stairs", "Panoramic valley vistas", "Countryside heritage"],
  },
  "amalfi-coast": {
    country: "Italy",
    name: "Amalfi Coast",
    tagline: "Where every view feels like a postcard.",
    description:
      "A sun-washed coastline of pastel villages, hidden coves, and long lunches overlooking the Mediterranean.",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=85",
    accent: "Coastal escape",
    highlights: ["Cliffside villages", "Mediterranean dining", "Private boat days"],
  },
  "the-maldives": {
    country: "South Asia",
    name: "The Maldives",
    tagline: "A private world, suspended over blue.",
    description:
      "Find stillness in an overwater retreat where warm seas, reef life, and unhurried days become the whole itinerary.",
    image:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1800&q=85",
    accent: "Island escape",
    highlights: ["Overwater villas", "House reef diving", "Sunset sailing"],
  },
  "costa-rica": {
    country: "Central America",
    name: "Costa Rica",
    tagline: "Wild beauty with a softer way to stay.",
    description:
      "Wake to rainforest birdsong, follow the coastline, and let the natural world set the pace of your escape.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1800&q=85",
    accent: "Nature escape",
    highlights: ["Rainforest trails", "Wildlife encounters", "Pacific beaches"],
  },
  "swiss-alps": {
    country: "Switzerland",
    name: "Swiss Alps",
    tagline: "High-altitude quiet, made luxurious.",
    description:
      "Trade the ordinary for crisp mountain air, snowy horizons, and retreats that make slowing down feel natural.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1800&q=85",
    accent: "Mountain escape",
    highlights: ["Alpine rail journeys", "Private ski guides", "Fireside evenings"],
  },
};

// Aliases for slug routing
const defaultDestination = destinationDetails["koh-rong"]!;
destinationDetails["khos-rong"] = defaultDestination;
destinationDetails["khos rong"] = defaultDestination;
destinationDetails["koh rong"] = defaultDestination;
destinationDetails["kyoto"] = destinationDetails["angkor-wat"]!;
destinationDetails["angkor wat"] = destinationDetails["angkor-wat"]!;
destinationDetails["khos-sdach"] = destinationDetails["koh-sdach"]!;
destinationDetails["khos sdach"] = destinationDetails["koh-sdach"]!;
destinationDetails["koh sdach"] = destinationDetails["koh-sdach"]!;
destinationDetails["khos-songsa"] = destinationDetails["song-saa"]!;
destinationDetails["khos songsa"] = destinationDetails["song-saa"]!;
destinationDetails["song saa"] = destinationDetails["song-saa"]!;
destinationDetails["chiso mountain"] = destinationDetails["chiso-mountain"]!;

const destination = computed<DestinationInfo>(() => {
  const rawSlug = String(route.params.slug || "").trim();
  const normalizedSlug = rawSlug.toLowerCase().replace(/\s+/g, "-");

  return (
    destinationDetails[normalizedSlug] ??
    destinationDetails[rawSlug.toLowerCase()] ??
    destinationDetails[rawSlug] ??
    defaultDestination
  );
});

const stays = [
  {
    name: "The Azure Retreat",
    detail: "Private villas · Ocean views",
    price: "$1,250",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=85",
    link: "/hotels/angkor-heritage-resort",
  },
  {
    name: "Emerald Canopy Resort",
    detail: "Jungle suites · Spa rituals",
    price: "$850",
    image:
      "https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=900&q=85",
    link: "/hotels/mondulkiri-forest-sanctuary",
  },
  {
    name: "Koh Rong Island Sanctuary",
    detail: "Overwater villas · Private beach",
    price: "$680",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
    link: "/hotels/koh-rong-island-resort",
  },
  {
    name: "Royal Mekong Villa",
    detail: "Heritage suites · River sunset",
    price: "$450",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
    link: "/hotels/royal-mekong-hotel",
  },
];
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <!-- Hero Section with Architectural Dark Overlay -->
    <section class="relative min-h-[75vh] w-full overflow-hidden flex items-end border-b border-white/10">
      <img
        :src="destination.image"
        :alt="destination.name"
        class="absolute inset-0 h-full w-full object-cover scale-105 transform transition-transform duration-1000 ease-out"
      />

      <!-- Dark Gradient and Glow Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_60%)]" />

      <div class="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <NuxtLink
            to="/destinations"
            class="group inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md transition-all duration-300 hover:bg-amber-500 hover:text-slate-950"
          >
            <ArrowLeft class="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>All Destinations</span>
          </NuxtLink>

          <div class="mt-6 flex items-center gap-3">
            <span class="h-px w-8 bg-amber-400"></span>
            <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-400">
              <MapPin class="h-3.5 w-3.5" />
              {{ destination.country }} &bull; {{ destination.accent }}
            </p>
          </div>

          <h1 class="mt-3 text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl">
            {{ destination.name }}
          </h1>

          <p class="mt-6 text-xl font-light leading-relaxed text-slate-300 sm:text-2xl">
            {{ destination.tagline }}
          </p>

          <p class="mt-4 max-w-2xl text-base text-slate-400 leading-relaxed font-normal">
            {{ destination.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content Layout -->
    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <section class="grid gap-8 lg:grid-cols-12 lg:items-start">
        
        <!-- Left Panel: Context Experience -->
        <div class="flex flex-col justify-between border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl lg:col-span-7 lg:p-12">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">The Experience</span>
            <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              A destination with its own rhythm.
            </h2>
            <p class="mt-6 text-base leading-relaxed text-slate-300 font-light">
              The best journeys leave room for discovery. Let your mornings unfold slowly, follow a local recommendation for lunch, and leave the afternoon open for whatever catches your eye.
            </p>
          </div>

          <div class="mt-10">
            <NuxtLink
              to="/experiences"
              class="group inline-flex items-center gap-3 border border-amber-500/30 bg-amber-500/10 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950"
            >
              <span>Explore Experiences</span>
              <ArrowRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </NuxtLink>
          </div>
        </div>

        <!-- Right Panel: Highlights & Quick Booking Card -->
        <div class="space-y-8 lg:col-span-5">
          <!-- Highlights Card -->
          <div class="border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl">
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Highlights</span>
            <ul class="mt-6 space-y-3">
              <li
                v-for="(highlight, index) in destination.highlights"
                :key="highlight"
                class="flex items-center gap-4 border border-white/5 bg-slate-950/60 p-3.5 transition-colors duration-300 hover:border-amber-500/40"
              >
                <span class="flex h-7 w-7 shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-400">
                  0{{ index + 1 }}
                </span>
                <span class="text-xs font-semibold text-slate-200">{{ highlight }}</span>
              </li>
            </ul>
          </div>

          <!-- Quick Reservation Sidebar Card -->
          <div class="border border-white/15 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
            <div class="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Price starting from
                </p>
                <p class="mt-1 text-3xl font-extrabold text-white">
                  $450
                  <span class="text-xs font-normal text-slate-400">/ night</span>
                </p>
              </div>
              <div class="flex h-10 w-10 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400">
                <BedDouble class="w-5 h-5" />
              </div>
            </div>

            <div class="mt-5 space-y-3">
              <div class="border border-white/10 bg-slate-950/80 p-3">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Check-in / Check-out
                </p>
                <p class="mt-1 text-xs font-semibold text-white">Select Travel Dates</p>
              </div>

              <div class="border border-white/10 bg-slate-950/80 p-3">
                <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guests</p>
                <p class="mt-1 text-xs font-semibold text-white">{{ selectedGuests }}</p>
              </div>
            </div>

            <NuxtLink
              to="/hotels"
              class="mt-6 flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
            >
              <span>Check Availability</span>
              <ArrowRight class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Accommodations Section -->
      <section class="mt-24">
        <div class="flex items-end justify-between border-b border-white/10 pb-6">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Accommodations</span>
            <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              A beautiful base for your journey
            </h2>
          </div>
          <NuxtLink
            to="/hotels"
            class="hidden text-xs font-bold uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300 sm:block"
          >
            View all stays &rarr;
          </NuxtLink>
        </div>

        <div class="mt-8 grid gap-8 md:grid-cols-2">
          <article
            v-for="stay in stays"
            :key="stay.name"
            class="group border border-white/10 bg-slate-900/60 transition-all duration-500 hover:border-amber-500/40"
          >
            <div class="flex flex-col h-full sm:flex-row">
              <div class="relative h-60 w-full overflow-hidden sm:h-auto sm:w-1/2">
                <img
                  :src="stay.image"
                  :alt="stay.name"
                  class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <div class="flex flex-col justify-between p-6 sm:w-1/2">
                <div>
                  <p class="text-xs font-medium text-slate-400">{{ stay.detail }}</p>
                  <h3 class="mt-2 text-xl font-bold text-white transition-colors group-hover:text-amber-400">
                    {{ stay.name }}
                  </h3>
                </div>

                <div class="mt-6 border-t border-white/10 pt-4">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-slate-500">From</p>
                  <p class="text-2xl font-extrabold text-white">
                    {{ stay.price }}
                    <span class="text-xs font-normal text-slate-400">/ night</span>
                  </p>
                  <NuxtLink
                    :to="stay.link"
                    class="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 transition-colors hover:text-amber-300"
                  >
                    <span>View Property</span> <ArrowRight class="h-3.5 w-3.5" />
                  </NuxtLink>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="relative mt-24 overflow-hidden border border-white/10 bg-slate-900/80 p-10 text-center text-white backdrop-blur-xl sm:p-16">
        <div class="absolute -bottom-24 -right-12 h-64 w-64 rounded-full border border-amber-500/10" aria-hidden="true" />
        <div class="relative z-10 mx-auto max-w-2xl">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Your Next Chapter</span>
          <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to see it for yourself?
          </h2>
          <p class="mt-4 text-sm font-light leading-relaxed text-slate-300">
            Browse our curated stays and start shaping a journey that feels entirely yours.
          </p>
          <NuxtLink
            to="/hotels"
            class="mt-8 inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
          >
            <span>Find a Stay</span>
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>