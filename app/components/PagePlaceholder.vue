<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>
<template>
  <section class="mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-[#087d72]">SabayStay </p>
    <h1 class="sabay-display mt-4 text-5xl font-black tracking-[-0.05em] text-[#1d2f52] md:text-7xl" >
      {{ title }}
    </h1>
    <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#52627c]">
      {{ description }}
    </p>
  </section>
</template>
