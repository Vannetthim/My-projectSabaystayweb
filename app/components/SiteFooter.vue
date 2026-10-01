<script setup lang="ts">
import { ref } from "vue";
import { Globe, MessageSquare, Instagram, Send, CheckCircle2 } from "lucide-vue-next";

const email = ref("");
const isSubscribed = ref(false);

function subscribe() {
  if (!email.value.trim()) return;

  isSubscribed.value = true;
  email.value = "";
}
</script>

<template>
  <footer
    class="relative overflow-hidden border-t border-white/10 bg-slate-950 px-4 py-12 text-slate-300 sm:px-6 md:py-16 lg:px-8"
  >
    <!-- Background Radial Accent -->
    <div
      class="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl"
    />

    <div class="relative z-10 mx-auto max-w-7xl">
      <div
        class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr] lg:gap-12"
      >
        <!-- Brand & Newsletter -->
        <div>
          <NuxtLink to="/" class="flex items-center gap-2">
            <span class="text-xl font-extrabold tracking-widest text-white uppercase sm:text-2xl">
              Sabay<span class="text-amber-400">Stay</span>
            </span>
          </NuxtLink>

          <p class="mt-4 max-w-sm text-xs font-light leading-relaxed text-slate-400">
            Curating extraordinary luxury stays and travel experiences. Discover serene escapes and meticulously crafted journeys designed for the discerning traveler.
          </p>

          <form class="mt-6" @submit.prevent="subscribe">
            <label
              for="footer-email"
              class="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              Subscribe to Private Offers
            </label>
            <div class="mt-2.5 flex max-w-sm">
              <input
                id="footer-email"
                v-model="email"
                type="email"
                required
                placeholder="Enter your email address"
                class="min-w-0 flex-1 border border-r-0 border-white/10 bg-slate-900/80 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                class="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500 px-5 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-amber-400 active:scale-95"
              >
                <span class="hidden sm:inline">Subscribe</span>
                <Send class="h-3.5 w-3.5" />
              </button>
            </div>
            <p
              v-if="isSubscribed"
              class="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-400"
              role="status"
            >
              <CheckCircle2 class="h-3.5 w-3.5" />
              <span>Thank you for subscribing to our newsletter.</span>
            </p>
          </form>
        </div>

        <!-- Navigation Columns -->
        <nav aria-label="Company" class="flex flex-col gap-3 text-xs font-light">
          <h2 class="text-xs font-bold uppercase tracking-widest text-white">
            Company
          </h2>
          <NuxtLink to="/" class="transition-colors hover:text-amber-400">Home</NuxtLink>
          <NuxtLink to="/about" class="transition-colors hover:text-amber-400">About Us</NuxtLink>
          <NuxtLink to="/services" class="transition-colors hover:text-amber-400">Services</NuxtLink>
          <NuxtLink to="/offers" class="transition-colors hover:text-amber-400">Exclusive Offers</NuxtLink>
          <a href="#" class="transition-colors hover:text-amber-400">Careers</a>
        </nav>

        <nav aria-label="Discovery" class="flex flex-col gap-3 text-xs font-light">
          <h2 class="text-xs font-bold uppercase tracking-widest text-white">
            Discovery
          </h2>
          <NuxtLink to="/hotels" class="transition-colors hover:text-amber-400">Hotels & Resorts</NuxtLink>
          <NuxtLink to="/destinations" class="transition-colors hover:text-amber-400">Destinations</NuxtLink>
          <NuxtLink to="/experiences" class="transition-colors hover:text-amber-400">Experiences</NuxtLink>
        </nav>

        <nav aria-label="Support" class="flex flex-col gap-3 text-xs font-light">
          <h2 class="text-xs font-bold uppercase tracking-widest text-white">
            Support
          </h2>
          <NuxtLink to="/contact" class="transition-colors hover:text-amber-400">Contact Concierge</NuxtLink>
          <NuxtLink to="/help" class="transition-colors hover:text-amber-400">FAQ</NuxtLink>
          <NuxtLink to="/help" class="transition-colors hover:text-amber-400">Help Center</NuxtLink>
        </nav>
      </div>

      <!-- Footer Bottom -->
      <div
        class="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs font-light text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© 2026 SabayStay Premium Travel. All rights reserved.</p>

        <nav aria-label="Legal navigation" class="flex gap-6">
          <NuxtLink to="/" class="transition-colors hover:text-amber-400">Sitemap</NuxtLink>
          <a href="#" class="transition-colors hover:text-amber-400">Privacy Policy</a>
          <a href="#" class="transition-colors hover:text-amber-400">Terms of Service</a>
        </nav>

        <!-- Social Icons -->
        <div class="flex gap-3" aria-label="Social links">
          <a
            href="#"
            aria-label="Website"
            title="Website"
            class="flex h-9 w-9 items-center justify-center border border-white/10 bg-slate-900/80 text-slate-400 transition-all hover:border-amber-500/50 hover:text-amber-400"
          >
            <Globe class="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="Message"
            title="Message"
            class="flex h-9 w-9 items-center justify-center border border-white/10 bg-slate-900/80 text-slate-400 transition-all hover:border-amber-500/50 hover:text-amber-400"
          >
            <MessageSquare class="h-4 w-4" />
          </a>
          <a
            href="#"
            aria-label="Instagram"
            title="Instagram"
            class="flex h-9 w-9 items-center justify-center border border-white/10 bg-slate-900/80 text-slate-400 transition-all hover:border-amber-500/50 hover:text-amber-400"
          >
            <Instagram class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>