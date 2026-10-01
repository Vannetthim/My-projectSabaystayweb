import { useNuxtApp } from '#imports'
import type { Firestore } from 'firebase/firestore'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc, 
  doc, 
  query, 
  where 
} from 'firebase/firestore'

export const useFirestoreDB = () => {
  const { $db } = useNuxtApp()
  const db = $db as Firestore | undefined

  const ensureDb = (): Firestore => {
    if (!db) throw new Error("Firestore instance ($db) is not initialized yet.")
    return db
  }

  // 1. HOTELS COLLECTION
  const getHotels = async () => {
    const firestore = ensureDb()
    const querySnapshot = await getDocs(collection(firestore, 'hotels'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const addHotel = async (hotelData: any) => {
    const firestore = ensureDb()
    const docRef = await addDoc(collection(firestore, 'hotels'), {
      ...hotelData,
      createdAt: new Date().toISOString()
    })
    return docRef
  }

  const updateHotel = async (hotelId: string, hotelData: any) => {
    const firestore = ensureDb()
    if (!hotelId || hotelId.startsWith('temp-')) return
    const hotelRef = doc(firestore, 'hotels', hotelId)
    await updateDoc(hotelRef, hotelData)
  }

  const deleteHotel = async (hotelId: string) => {
    const firestore = ensureDb()
    if (!hotelId || hotelId.startsWith('temp-')) return
    const docRef = doc(firestore, 'hotels', hotelId)
    await deleteDoc(docRef)
  }

  // 2. ROOM COLLECTION
  const getRooms = async () => {
    const firestore = ensureDb()
    const querySnapshot = await getDocs(collection(firestore, 'room'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const getRoomsByHotel = async (hotelId: string) => {
    const firestore = ensureDb()
    const q = query(collection(firestore, 'room'), where('hotelId', '==', hotelId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const addRoom = async (hotelId: string, roomData: any) => {
    const firestore = ensureDb()
    const docRef = await addDoc(collection(firestore, 'room'), {
      hotelId: hotelId || 'default',
      ...roomData,
      createdAt: new Date().toISOString()
    })
    return docRef
  }

  const updateRoom = async (roomId: string, roomData: any) => {
    const firestore = ensureDb()
    if (!roomId || roomId.startsWith('temp-')) return
    const roomRef = doc(firestore, 'room', roomId)
    await updateDoc(roomRef, roomData)
  }

  const deleteRoom = async (roomId: string) => {
    const firestore = ensureDb()
    if (!roomId || roomId.startsWith('temp-')) return
    const docRef = doc(firestore, 'room', roomId)
    await deleteDoc(docRef)
  }

  // 3. BOOKINGS COLLECTION
  const getBookings = async () => {
    const firestore = ensureDb()
    const querySnapshot = await getDocs(collection(firestore, 'bookings'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const createBooking = async (bookingData: any) => {
    const firestore = ensureDb()
    const docRef = await addDoc(collection(firestore, 'bookings'), {
      ...bookingData,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    })
    return docRef
  }

  const getBookingsByGuest = async (email: string) => {
    const firestore = ensureDb()
    const q = query(collection(firestore, 'bookings'), where('guestEmail', '==', email))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const firestore = ensureDb()
    if (!bookingId) return
    const bookingRef = doc(firestore, 'bookings', bookingId)
    await updateDoc(bookingRef, { status, updatedAt: new Date().toISOString() })
  }

  // 4. REVIEWS COLLECTION
  const getReviews = async () => {
    const firestore = ensureDb()
    const querySnapshot = await getDocs(collection(firestore, 'reviews'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const getReviewsByHotel = async (hotelId: string) => {
    const firestore = ensureDb()
    const q = query(collection(firestore, 'reviews'), where('hotelId', '==', hotelId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const addReview = async (hotelId: string, reviewData: any) => {
    const firestore = ensureDb()
    const docRef = await addDoc(collection(firestore, 'reviews'), {
      hotelId,
      ...reviewData,
      createdAt: new Date().toISOString()
    })
    return docRef
  }

  return {
    getHotels,
    addHotel,
    updateHotel,
    deleteHotel,
    getRooms,
    getRoomsByHotel,
    addRoom,
    updateRoom,
    deleteRoom,
    getBookings,
    createBooking,
    getBookingsByGuest,
    updateBookingStatus,
    getReviews,
    getReviewsByHotel,
    addReview
  }
}