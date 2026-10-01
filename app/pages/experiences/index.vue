<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowRight, Clock, Tag, MapPin, Sparkles } from "lucide-vue-next";

const experiences = [
  {
    id: 1,
    title: "Sunset Sailing",
    description:
      "Glide across calm turquoise water as the day turns gold. A private crew, chilled drinks, and the perfect view make this a moment to remember.",
    button: "Explore Sailing",
    type: "Water",
    location: "The Maldives",
    duration: "3 hours",
    price: "From $180",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    title: "Hidden Island Picnic",
    description:
      "Follow your host to a quiet shore known only to locals. Your basket of island flavors and a shaded table will be waiting by the sea.",
    button: "Discover the Picnic",
    type: "Nature",
    location: "Koh Rong, Cambodia",
    duration: "Half day",
    price: "From $145",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    title: "Jungle Wellness Ritual",
    description:
      "Begin with breathwork beneath the canopy, then settle into a locally inspired treatment designed to restore your natural rhythm.",
    button: "View the Ritual",
    type: "Wellness",
    location: "Ubud, Bali",
    duration: "2 hours",
    price: "From $120",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    title: "Dinner Under the Stars",
    description:
      "A private table, a tailored menu, and the night sky above. Our chefs bring the best of the destination to your own corner of paradise.",
    button: "Plan Your Dinner",
    type: "Dining",
    location: "Santorini, Greece",
    duration: "2.5 hours",
    price: "From $210",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
  },
];

const categories = ["All experiences", "Water", "Nature", "Wellness", "Dining"];
const activeCategory = ref("All experiences");

const visibleExperiences = computed(() =>
  activeCategory.value === "All experiences"
    ? experiences
    : experiences.filter(
        (experience) => experience.type === activeCategory.value,
      ),
);
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <div class="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      
      <!-- Hero Section -->
      <section class="relative overflow-hidden border border-white/10 bg-slate-500/60 backdrop-blur-xl">
        <div
          class="absolute inset-0 bg-cover bg-center opacity-30"
          style="background-image: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjb7Zv6aZI2LnoJ-bFzmjyIpBCmP8sa8FrIHx3azhMh8RAtHhm8NQSsf4&s=10');"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.12),transparent_70%)]" />

        <div class="relative z-10 px-6 py-20 text-center sm:px-12 md:py-28">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Curated moments, made personal
          </p>
          <h1 class="mt-4 text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Go beyond the getaway.
          </h1>
          <p class="mx-auto mt-6 max-w-3xl text-lg font-light leading-relaxed text-slate-300 md:text-xl">
            Discover the places, flavors, and quiet moments that make a stay stay
            with you long after you return home.
          </p>
        </div>
      </section>

      <!-- Category Filter Section -->
      <section class="mt-12">
        <div class="flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
              Find your moment
            </span>
            <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Experiences worth remembering
            </h2>
          </div>

          <!-- Glass Filter Tabs -->
          <nav class="flex gap-2 overflow-x-auto pb-1" aria-label="Experience categories">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              :class="[
                'whitespace-nowrap border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                activeCategory === category
                  ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'border-white/10 bg-slate-900/60 text-slate-400 backdrop-blur-md hover:border-amber-500/50 hover:text-white',
              ]"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </nav>
        </div>
      </section>

      <!-- Experience Cards Grid -->
      <section class="mt-10 grid gap-8 lg:grid-cols-2">
        <div
          v-for="item in visibleExperiences"
          :key="item.id"
          class="group border border-white/10 bg-slate-900/60 backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-2xl"
        >
          <div class="grid h-full gap-0 md:grid-cols-[0.9fr_1.1fr]">
            
            <!-- Image Container -->
            <div class="relative overflow-hidden min-h-[260px] md:min-h-full">
              <img
                :src="item.image"
                class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                :alt="item.title"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-slate-950/80" />
            </div>

            <!-- Content Area -->
            <div class="flex flex-col justify-between p-7">
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <span class="flex h-8 w-8 items-center justify-center border border-amber-500/30 bg-amber-500/10 font-mono text-xs font-bold text-amber-400">
                    {{ String(item.id).padStart(2, "0") }}
                  </span>
                  <span class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <MapPin class="h-3 w-3 text-amber-400" />
                    {{ item.location }}
                  </span>
                </div>

                <p class="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {{ item.type }}
                </p>

                <h3 class="mt-2 text-2xl font-bold text-white transition-colors group-hover:text-amber-400">
                  {{ item.title }}
                </h3>

                <p class="mt-3 text-xs leading-relaxed text-slate-300 font-light">
                  {{ item.description }}
                </p>
              </div>

              <div class="mt-6 border-t border-white/10 pt-4">
                <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4">
                  <span class="flex items-center gap-1">
                    <Clock class="h-3.5 w-3.5 text-amber-400" />
                    {{ item.duration }}
                  </span>
                  <span class="text-amber-400 font-bold">
                    {{ item.price }}
                  </span>
                </div>

                <NuxtLink
                  to="/contact"
                  class="group/btn inline-flex w-full items-center justify-between border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950"
                >
                  <span>{{ item.button }}</span>
                  <ArrowRight class="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </NuxtLink>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- Concierge Callout Section -->
      <section class="relative mt-20 overflow-hidden border border-white/10 bg-slate-900/80 p-10 text-center text-white backdrop-blur-xl md:px-12 md:py-16">
        <div class="absolute -bottom-24 -right-12 h-64 w-64 rounded-full border border-amber-500/10" aria-hidden="true" />
        <div class="relative z-10 mx-auto max-w-2xl">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">Make it yours</span>
          <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your perfect day starts with a conversation.
          </h2>
          <p class="mx-auto mt-4 max-w-xl text-xs font-light leading-relaxed text-slate-300 sm:text-sm">
            Tell our concierge what you are dreaming of, and we will create an
            experience around it.
          </p>
          <NuxtLink
            to="/contact"
            class="mt-8 inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500 px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
          >
            <span>Talk to our concierge</span>
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </section>

    </div>
  </div>
</template>