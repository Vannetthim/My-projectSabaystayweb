<script setup lang="ts">
import { ref } from 'vue'
import { signInWithEmailAndPassword, type Auth } from 'firebase/auth'
import { doc, getDoc, type Firestore } from 'firebase/firestore'
import { navigateTo, useCookie, useNuxtApp } from '#imports'
import { useAuth } from '~/composables/auth/useAuth'
import { Mail, KeyRound, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-vue-next'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isLoading = ref(false)

const { updateUser } = useAuth()
const userRoleCookie = useCookie('user_role', { maxAge: 60 * 60 * 24 * 7 })

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const login = async () => {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value) {
    errorMessage.value = 'Please enter your email and password.'
    return
  }

  isLoading.value = true

  try {
    const { $auth, $db } = useNuxtApp()

    if (!$auth || !$db) {
      throw new Error('Firebase is not configured.')
    }

    const auth = $auth as Auth
    const db = $db as Firestore

    const credential = await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value
    )

    const uid = credential.user.uid

    const results = await Promise.allSettled([
      getDoc(doc(db, 'admin', uid)),
      getDoc(doc(db, 'owner', uid)),
      getDoc(doc(db, 'user', uid))
    ])

    const adminDoc = results[0].status === 'fulfilled' ? results[0].value : null
    const ownerDoc = results[1].status === 'fulfilled' ? results[1].value : null
    const userDoc = results[2].status === 'fulfilled' ? results[2].value : null

    let profile: Record<string, any> = {
      id: uid,
      email: credential.user.email || email.value.trim(),
      name: credential.user.displayName || 'User Account',
      role: 'user',
      permissions: ['read'],
      avatar: '',
      phone: '',
      country: 'Cambodia'
    }

    if (adminDoc?.exists()) {
      const data = adminDoc.data()
      profile = {
        ...profile,
        ...data,
        id: uid,
        role: data.role === 'super_admin' ? 'super_admin' : 'admin',
        permissions: data.permissions || ['all']
      }
    } else if (ownerDoc?.exists()) {
      const data = ownerDoc.data()
      profile = {
        ...profile,
        ...data,
        id: uid,
        role: 'owner',
        permissions: data.permissions || ['read']
      }
    } else if (userDoc?.exists()) {
      const data = userDoc.data()
      profile = {
        ...profile,
        ...data,
        id: uid,
        role: 'user',
        permissions: data.permissions || ['read']
      }
    }

    updateUser(profile)
    userRoleCookie.value = profile.role

    if (profile.role === 'admin' || profile.role === 'super_admin') {
      await navigateTo('/admin')
    } else if (profile.role === 'owner') {
      await navigateTo('/Owner/owner_dashboard')
    } else {
      await navigateTo('/dashboard')
    }
  } catch (error: any) {
    console.error('Login error:', error)

    if (
      error?.code === 'auth/invalid-credential' ||
      error?.code === 'auth/user-not-found' ||
      error?.code === 'auth/wrong-password'
    ) {
      errorMessage.value = 'Email or password is incorrect.'
    } else {
      errorMessage.value = error?.message || 'Unable to sign in.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-950 lg:grid-cols-2">
    <!-- Left Side: Image/Brand Area -->
    <section
      class="relative hidden min-h-screen overflow-hidden bg-slate-900 lg:block"
      aria-label="SabayStay travel inspiration"
    >
      <img
        src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1920&auto=format&fit=crop"
        alt="Luxury resort swimming pool surrounded by tropical vegetation"
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

    <!-- Right Side: Login Form -->
    <section class="flex min-h-screen items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
      <div class="w-full max-w-md">
        
        <!-- Mobile Logo (hidden on desktop) -->
        <NuxtLink
          to="/"
          class="mb-12 block lg:hidden"
        >
          <span class="text-2xl font-extrabold tracking-widest text-white uppercase">
            Sabay<span class="text-amber-400">Stay</span>
          </span>
        </NuxtLink>

        <div class="mb-8">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
            Authentication
          </span>
          <h2 class="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back
          </h2>
          <p class="mt-2 text-sm font-light text-slate-400">
            Sign in to access your exclusive premium travel experiences.
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="login">
          <!-- Email Input -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div class="relative mt-2">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail class="h-4 w-4" />
              </span>
              <input
                type="email"
                v-model="email"
                placeholder="Enter your email"
                autocomplete="email"
                class="block w-full border border-white/10 bg-slate-900/60 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div class="relative mt-2">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <KeyRound class="h-4 w-4" />
              </span>
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                placeholder="Enter your password"
                autocomplete="current-password"
                class="block w-full border border-white/10 bg-slate-900/60 py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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

          <!-- Additional Options -->
          <div class="flex items-center justify-between pt-2 text-xs">
            <label class="flex cursor-pointer items-center gap-2 font-medium text-slate-300">
              <input
                type="checkbox"
                class="h-4 w-4 cursor-pointer appearance-none border border-white/20 bg-slate-900/60 checked:border-amber-500 checked:bg-amber-500 checked:after:absolute checked:after:ml-[5px] checked:after:mt-[2px] checked:after:block checked:after:h-2.5 checked:after:w-1.5 checked:after:rotate-45 checked:after:border-b-2 checked:after:border-r-2 checked:after:border-slate-950"
              />
              Remember me
            </label>
            <NuxtLink
              to="/auth/forgot-password"
              class="font-bold tracking-wide text-amber-400 transition-colors hover:text-amber-300 hover:underline"
            >
              Forgot Password?
            </NuxtLink>
          </div>

          <!-- Error State -->
          <div
            v-if="errorMessage"
            class="border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-400"
            role="alert"
          >
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="pt-4 space-y-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
              <template v-else>
                <span>Login</span>
                <ArrowRight class="h-4 w-4" />
              </template>
            </button>
            
            <NuxtLink
              to="/auth/register"
              class="flex w-full items-center justify-center border border-white/10 bg-transparent py-3.5 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all duration-300 hover:border-amber-500/50 hover:bg-slate-900/50 hover:text-amber-400"
            >
              Create an Account
            </NuxtLink>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>