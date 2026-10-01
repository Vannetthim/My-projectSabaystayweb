import { useNuxtApp, useState } from '#imports'
import { addDoc, collection } from 'firebase/firestore'
import { computed } from 'vue'
import { useAuth } from '../auth/useAuth'

// 1. បង្កើត Interface សម្រាប់ប្រភេទទិន្នន័យ (Type Safety)
export interface Booking {
  id: string | number
  userId?: string
  status: 'Pending' | 'Confirmed' | 'Check-in' | 'Check-out' | 'Cancelled'
  hotelName?: string
  title?: string
  location?: string
  ref?: string
  checkIn?: string
  checkOut?: string
  guestName?: string
  totalPrice?: number
  price?: number
}

export interface FavoritePlace {
  id: number
  name: string
  location: string
  price: number
  rating: number
  image: string
  description?: string
  [key: string]: any
}

export const useUserData = () => {
  const { user } = useAuth()
  // Global State សម្រាប់ Bookings
  const bookings = useState<Booking[]>('user_bookings', () => [
    {
      id: 1,
      ref: '#SBY-88392',
      hotelName: 'The Azure Retreat',
      guestName: 'User Account',
      checkIn: 'Oct 15, 2026',
      checkOut: 'Oct 22, 2026',
      totalPrice: 4250,
      status: 'Confirmed'
    },
    {
      id: 2,
      ref: '#SBY-90114',
      hotelName: 'Metro Grand Suites',
      guestName: 'User Account',
      checkIn: 'Nov 05, 2026',
      checkOut: 'Nov 10, 2026',
      totalPrice: 1800,
      status: 'Pending'
    },
    {
      id: 3,
      ref: '#SBY-95021',
      hotelName: 'Angkor Heritage Villa',
      guestName: 'Sophea Kol',
      checkIn: 'Sep 10, 2026',
      checkOut: 'Sep 12, 2026',
      totalPrice: 650,
      status: 'Check-in'
    }
  ])

  const safeBookings = computed<Booking[]>(() => Array.isArray(bookings.value) ? bookings.value : [])

  // Global State សម្រាប់ Favorites
  const favorites = useState<FavoritePlace[]>('user_favorites', () => [])

  // Global State សម្រាប់ Points ដើម
  const userPoints = useState<number>('user_points', () => 500)

  // គណនា Total Bookings Dynamic
  const totalBookings = computed(() => safeBookings.value.length)

  // គណនា Saved Places (Favorites) Dynamic
  const totalFavorites = computed(() => favorites.value.length)

  // គណនា Reward Points (Points ដើម + ១ Booking = ១,០០០ Points)
  const rewardPoints = computed(() => {
    return userPoints.value + (totalBookings.value * 1000)
  })

  // Action: បន្ថែម Booking ថ្មី
  const addBooking = async (bookingData: Booking) => {
    if (!Array.isArray(bookings.value)) {
      bookings.value = []
    }

    const booking = {
      ...bookingData,
      userId: user.value?.id || ''
    }
    bookings.value.push(booking)

    const db = useNuxtApp().$db
    if (db && booking.userId) {
      await addDoc(collection(db as any, 'bookings'), booking)
    }
  }

  // Action: ប្តូរ Status នៃ Booking (ប្រើសម្រាប់ Admin & User)
  const updateBookingStatus = (id: string | number, newStatus: Booking['status']) => {
    const item = safeBookings.value.find(b => b.id === id)
    if (item) {
      item.status = newStatus
    }
  }

  // Action: បន្ថែម/លុប Favorites
  const toggleFavorite = (place: FavoritePlace) => {
    const index = favorites.value.findIndex(item => item.id === place.id)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(place)
    }
  }

  // Action: ពិនិត្យមើលថា Place នោះជា Favorite ឬនៅ (Helper Function)
  const isFavorite = (id: number) => {
    return favorites.value.some(item => item.id === id)
  }

  return {
    bookings: safeBookings,
    favorites,
    userPoints,
    totalBookings,
    totalFavorites,
    rewardPoints,
    addBooking,
    updateBookingStatus,
    toggleFavorite,
    isFavorite
  }
}