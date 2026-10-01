<script setup lang="ts">
import SiteNavbar from '~/components/SiteNavbar.vue';
import SiteFooter from '~/components/SiteFooter.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <SiteNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
