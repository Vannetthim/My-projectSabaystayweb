<!-- <script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const showFooter = computed(
  () =>
    !route.path.startsWith("/dashboard") &&
    !["/auth/login", "/auth/register", "/auth/forgot-password"].includes(
      route.path,
    ),
);
const showNavbar = computed(
  () => !["/auth/login", "/auth/register"].includes(route.path),
);
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] text-[#1b2b41]">
    <SiteNavbar v-if="showNavbar" />

    <main>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </main>

    <SiteFooter v-if="showFooter" />
  </div>
</template>  -->
 
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>