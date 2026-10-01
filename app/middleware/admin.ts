import { defineNuxtRouteMiddleware, navigateTo, useNuxtApp } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useAuth } from '~/composables/auth/useAuth'

export default defineNuxtRouteMiddleware(async () => {
  const { user, isAdmin, updateUser } = useAuth()

  // If already authenticated in memory as admin, grant immediate access
  if (user.value && isAdmin.value) return

  // Firebase Auth is initialized on the client-side; skip server guard execution
  if (import.meta.server) return

  const { $auth, $db } = useNuxtApp() as any
  if (!$auth || !$db) {
    return navigateTo('/auth/login')
  }

  // Restore current Firebase Auth user state
  const firebaseUser = await new Promise<any>((resolve) => {
    const unsubscribe = onAuthStateChanged($auth, (currentUser) => {
      unsubscribe()
      resolve(currentUser)
    })
  })

  if (!firebaseUser) return navigateTo('/auth/login')

  try {
    let adminData: Record<string, any> | null = null

    // 1. Try checking the 'admin' collection
    const adminSnap = await getDoc(doc($db, 'admin', firebaseUser.uid))
    
    if (adminSnap.exists()) {
      adminData = adminSnap.data()
    } else {
      // 2. Fallback: Check 'users' collection for user account with admin roles
      const userSnap = await getDoc(doc($db, 'users', firebaseUser.uid))
      if (userSnap.exists()) {
        adminData = userSnap.data()
      } else {
        // 3. Fallback: Check singular 'user' collection
        const singleUserSnap = await getDoc(doc($db, 'user', firebaseUser.uid))
        if (singleUserSnap.exists()) {
          adminData = singleUserSnap.data()
        }
      }
    }

    if (!adminData) return navigateTo('/auth/login')

    // Normalize role string (lowercase and trim whitespace)
    const rawRole = String(adminData.role || '').trim().toLowerCase()
    const role = rawRole === 'super_admin' ? 'super_admin' : rawRole === 'admin' ? 'admin' : ''

    if (!role) return navigateTo('/auth/login')

    // Update authentication statecomposable
    updateUser({
      ...adminData,
      id: firebaseUser.uid,
      email: adminData.email || firebaseUser.email || '',
      role,
      permissions: adminData.permissions || ['all']
    })
  } catch (error) {
    console.error('Unable to verify admin access:', error)
    return navigateTo('/auth/login')
  }
})