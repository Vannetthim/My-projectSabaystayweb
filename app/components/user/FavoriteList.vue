<script setup lang="ts">
import { useUserData } from '~/composables/user/useUserData'

const { favorites } = useUserData()
</script>

<template>
  <div class="space-y-4">
    <h3 class="font-serif font-bold text-slate-900 text-xl">Saved Accommodations</h3>
    
    <div v-if="favorites && favorites.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="item in favorites" 
        :key="item.id" 
        class="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 items-center shadow-sm"
      >
        <img :src="item.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300'" class="w-20 h-20 rounded-xl object-cover" />
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-slate-900 text-sm truncate">{{ item.title || item.name }}</h4>
          <p class="text-xs text-slate-400 mt-0.5">📍 {{ item.location }}</p>
          <span class="text-sm font-bold text-slate-900 mt-2 block">${{ item.price }} / night</span>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <p class="text-xs text-slate-400">No favorite places added yet.</p>
    </div>
  </div>
</template>
