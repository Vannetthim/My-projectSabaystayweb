import { doc, getDoc } from 'firebase/firestore'
import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from 'nuxt/app'
import { useAuth } from '~/composables/auth/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  // 1. Skip heavy client-side checks during SSR server execution
  if (import.meta.server) {
    return
  }

  const { user, isLoggedIn } = useAuth()

  // 2. Load current user if state is not initialized

  // 3. Redirect to login if not authenticated
  if (!isLoggedIn.value) {
    return navigateTo('/auth/login')
  }

  // 4. Fast-path check from composables state
  const userRole = user.value?.role
  if (userRole === 'owner' || userRole === 'admin' || userRole === 'super_admin') {
    return
  }

  // 5. Fallback verification against Firestore database
  const nuxtApp = useNuxtApp() as any
  const db = nuxtApp.$db
  const uid = user.value?.id || nuxtApp.$auth?.currentUser?.uid

  if (!uid || !db) {
    return navigateTo('/')
  }

  try {
    // Check 'owner' collection first
    let ownerDoc = await getDoc(doc(db, 'owner', uid))
    
    // Fallback: Check 'user' collection
    if (!ownerDoc.exists()) {
      ownerDoc = await getDoc(doc(db, 'user', uid))
    }

    if (!ownerDoc.exists()) {
      return navigateTo('/')
    }

    const ownerData = ownerDoc.data()
    if (ownerData?.role !== 'owner' && ownerData?.role !== 'admin' && ownerData?.role !== 'super_admin') {
      return navigateTo('/')
    }
  } catch (error) {
    console.error('Owner authorization middleware error:', error)
    return navigateTo('/')
  }
})