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
    <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-800">
      <!-- Header Section -->
      <div class="bg-white rounded-2xl p-6 border border-slate-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Settings class=" w-7 h-7 text-[#1d1b4b]" />
            System Settings
          </h1>
          <p class="text-sm text-slate-500 mt-1">Manage system configurations, administrator profile, security, and notification preferences.</p>
        </div>

        <button
          @click="handleSave"
          :disabled="loading"
          class="bg-[#1d1b4b] hover:bg-[#15133c] text-white font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer w-fit"
        >
          <Save class="w-4 h-4" />
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- Success / Error Alert Banner -->
      <Transition name="fade">
        <div 
          v-if="showToast" 
          :class="toastType === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'"
          class="border px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm"
        >
          <component :is="toastType === 'success' ? CheckCircle2 : AlertTriangle" class="w-4 h-4 shrink-0" />
          <span>{{ toastMessage }}</span>
        </div>
      </Transition>

      <!-- Navigation Tabs -->
      <div class="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-300 w-fit gap-1 text-xs font-semibold shadow-sm">
        <button
          v-for="tab in ([
            { key: 'general', label: 'General & Profile', icon: User },
            { key: 'security', label: 'Security & Password', icon: Lock },
            { key: 'notifications', label: 'Notifications', icon: Bell }
          ] as const)"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="activeTab === tab.key ? 'bg-[#1d1b4b] text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'"
          class="px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <component :is="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: General & Profile Settings -->
      <div v-if="activeTab === 'general'" class="space-y-6">
        <!-- Admin Profile Card -->
        <div class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
          <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2 uppercase tracking-wider">
            <User class="w-4 h-4 text-[#1d1b4b]" />
            Administrator Profile
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Full Name</label>
              <input
                v-model="adminName"
                type="text"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Email Address</label>
              <input
                v-model="adminEmail"
                type="email"
                disabled
                class="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-400 font-medium cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Platform Settings Card -->
        <div class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
          <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2 uppercase tracking-wider">
            <Settings class="w-4 h-4 text-[#1d1b4b]" />
            Platform Preferences
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Site Name</label>
              <input
                v-model="siteName"
                type="text"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Support Email</label>
              <input
                v-model="supportEmail"
                type="email"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Primary Currency</label>
              <select
                v-model="currency"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
              >
                <option value="KHR">Cambodian Riel (KHR)</option>
                <option value="USD">US Dollar ($ USD)</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Default Language</label>
              <select
                v-model="systemLanguage"
                class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
              >
                <option value="en">English</option>
                <option value="km">Khmer</option>
              </select>
            </div>
          </div>

          <div class="pt-2">
            <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-300">
              <div>
                <p class="text-xs font-bold text-slate-900">Allow New Bookings</p>
                <p class="text-[11px] text-slate-500 mt-0.5">Pause or enable reservations site-wide</p>
              </div>
              <input
                v-model="allowNewBookings"
                type="checkbox"
                class="w-5 h-5 accent-[#1d1b4b] rounded border-slate-300 focus:ring-[#1d1b4b] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Security Settings -->
      <div v-else-if="activeTab === 'security'" class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
        <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2 uppercase tracking-wider">
          <Lock class="w-4 h-4 text-[#1d1b4b]" />
          Password & Authentication
        </h2>

        <div class="max-w-md space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-500 mb-1.5">Confirm New Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#1d1b4b] focus:bg-white"
            />
          </div>
        </div>
      </div>

      <!-- Tab 3: Notifications -->
      <div v-else class="bg-white rounded-2xl border border-slate-300 p-6 shadow-sm space-y-4">
        <h2 class="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2 uppercase tracking-wider">
          <Bell class="w-4 h-4 text-[#1d1b4b]" />
          Notification Preferences
        </h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-300">
            <div>
              <p class="text-xs font-bold text-slate-900">Email Notifications</p>
              <p class="text-[11px] text-slate-500">Receive administrative updates via email</p>
            </div>
            <input
              v-model="emailAlerts"
              type="checkbox"
              class="w-5 h-5 accent-[#1d1b4b] rounded border-slate-300 focus:ring-[#1d1b4b] cursor-pointer"
            />
          </div>

          <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-300">
            <div>
              <p class="text-xs font-bold text-slate-900">New Booking Alerts</p>
              <p class="text-[11px] text-slate-500">Get notified when customers create new bookings</p>
            </div>
            <input
              v-model="bookingAlerts"
              type="checkbox"
              class="w-5 h-5 accent-[#1d1b4b] rounded border-slate-300 focus:ring-[#1d1b4b] cursor-pointer"
            />
          </div>

          <div class="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-300">
            <div>
              <p class="text-xs font-bold text-slate-900">Weekly Performance Reports</p>
              <p class="text-[11px] text-slate-500">Send automated analytics reports every Monday</p>
            </div>
            <input
              v-model="reportAlerts"
              type="checkbox"
              class="w-5 h-5 accent-[#1d1b4b] rounded border-slate-300 focus:ring-[#1d1b4b] cursor-pointer"
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