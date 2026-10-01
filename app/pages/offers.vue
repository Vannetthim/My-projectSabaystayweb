<script setup lang="ts">
import { computed, ref } from "vue";
import { Check, ArrowRight, MapPin, Sparkles } from "lucide-vue-next";

type Offer = {
  id: string;
  category: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  location: string;
  price: string;
  originalPrice: string;
  saving: string;
  includes: string[];
  badge?: string;
};

const categories = ["All offers", "Stay longer", "Romance", "Wellness"];
const activeCategory = ref("All offers");

const offers: Offer[] = [
  {
    id: "island-escape",
    category: "Stay longer",
    eyebrow: "Stay 4 nights, pay for 3",
    title: "The Island Escape",
    description:
      "Give yourself an extra day of ocean air, slow mornings, and sunsets over the water.",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85",
    location: "The Azure Retreat · Maldives",
    price: "$3,750",
    originalPrice: "$5,000",
    saving: "Save 25%",
    includes: ["Daily breakfast", "Private airport transfer", "Resort credit"],
    badge: "Most popular",
  },
  {
    id: "sunset-for-two",
    category: "Romance",
    eyebrow: "A stay made for two",
    title: "Sunset for Two",
    description:
      "A thoughtful escape with a private dinner, champagne, and time to reconnect.",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85",
    location: "Cliffside Sanctuary · Santorini",
    price: "$2,250",
    originalPrice: "$2,800",
    saving: "Save 20%",
    includes: [
      "3 nights in an ocean suite",
      "Sunset dinner",
      "Couples massage",
    ],
  },
  {
    id: "restore-retreat",
    category: "Wellness",
    eyebrow: "Your reset starts here",
    title: "Restore Retreat",
    description:
      "Trade the busy pace for nourishing meals, restorative treatments, and quiet space.",
    image:
      "https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1200&q=85",
    location: "Emerald Canopy Resort · Bali",
    price: "$1,950",
    originalPrice: "$2,400",
    saving: "Save 18%",
    includes: [
      "4 nights in a jungle villa",
      "Daily wellness session",
      "Healthy breakfast",
    ],
  },
];

const visibleOffers = computed(() =>
  activeCategory.value === "All offers"
    ? offers
    : offers.filter((offer) => offer.category === activeCategory.value),
);
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <!-- Hero Header with Architectural Dark Background -->
    <header class="relative border-b border-white/5 bg-slate-500/60 overflow-hidden">
      <div 
        class="absolute inset-0 bg-cover bg-center opacity-30" 
        style="background-image: url('https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=2000&q=85');"
      />
      <!-- Overlay Gradients -->
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_70%)]" />

      <div class="relative z-10 mx-auto flex min-h-[480px] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <div class="flex max-w-3xl flex-col items-center">
          <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Limited-time escapes
          </p>
          <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Make more room for beautiful moments.
          </h1>
          <p class="mt-5 max-w-xl text-sm font-light leading-relaxed text-slate-300 sm:text-base">
            Enjoy more of the places you love with exclusive rates, thoughtful
            extras, and stays designed to linger in your memory.
          </p>
          <div class="mt-8 h-0.5 w-12 bg-amber-500"></div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <!-- Category Navigation Header -->
      <div class="flex flex-col gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
            Curated for you
          </span>
          <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
            Offers worth travelling for
          </h2>
        </div>

        <!-- Filter Buttons -->
        <nav class="flex gap-2 overflow-x-auto pb-1" aria-label="Offer categories">
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

      <!-- Offers Grid -->
      <div class="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="offer in visibleOffers"
          :key="offer.id"
          class="group flex flex-col overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-2xl"
        >
          <!-- Image Section with Badges -->
          <div class="relative aspect-[1.45] overflow-hidden">
            <img
              :src="offer.image"
              :alt="offer.title"
              class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
            />
            <span
              v-if="offer.badge"
              class="absolute left-4 top-4 border border-amber-500/30 bg-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-950 shadow-md"
            >
              {{ offer.badge }}
            </span>
            <span
              class="absolute bottom-4 right-4 border border-amber-500/30 bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400"
            >
              {{ offer.saving }}
            </span>
          </div>

          <!-- Card Content -->
          <div class="flex flex-1 flex-col p-6">
            <p class="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              {{ offer.eyebrow }}
            </p>
            <h3 class="mt-2 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-amber-400">
              {{ offer.title }}
            </h3>
            <p class="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <MapPin class="h-3 w-3 text-amber-400" />
              {{ offer.location }}
            </p>
            <p class="mt-4 text-xs font-light leading-relaxed text-slate-300">
              {{ offer.description }}
            </p>

            <!-- Includes List -->
            <div class="mt-6 border-t border-white/10 pt-4">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Your stay includes
              </p>
              <ul class="mt-3 space-y-2">
                <li
                  v-for="item in offer.includes"
                  :key="item"
                  class="flex items-center gap-2 text-xs text-slate-300"
                >
                  <Check class="h-3.5 w-3.5 text-amber-400" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <!-- Price & Link Footer -->
            <div class="mt-auto pt-6">
              <div class="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                <div>
                  <p class="text-[10px] text-slate-400 uppercase tracking-wider">
                    From
                    <span class="line-through text-slate-500">{{ offer.originalPrice }}</span>
                  </p>
                  <p class="mt-0.5 text-xl font-extrabold text-white">
                    {{ offer.price }}
                    <span class="text-[10px] font-normal text-slate-400">total</span>
                  </p>
                </div>
                <NuxtLink
                  :to="`/hotels/${offer.id === 'island-escape' ? 'azure-retreat' : offer.id === 'sunset-for-two' ? 'cliffside-sanctuary' : 'emerald-canopy'}`"
                  class="group/btn inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-400 transition-all duration-300 hover:bg-amber-500 hover:text-slate-950"
                >
                  <span>View stay</span>
                  <ArrowRight class="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Footer Newsletter / Extra Banner -->
      <section class="relative mt-20 overflow-hidden border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl md:p-12">
        <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
              A little extra
            </span>
            <h2 class="mt-2 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              Your next escape is closer than you think.
            </h2>
            <p class="mt-2 max-w-xl text-xs font-light leading-relaxed text-slate-300 sm:text-sm">
              Offers change with the season. Join our newsletter for first access
              to new stays and private member rates.
            </p>
          </div>
          <NuxtLink
            to="/contact"
            class="inline-flex shrink-0 items-center gap-2 border border-amber-500/30 bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
          >
            <span>Plan my stay</span>
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </section>
    </main>
  </div>
</template>