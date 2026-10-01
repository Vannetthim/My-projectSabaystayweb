<script setup lang="ts">
import { definePageMeta } from '#imports'

import { computed } from "vue";
import { useFavorites } from "~/composables/user/useFavorites";

definePageMeta({ layout: "user", middleware: "auth" });

const { favorites, removeFavorite } = useFavorites();

const favoriteHotels = computed(() =>
  favorites.value.map((hotel) => ({
    id: hotel.id,
    name: hotel.name,
    location: hotel.location,
    price: `$${hotel.price.toLocaleString()} / night`,
    icon: hotel.badge ? "⭐" : "🌴",
    image: hotel.image,
  })),
);
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-800 font-sans">
    <div>
      <h1 class="text-3xl font-serif font-bold text-slate-900">Favorites</h1>
      <p class="mt-1 text-sm text-slate-500 font-medium">
        Your saved stays for future journeys.
      </p>
    </div>
    
    <div v-if="favoriteHotels.length" class="grid gap-4 md:grid-cols-2">
      <article
        v-for="item in favoriteHotels"
        :key="item.id"
        class="flex items-center gap-4 rounded-2xl border border-slate-300 bg-white p-5 shadow-sm"
      >
        <img
          :src="item.image"
          :alt="item.name"
          class="h-16 w-16 rounded-xl object-cover border border-slate-300"
        />
        <div class="min-w-0 flex-1">
          <h2 class="font-bold text-slate-900">{{ item.name }}</h2>
          <p class="mt-1 text-sm text-slate-500 font-medium">{{ item.location }}</p>
          <p class="mt-2 text-sm font-semibold text-indigo-900">
            {{ item.price }}
          </p>
        </div>
        <button
          type="button"
          class="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors"
          @click="removeFavorite(item.id)"
        >
          Remove
        </button>
      </article>
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500 font-medium shadow-sm"
    >
      No saved stays yet.
    </div>
  </div>
</template>