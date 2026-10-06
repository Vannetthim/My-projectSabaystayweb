<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore'
import { getAuth, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { definePageMeta, useNuxtApp } from '#imports'
// Import Lucide Icons
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Save, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Navigation Tabs
const activeTab = ref<'general' | 'security' | 'notifications'>('general')

// General Settings State
const siteName = ref('SabayStay')
const supportEmail = ref('support@sabaystay.com')
const currency = ref('USD')
const systemLanguage = ref('en')
const allowNewBookings = ref(true)

// Admin Profile State
const adminName = ref('')
const adminEmail = ref('')

// Password State
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// Notification State
const emailAlerts = ref(true)
const bookingAlerts = ref(true)
const reportAlerts = ref(false)

// UI Feedback States
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('Settings updated successfully!')
const toastType = ref<'success' | 'error'>('success')

// Helper for Firestore connection
const getDb = (): Firestore | null => {
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$db as Firestore) || null
}

const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = msg
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3500)
}

// Fetch Initial Settings and Auth Profile
const fetchSettings = async () => {
  loading.value = true
  const auth = getAuth()
  const currentUser = auth.currentUser

  if (currentUser) {
    adminName.value = currentUser.displayName || ''
    adminEmail.value = currentUser.email || ''
  }

  const db = getDb()
  if (db) {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'general'))
      if (settingsDoc.exists()) {
        const data = settingsDoc.data()
        siteName.value = data.siteName ?? siteName.value
        supportEmail.value = data.supportEmail ?? supportEmail.value
        currency.value = data.currency ?? currency.value
        systemLanguage.value = data.systemLanguage ?? systemLanguage.value
        allowNewBookings.value = data.allowNewBookings ?? allowNewBookings.value
        emailAlerts.value = data.emailAlerts ?? emailAlerts.value
        bookingAlerts.value = data.bookingAlerts ?? bookingAlerts.value
        reportAlerts.value = data.reportAlerts ?? reportAlerts.value
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }
  loading.value = false
}

