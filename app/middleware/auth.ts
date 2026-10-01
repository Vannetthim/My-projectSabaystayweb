import { defineNuxtRouteMiddleware, navigateTo } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const isAuthenticated = localStorage.getItem("sabaystay-authenticated") === "true";
  const savedUser = localStorage.getItem("auth_user");
  const user = savedUser ? JSON.parse(savedUser) : null;

  // 1. Unauthenticated users trying to access protected routes
  if (!isAuthenticated || !user) {
    if (to.path !== '/auth/login' && to.path !== '/auth/register') {
      return navigateTo("/auth/login");
    }
    return;
  }

  // 2. Already logged in users trying to access /auth/login or /auth/register
  if (to.path.startsWith('/auth')) {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return navigateTo('/admin');
    }
    if (user.role === 'owner') {
      return navigateTo('/Owner/owner_dashboard');
    }
    return navigateTo('/dashboard');
  }
});