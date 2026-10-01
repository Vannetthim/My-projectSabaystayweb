<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface Country {
  name: string
  code: string // ISO 2-letter code used for Icons8 flags
  dialCode: string
}

const props = defineProps<{
  modelValue?: Country
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Country): void
}>()

const countries: Country[] = [
  { name: 'Cambodia', code: 'kh', dialCode: '+855' },
  { name: 'Japan', code: 'jp', dialCode: '+81' },
  { name: 'United States', code: 'us', dialCode: '+1' },
  { name: 'Vietnam', code: 'vn', dialCode: '+84' },
  { name: 'Italy', code: 'it', dialCode: '+39' }
]

const fallbackCountry: Country = {
  name: 'Cambodia',
  code: 'kh',
  dialCode: '+855'
}

const selectedCountry = ref<Country>(
  props.modelValue ?? countries[0] ?? fallbackCountry
)
const isOpen = ref(false)
const target = ref<HTMLElement | null>(null)

const handleOutsideClick = (event: MouseEvent) => {
  if (target.value && !target.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const selectCountry = (country: Country) => {
  selectedCountry.value = country
  emit('update:modelValue', country)
  isOpen.value = false
}

// Fallback for missing flag icons
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://img.icons8.com/flags/48/globe.png'
}
</script>

<template>
  <div ref="target" class="relative w-full text-left font-sans">
    <label class="block mb-1 text-sm font-medium text-slate-700">Country</label>

    <!-- Custom Select Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
      class="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
    >
      <div class="flex items-center gap-2.5">
        <!-- Icons8 Flag Image -->
        <img
          :src="`https://img.icons8.com/flags/48/${selectedCountry.code}.png`"
          :alt="selectedCountry.name"
          @error="handleImageError"
          class="w-6 h-6 object-contain"
        />
        <span class="text-sm font-medium text-slate-800">{{ selectedCountry.name }}</span>
        <span class="text-xs text-slate-400 font-mono">({{ selectedCountry.dialCode }})</span>
      </div>

      <!-- Arrow Icon -->
      <svg
        class="w-4 h-4 text-slate-500 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown List Overlay -->
    <div
      v-if="isOpen"
      class="absolute z-50 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl divide-y divide-slate-100"
    >
      <div
        v-for="country in countries"
        :key="country.code"
        @click="selectCountry(country)"
        class="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
        :class="{ 'bg-slate-100/80': selectedCountry.code === country.code }"
      >
        <!-- Icons8 Flag Image -->
        <img
          :src="`https://img.icons8.com/flags/48/${country.code}.png`"
          :alt="country.name"
          @error="handleImageError"
          class="w-5 h-5 object-contain"
        />
        <span class="text-sm text-slate-700 flex-1">{{ country.name }}</span>
        <span class="text-xs text-slate-400 font-mono">{{ country.dialCode }}</span>
      </div>
    </div>
  </div>
</template>