// Unified Save Handler
const handleSave = async () => {
  loading.value = true
  const db = getDb()
  const auth = getAuth()
  const user = auth.currentUser

  try {
    // 1. Update Profile (Firebase Auth & Firestore)
    if (user && activeTab.value === 'general') {
      if (adminName.value !== user.displayName) {
        await updateProfile(user, { displayName: adminName.value })
      }

      if (db) {
        await setDoc(
          doc(db, 'users', user.uid),
          {
            name: adminName.value,
            email: user.email ?? adminEmail.value,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        )
      }
    }

    // 2. Update Password if on security tab
    if (activeTab.value === 'security' && newPassword.value) {
      if (newPassword.value !== confirmPassword.value) {
        triggerToast('New passwords do not match!', 'error')
        loading.value = false
        return
      }
      if (!currentPassword.value) {
        triggerToast('Please enter your current password.', 'error')
        loading.value = false
        return
      }

      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword.value)
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, newPassword.value)
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
      }
    }

    // 3. Save Platform & Notification Preferences to Firestore
    if (db) {
      await setDoc(doc(db, 'settings', 'general'), {
        siteName: siteName.value,
        supportEmail: supportEmail.value,
        currency: currency.value,
        systemLanguage: systemLanguage.value,
        allowNewBookings: allowNewBookings.value,
        emailAlerts: emailAlerts.value,
        bookingAlerts: bookingAlerts.value,
        reportAlerts: reportAlerts.value,
        updatedAt: serverTimestamp()
      }, { merge: true })
    }

    triggerToast('Settings updated successfully!', 'success')
  } catch (error: any) {
    console.error('Error saving settings:', error)
    triggerToast(error?.message || 'Failed to update settings.', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <ClientOnly>
    <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      <!-- Header Section -->
      <div class="bg-[#0b111e] rounded-sm p-6 border border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black text-white tracking-tight flex items-center gap-2.5 uppercase">
            <Settings class="w-7 h-7 text-amber-500" />
            System Settings
          </h1>
          <p class="text-sm text-slate-400 mt-1">Manage system configurations, administrator profile, security, and notification preferences.</p>
        </div>

        <button
          @click="handleSave"
          :disabled="loading"
          class="bg-amber-500 hover:bg-amber-400 text-[#0b111e] font-black px-5 py-2.5 rounded-sm text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer w-fit"
        >
          <Save class="w-4 h-4" />
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Success / Error Alert Banner -->
      <Transition name="fade">
        <div 
          v-if="showToast" 
          :class="toastType === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'"
          class="border px-4 py-3 rounded-sm text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm"
        >
          <component :is="toastType === 'success' ? CheckCircle2 : AlertTriangle" class="w-4 h-4 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>

      <!-- Navigation Tabs -->
      <div class="flex bg-[#0b111e] p-1.5 rounded-sm border border-slate-800/80 w-fit gap-1 text-xs font-semibold shadow-sm">
        <button
          v-for="tab in ([
            { key: 'general', label: 'General & Profile', icon: User },
            { key: 'security', label: 'Security & Password', icon: Lock },
            { key: 'notifications', label: 'Notifications', icon: Bell }
          ] as const)"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="activeTab === tab.key ? 'bg-amber-500 text-[#0b111e] shadow-sm font-black' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'"
          class="px-4 py-2.5 rounded-sm transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <component :is="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: General & Profile Settings -->
      <div v-if="activeTab === 'general'" class="space-y-6">
        <!-- Admin Profile Card -->
        <div class="bg-[#0b111e] rounded-sm border border-slate-800/80 p-6 shadow-sm space-y-4">
          <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2 uppercase tracking-wider">
            <User class="w-4 h-4 text-amber-500" />
            Administrator Profile
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Full Name</label>
              <input
                v-model="adminName"
                type="text"
                class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Email Address</label>
              <input
                v-model="adminEmail"
                type="email"
                disabled
                class="w-full bg-[#070b14] border border-slate-800 rounded-sm px-4 py-2.5 text-xs text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Platform Settings Card -->
        <div class="bg-[#0b111e] rounded-sm border border-slate-800/80 p-6 shadow-sm space-y-4">
          <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2 uppercase tracking-wider">
            <Settings class="w-4 h-4 text-amber-500" />
            Platform Preferences
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Site Name</label>
              <input
                v-model="siteName"
                type="text"
                class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Support Email</label>
              <input
                v-model="supportEmail"
                type="email"
                class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Primary Currency</label>
              <select
                v-model="currency"
                class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50"
              >
                <option value="KHR" class="bg-[#0b111e] text-white">Cambodian Riel (KHR)</option>
                <option value="USD" class="bg-[#0b111e] text-white">US Dollar ($ USD)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Default Language</label>
              <select
                v-model="systemLanguage"
                class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-amber-500/50"
              >
                <option value="en" class="bg-[#0b111e] text-white">English</option>
                <option value="km" class="bg-[#0b111e] text-white">Khmer</option>
              </select>
            </div>
          </div>

          <div class="pt-2">
            <div class="flex items-center justify-between bg-[#121929] p-4 rounded-sm border border-slate-700/80">
              <div>
                <p class="text-xs font-bold text-white">Allow New Bookings</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Pause or enable reservations site-wide</p>
              </div>
              <input
                v-model="allowNewBookings"
                type="checkbox"
                class="w-5 h-5 accent-amber-500 rounded-xs border-slate-700 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Security Settings -->
      <div v-else-if="activeTab === 'security'" class="bg-[#0b111e] rounded-sm border border-slate-800/80 p-6 shadow-sm space-y-4">
        <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2 uppercase tracking-wider">
          <Lock class="w-4 h-4 text-amber-500" />
          Password & Authentication
        </h2>

        <div class="max-w-md space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">Confirm New Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-[#121929] border border-slate-700/80 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
      </div>

      <!-- Tab 3: Notifications -->
      <div v-else class="bg-[#0b111e] rounded-sm border border-slate-800/80 p-6 shadow-sm space-y-4">
        <h2 class="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2 uppercase tracking-wider">
          <Bell class="w-4 h-4 text-amber-500" />
          Notification Preferences
        </h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between bg-[#121929] p-4 rounded-sm border border-slate-700/80">
            <div>
              <p class="text-xs font-bold text-white">Email Notifications</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Receive administrative updates via email</p>
            </div>
            <input
              v-model="emailAlerts"
              type="checkbox"
              class="w-5 h-5 accent-amber-500 rounded-xs border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          <div class="flex items-center justify-between bg-[#121929] p-4 rounded-sm border border-slate-700/80">
            <div>
              <p class="text-xs font-bold text-white">New Booking Alerts</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Get notified when customers create new bookings</p>
            </div>
            <input
              v-model="bookingAlerts"
              type="checkbox"
              class="w-5 h-5 accent-amber-500 rounded-xs border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
          </div>

          <div class="flex items-center justify-between bg-[#121929] p-4 rounded-sm border border-slate-700/80">
            <div>
              <p class="text-xs font-bold text-white">Weekly Performance Reports</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Send automated analytics reports every Monday</p>
            </div>
            <input
              v-model="reportAlerts"
              type="checkbox"
              class="w-5 h-5 accent-amber-500 rounded-xs border-slate-700 focus:ring-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>