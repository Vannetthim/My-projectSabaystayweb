<script setup lang="ts">
import { ref } from "vue";
import { useAuth } from "~/composables/auth/useAuth";
import { navigateTo } from "#imports";
import { User, Mail, KeyRound, Eye, EyeOff, ArrowRight, ChevronDown } from "lucide-vue-next";

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const role = ref("user");
const acceptedTerms = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const { register: createAccount } = useAuth();

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

async function register() {
  if (!fullName.value.trim() || !email.value.trim() || !password.value) {
    errorMessage.value = "Please complete all required fields.";
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  if (!acceptedTerms.value) {
    errorMessage.value = "Please agree to the terms and conditions.";
    return;
  }

  try {
    errorMessage.value = "";
    await createAccount({
      name: fullName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      role: role.value
    });
    
    successMessage.value = "Account request submitted successfully! Please wait for approval.";
    setTimeout(() => {
      navigateTo('/auth/login');
    }, 2000);
  } catch (error: any) {
    errorMessage.value =
      error?.code === "auth/email-already-in-use"
        ? "An account already exists for this email."
        : "Unable to create your account. Please try again.";
  }
}
</script>

<template>
  <div class="grid min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950 lg:grid-cols-2">
    <!-- Left Side: Image/Brand Hero -->
    <section
      class="relative hidden min-h-screen overflow-hidden bg-slate-900 lg:block"
      aria-label="SabayStay travel inspiration"
    >
      <img
        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop"
        alt="Luxury resort surrounded by tropical ocean and umbrellas"
        class="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-overlay"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_50%)]" />

      <!-- Brand Logo -->
      <NuxtLink
        to="/"
        class="absolute left-10 top-10 z-10 flex items-center gap-2"
      >
        <span class="text-2xl font-extrabold tracking-widest text-white uppercase">
          Sabay<span class="text-amber-400">Stay</span>
        </span>
      </NuxtLink>

      <!-- Overlay Text -->
      <div class="absolute bottom-16 left-10 z-10 max-w-lg pr-8">
        <h1 class="text-5xl font-extrabold tracking-tight text-white leading-tight">
          Begin Your <br/><span class="text-amber-400">Journey.</span>
        </h1>
        <p class="mt-4 text-base font-light leading-relaxed text-slate-300">
          Unlock access to exclusive premium stays and curated experiences worldwide. Designed for the discerning traveler.
        </p>
      </div>
    </section>

    <!-- Right Side: Registration Form -->
    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
      <div class="w-full max-w-md">
        
        <!-- Mobile Logo -->
        <NuxtLink
          to="/"
          class="mb-10 block lg:hidden"
        >
          <span class="text-2xl font-extrabold tracking-widest text-white uppercase">
            Sabay<span class="text-amber-400">Stay</span>
          </span>
        </NuxtLink>

        <div class="mb-8">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
            Membership
          </span>
          <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Create Account
          </h2>
          <p class="mt-2 text-sm font-light text-slate-400">
            Join SabayStay for personalized luxury travel experiences.
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="register">
          <!-- Full Name -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Full Name
            </label>
            <div class="relative mt-1.5">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <User class="h-4 w-4" />
              </span>
              <input
                type="text"
                v-model="fullName"
                placeholder="Prek Bora"
                autocomplete="name"
                class="block w-full border border-white/10 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div class="relative mt-1.5">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail class="h-4 w-4" />
              </span>
              <input
                type="email"
                v-model="email"
                placeholder="bora@example.com"
                autocomplete="email"
                class="block w-full border border-white/10 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <!-- Account Type -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Account Type
            </label>
            <div class="relative mt-1.5">
              <select
                v-model="role"
                class="block w-full appearance-none border border-white/10 bg-slate-900/60 py-3 px-4 text-sm text-white outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="user" class="bg-slate-900 text-white">Guest / User Account</option>
                <option value="owner" class="bg-slate-900 text-white">Property Owner</option>
              </select>
              <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                <ChevronDown class="h-4 w-4" />
              </span>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div class="relative mt-1.5">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <KeyRound class="h-4 w-4" />
              </span>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="••••••••"
                autocomplete="new-password"
                class="block w-full border border-white/10 bg-slate-900/60 py-3 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-amber-400"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="togglePassword"
              >
                <EyeOff v-if="showPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Confirm Password
            </label>
            <div class="relative mt-1.5">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <KeyRound class="h-4 w-4" />
              </span>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                placeholder="••••••••"
                autocomplete="new-password"
                class="block w-full border border-white/10 bg-slate-900/60 py-3 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-amber-400"
                :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
                @click="toggleConfirmPassword"
              >
                <EyeOff v-if="showConfirmPassword" class="h-4 w-4" />
                <Eye v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="pt-1">
            <label class="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                v-model="acceptedTerms"
                class="h-4 w-4 cursor-pointer appearance-none border border-white/20 bg-slate-900/60 checked:border-amber-500 checked:bg-amber-500 checked:after:absolute checked:after:ml-[5px] checked:after:mt-[2px] checked:after:block checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-b-2 checked:after:border-r-2 checked:after:border-slate-950"
              />
              <span>
                I agree to the
                <a href="#" class="font-bold text-amber-400 hover:underline">Terms & Conditions</a>
                and
                <a href="#" class="font-bold text-amber-400 hover:underline">Privacy Policy</a>
              </span>
            </label>
          </div>

          <!-- Alerts -->
          <div
            v-if="errorMessage"
            class="border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-400"
            role="alert"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-400"
            role="status"
          >
            {{ successMessage }}
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              class="flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
            >
              <span>Create Account</span>
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </form>

        <p class="mt-8 text-center text-xs font-light text-slate-400">
          Already have an account?
          <NuxtLink
            to="/auth/login"
            class="ml-1 font-bold text-amber-400 transition-colors hover:text-amber-300 hover:underline"
          >
            Log In
          </NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>