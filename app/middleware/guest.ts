import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useAuth } from '~/composables/auth/useAuth'

export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn, user } = useAuth()

  if (isLoggedIn.value) {
    const isAdminUser = user.value?.role === 'admin' || user.value?.role === 'super_admin'
    return navigateTo(isAdminUser ? '/admin' : '/dashboard')
  }
})
