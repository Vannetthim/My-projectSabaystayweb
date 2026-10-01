<script setup lang="ts">
import { Star, ShieldCheck, Crown, Code2, Terminal, Cpu } from "lucide-vue-next";
import BoraImage from "~/assets/css/image/developer.jpg";
import vannetImage from "~/assets/css/image/photo_2026-09-10_21-56-47.jpg";
import MakaraImage from "~/assets/css/image/ChatGPT Image Sep 11, 2026, 03_21_43 PM.png";

const differences = [
  {
    icon: Star,
    title: "Curated Excellence",
    description:
      "We hand-select only the top 1% of hotels globally, ensuring every property meets our rigorous standards for design, comfort, and service.",
  },
  {
    icon: ShieldCheck,
    title: "Personalized Concierge",
    description:
      "Enjoy 24/7 access to our dedicated travel experts, ready to tailor every aspect of your journey to your unique preferences.",
  },
  {
    icon: Crown,
    title: "Exclusive Access",
    description:
      "Unlock member-only benefits, complimentary upgrades, and bespoke experiences not available to the general public.",
  },
];

const developers = [
  {
    name: "PREK BORA",
    role: "Frontend Developer",
    badgeIcon: Code2,
    description:
      "Responsible for designing and developing the customer-facing side of SabayStay. Focuses on creating a modern, responsive, and user-friendly interface using Nuxt.js and Vue.js, including the Home, Hotels, Destinations, Experiences, Services, Offers, and Customer Dashboard pages.",
    image: BoraImage,
  },
  {
    name: "TIM VANNET",
    role: "Frontend Developer",
    badgeIcon: Terminal,
    description:
      "Responsible for developing the hotel management and booking features of SabayStay. Works on hotel and room management, room availability, booking processes, booking details, the hotel owner dashboard, and revenue-related features.",
    image: vannetImage,
  },
  {
    name: "MAKARA",
    role: "Backend Developer",
    badgeIcon: Cpu,
    description:
      "Responsible for backend services, authentication, database, and administration system. Manages Firebase Authentication, user roles, database structure, Admin Dashboard, security rules, user management, and system deployment.",
    image: MakaraImage,
  },
];
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <!-- Hero Banner -->
    <section class="relative flex min-h-[500px] items-center justify-center overflow-hidden border-b border-white/10 text-center">
      <img
        src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85"
        alt="Luxury tropical resort overlooking the sea"
        class="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_70%)]" />

      <div class="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <span class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
          Our Heritage
        </span>
        <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Elevating the Art of Travel
        </h1>
        <p class="mx-auto mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-300 sm:text-base">
          SabayStay was born from a passion for discovery and a commitment to
          unparalleled luxury. We believe that where you stay is as important as
          where you go.
        </p>
        <div class="mx-auto mt-8 h-0.5 w-12 bg-amber-500" />
      </div>
    </section>

    <!-- Mission Statement -->
    <section class="mx-auto max-w-4xl px-6 py-16 text-center sm:py-24">
      <span class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
        Purpose & Vision
      </span>
      <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        Our Mission
      </h2>
      <p class="mt-6 text-base font-light leading-relaxed text-slate-300 sm:text-lg">
        To connect discerning travelers with the world's most extraordinary
        stays, transforming ordinary trips into unforgettable, soul-enriching
        journeys. We meticulously curate every property, ensuring a seamless
        blend of striking design, impeccable service, and profound connection to
        the local environment. Our goal is to redefine luxury travel—making it
        highly personalized, deeply sustainable, and effortlessly refined.
      </p>
    </section>

    <!-- The SabayStay Difference -->
    <section class="border-y border-white/10 bg-slate-900/60 px-6 py-16 backdrop-blur-md sm:py-24">
      <div class="mx-auto max-w-6xl text-center">
        <span class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
          Unrivaled Standards
        </span>
        <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          The SabayStay Difference
        </h2>
        <p class="mt-2 text-sm font-light text-slate-400">What sets our curation apart.</p>

        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <article
            v-for="difference in differences"
            :key="difference.title"
            class="group border border-white/10 bg-slate-950/60 p-8 transition-all duration-500 hover:border-amber-500/40 hover:shadow-xl"
          >
            <div class="mx-auto flex h-12 w-12 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-colors duration-300 group-hover:bg-amber-500 group-hover:text-slate-950">
              <component :is="difference.icon" class="h-6 w-6" />
            </div>
            <h3 class="mt-6 text-xl font-bold text-white transition-colors group-hover:text-amber-400">
              {{ difference.title }}
            </h3>
            <p class="mt-3 text-xs font-light leading-relaxed text-slate-400">
              {{ difference.description }}
            </p>
          </article>
        </div>
      </div>
    </section>

    <!-- Developers Section -->
    <section class="px-6 py-16 sm:py-24">
      <div class="mx-auto max-w-6xl">
        <div class="text-center">
          <span class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            The Architects of SabayStay
          </span>
          <h2 class="mt-2 text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
            Meet Our Developers
          </h2>
          <p class="mx-auto mt-3 max-w-xl text-sm font-light text-slate-400">
            A small team with a shared belief that great technology should make
            beautiful travel feel effortless.
          </p>
        </div>

        <div class="mt-12 grid gap-8 md:grid-cols-3">
          <article
            v-for="developer in developers"
            :key="developer.name"
            class="group overflow-hidden border border-white/10 bg-slate-900/60 backdrop-blur-xl transition-all duration-500 hover:border-amber-500/40 hover:shadow-2xl"
          >
            <div class="relative aspect-square overflow-hidden bg-slate-950">
              <img
                :src="developer.image"
                :alt="developer.name"
                class="h-full w-full object-cover opacity-90 transition duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            </div>
            <div class="p-6">
              <div class="flex items-center gap-2">
                <component :is="developer.badgeIcon" class="h-3.5 w-3.5 text-amber-400" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  {{ developer.role }}
                </span>
              </div>
              <h3 class="mt-2 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-amber-400">
                {{ developer.name }}
              </h3>
              <p class="mt-3 text-xs font-light leading-relaxed text-slate-300">
                {{ developer.description }}
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-16 text-center text-white sm:py-20">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.1),transparent_70%)]" />
      <div class="relative z-10 mx-auto max-w-xl">
        <span class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
          Exclusive Membership
        </span>
        <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Join the Elite
        </h2>
        <p class="mt-4 text-sm font-light leading-relaxed text-slate-300">
          Elevate your travel experiences. Register for a SabayStay membership to
          access our curated collection and exclusive concierge services.
        </p>
        <NuxtLink
          to="/auth/register"
          class="mt-8 inline-flex items-center border border-amber-500/30 bg-amber-500 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
        >
          Register for Membership
        </NuxtLink>
      </div>
    </section>
  </div>
</template>