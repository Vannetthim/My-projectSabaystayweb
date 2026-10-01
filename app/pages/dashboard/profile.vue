<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAuth } from "~/composables/auth/useAuth";
import { definePageMeta } from "#imports";
import {
  Camera,
  User,
  Mail,
  Phone,
  Globe,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-vue-next";

definePageMeta({ layout: "user", middleware: "auth" });

const { user, updateUser } = useAuth();
const name = ref("");
const email = ref("");
const phone = ref("");
const country = ref("");
const saved = ref(false);
const photoPreview = ref<string>(
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
);
const isUploading = ref(false);

// Preset list of countries
const countries = [
  "Cambodia",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "China",
  "France",
  "Germany",
  "Hong Kong",
  "India",
  "Indonesia",
  "Japan",
  "Laos",
  "Malaysia",
  "Myanmar",
  "Philippines",
  "Singapore",
  "South Korea",
  "Vietnam",
];

onMounted(() => {
  const stored = JSON.parse(localStorage.getItem("sabaystay-user") || "null");
  name.value = stored?.name || user.value?.name || "";
  email.value = stored?.email || user.value?.email || "";
  phone.value = stored?.phone || "";
  country.value = stored?.country || "Cambodia";
  if (stored?.photo) {
    photoPreview.value = stored.photo;
  }
});

function onPhotoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  const reader = new FileReader();
  reader.onload = () => {
    photoPreview.value = String(reader.result);
    isUploading.value = false;
  };
  reader.onerror = () => {
    isUploading.value = false;
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const stored =
    JSON.parse(localStorage.getItem("sabaystay-user") || "null") || {};
  updateUser({
    ...stored,
    name: name.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    country: country.value.trim(),
    photo: photoPreview.value,
  });
  saved.value = true;
  window.setTimeout(() => (saved.value = false), 2500);
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 pb-12 font-sans text-slate-800">
    <div>
      <h1 class="font-serif text-3xl font-bold text-slate-900">My Profile</h1>
      <p class="mt-1 text-sm font-medium text-slate-500">
        Manage your personal information and preferences.
      </p>
    </div>

    <!-- Profile Photo Section -->
    <section class="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm md:p-8">
      <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div class="relative">
          <img
            :src="photoPreview"
            alt="Profile photo"
            class="h-28 w-28 rounded-full object-cover border border-slate-300 ring-4 ring-slate-100"
          />
          <label
            for="photo-upload"
            class="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#07166b] text-white shadow-md transition hover:bg-indigo-900 border border-indigo-900"
            title="Change photo"
          >
            <Camera class="h-4 w-4" />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onPhotoChange"
            />
          </label>
        </div>
        <div class="text-center sm:text-left">
          <h2 class="text-lg font-bold text-slate-900">Profile Photo</h2>
          <p class="mt-1 text-sm text-slate-500">
            JPG, PNG or GIF. Max 5MB.
          </p>
          <p v-if="isUploading" class="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#07166b] sm:justify-start">
            <Loader2 class="h-3.5 w-3.5 animate-spin" />
            Uploading...
          </p>
        </div>
      </div>
    </section>

    <!-- Personal Information Form Section -->
    <section class="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm md:p-8">
      <h2 class="text-lg font-bold text-slate-900">Personal Information</h2>
      
      <form class="mt-6 grid gap-5 sm:grid-cols-2" @submit.prevent="saveProfile">
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Full Name
          <div class="relative mt-2 flex items-center">
            <User class="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              v-model="name"
              required
              placeholder="e.g. John Doe"
              class="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm font-normal text-slate-800 outline-none transition focus:border-[#07166b] focus:bg-white focus:ring-1 focus:ring-[#07166b]"
            />
          </div>
        </label>

        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Email
          <div class="relative mt-2 flex items-center">
            <Mail class="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="e.g. johndoe@example.com"
              class="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm font-normal text-slate-800 outline-none transition focus:border-[#07166b] focus:bg-white focus:ring-1 focus:ring-[#07166b]"
            />
          </div>
        </label>

        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Phone
          <div class="relative mt-2 flex items-center">
            <Phone class="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              v-model="phone"
              type="tel"
              required
              placeholder="e.g. +855 12 345 678"
              class="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm font-normal text-slate-800 outline-none transition focus:border-[#07166b] focus:bg-white focus:ring-1 focus:ring-[#07166b]"
            />
          </div>
        </label>

        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Country
          <div class="relative mt-2 flex items-center">
            <Globe class="absolute left-3.5 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
            <select
              v-model="country"
              required
              class="h-11 w-full appearance-none rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-8 text-sm font-normal text-slate-800 outline-none transition focus:border-[#07166b] focus:bg-white focus:ring-1 focus:ring-[#07166b]"
            >
              <option value="" disabled>Select a country</option>
              <option v-for="c in countries" :key="c" :value="c">
                {{ c }}
              </option>
            </select>
          </div>
        </label>

        <div class="flex items-center gap-4 sm:col-span-2 mt-2">
          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-xl bg-[#07166b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-900 border border-indigo-900 cursor-pointer"
          >
            <Save class="h-4 w-4" />
            <span>Save Changes</span>
          </button>

          <span
            v-if="saved"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"
            role="status"
          >
            <CheckCircle2 class="h-4 w-4" />
            Profile saved successfully.
          </span>
        </div>
      </form>
    </section>
  </div>
</template>