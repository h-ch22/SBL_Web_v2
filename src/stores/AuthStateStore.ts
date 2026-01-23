import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authState', {
  state: () => ({
    isSignedIn: false,
    isAdmin: false
  }),
  actions: {
    setAuthState (signedIn: boolean) {
      this.isSignedIn = signedIn
    },

    setAdminState (admin: boolean) {
      this.isAdmin = admin
    }
  }
})
