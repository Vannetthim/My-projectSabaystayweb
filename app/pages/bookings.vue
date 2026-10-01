<script setup lang="ts">
import { definePageMeta, navigateTo } from '#imports'

definePageMeta({
  layout: 'user',
  middleware: 'auth'
})

navigateTo('/dashboard/bookings', { replace: true })
</script>

<template>
  <div class="min-h-screen bg-slate-50" />
</template>
