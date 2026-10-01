<script setup lang="ts">
import { ref } from "vue";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-vue-next";

const email = ref("");
const isSubmitted = ref(false);
const isLoading = ref(false);

function handleResetPassword() {
  if (!email.value.trim()) return;

  isLoading.value = true;

  // Simulate API / Firebase reset request delay
  setTimeout(() => {
    isLoading.value = false;
    isSubmitted.value = true;
  }, 1000);
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950 sm:px-12">
    <!-- Background Glow Effect -->
    <div class="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden">
      <div class="h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-md">
      <!-- Mobile/Desktop Header Brand Link -->
      <div class="mb-10 text-center">
        <NuxtLink to="/" class="inline-block">
          <span class="text-2xl font-extrabold tracking-widest text-white uppercase">
            Sabay<span class="text-amber-400">Stay</span>
          </span>
        </NuxtLink>
      </div>

      <!-- Card Container -->
      <div class="border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div class="mb-8">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
            Account Access
          </span>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Reset Password
          </h1>
          <p class="mt-3 text-sm font-light leading-relaxed text-slate-400">
            Enter your registered email address and we will send you a secure password reset link.
          </p>
        </div>

        <!-- Success Feedback State -->
        <div
          v-if="isSubmitted"
          class="border border-emerald-500/30 bg-emerald-500/10 p-5"
        >
          <div class="flex items-start gap-3">
            <CheckCircle2 class="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Reset Link Sent
              </p>
              <p class="mt-1 text-xs font-light leading-relaxed text-emerald-200/80">
                We have dispatched a password recovery email to <strong class="text-white">{{ email }}</strong>. Please check your inbox.
              </p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <form v-else class="space-y-6" @submit.prevent="handleResetPassword">
          <div>
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div class="relative mt-2">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail class="h-4 w-4" />
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="you@example.com"
                class="block w-full border border-white/10 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
          >
            <span>{{ isLoading ? 'Sending...' : 'Send Reset Link' }}</span>
            <ArrowRight v-if="!isLoading" class="h-4 w-4" />
          </button>
        </form>

        <!-- Back Link -->
        <div class="mt-8 border-t border-white/10 pt-6 text-center">
          <NuxtLink
            to="/auth/login"
            class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition-colors hover:text-amber-400"
          >
            <ArrowLeft class="h-3.5 w-3.5" />
            <span>Back to Sign In</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>