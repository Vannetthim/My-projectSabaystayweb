// import { initializeApp } from 'firebase/app'
// import { getAuth } from 'firebase/auth'
// import { getFirestore } from 'firebase/firestore'
// import { getAnalytics, isSupported } from 'firebase/analytics'

// export default defineNuxtPlugin(() => {
//   const firebaseConfig = {
//     apiKey: "AIzaSyCnyj8EYbwbghCmdh-_fmstVKxf-qacHpo",
//     authDomain: "sabay-stay-ba3d1.firebaseapp.com",
//     projectId: "sabay-stay-ba3d1",
//     storageBucket: "sabay-stay-ba3d1.firebasestorage.app",
//     messagingSenderId: "439357390540",
//     appId: "1:439357390540:web:859ac344e2c22639ed8c69",
//     measurementId: "G-4E7PL6C5N1"
//   }

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig)
//   const auth = getAuth(app)
//   const db = getFirestore(app)

//   // Analytics ដំណើរការតែលើ Browser 
//   if (process.client) {
//     isSupported().then((supported) => {
//       if (supported) {
//         getAnalytics(app)
//       }
//     })
//   }

//   return {
//     provide: {
//       firebaseApp: app,
//       auth: auth,
//       db: db
//     }
//   }
// })
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: "AIzaSyCnyj8EYbwbghCmdh-_fmstVKxf-qacHpo",
    authDomain: "sabay-stay-ba3d1.firebaseapp.com",
    projectId: "sabay-stay-ba3d1",
    storageBucket: "sabay-stay-ba3d1.firebasestorage.app",
    messagingSenderId: "439357390540",
    appId: "1:439357390540:web:859ac344e2c22639ed8c69",
    measurementId: "G-4E7PL6C5N1"
  }

  // 1. ការពារការ Re-initialize App ពេល Hot Reload ក្នុង Development
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  
  const auth = getAuth(app)
  const db = getFirestore(app)

  // 2. Firebase Analytics ដំណើរការតែលើ Client-side ប៉ុណ្ណោះ
  if (process.client) {
    isSupported().then((supported) => {
      if (supported) {
        getAnalytics(app)
      }
    })
  }

  // 3. Provide ទៅកាន់ Nuxt App ទាំងមូល
  return {
    provide: {
      firebaseApp: app,
      auth,
      db
    }
  }
})