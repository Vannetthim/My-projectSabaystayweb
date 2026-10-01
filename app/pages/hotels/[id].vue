<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { 
  addDoc, 
  collection, 
  doc, 
  getDocs, 
  onSnapshot, 
  or,
  query, 
  serverTimestamp, 
  where, 
  type Firestore 
} from "firebase/firestore";
import { navigateTo, useNuxtApp, useRoute } from "#imports";
import {
  ArrowLeft,
  BedDouble,
  Check,
  Heart,
  MapPin,
  Star,
  Users,
  Loader2,
  Sparkles,
  Calendar,
} from "lucide-vue-next";
import { useFavorites } from "~/composables/user/useFavorites";
import { useAuth } from "~/composables/auth/useAuth";

interface HotelDetails {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  gallery: string[];
  amenities: string[];
  badge?: string;
}

interface HotelRoom {
  id: string;
  title: string;
  type: string;
  price: number;
  status: string;
  beds: string;
  capacity: number;
  size: string;
  amenity: string;
  description: string;
  image: string;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85";

const route = useRoute();
const { $db } = useNuxtApp();
const db = $db as Firestore | undefined;
const { isFavorite, toggleFavorite } = useFavorites();
const { user, isLoggedIn } = useAuth();

const hotel = ref<HotelDetails | null>(null);
const rooms = ref<HotelRoom[]>([]);
const loading = ref(true);
const error = ref("");
const selectedRoomId = ref("");
const bookingError = ref("");
const bookingSuccess = ref("");
const isBooking = ref(false);
const checkIn = ref("");
const checkOut = ref("");
const guests = ref(1);
let stopHotelListener: (() => void) | undefined;
let stopRoomsListener: (() => void) | undefined;

const hotelId = computed(() => String(route.params.id || ""));
const availableRooms = computed(() =>
  rooms.value.filter((room) => !room.status || room.status === "Available"),
);
const selectedRoom = computed(() =>
  availableRooms.value.find((room) => room.id === selectedRoomId.value) || availableRooms.value[0],
);
const bookingNights = computed(() => {
  if (!checkIn.value || !checkOut.value) return 0;
  const difference = new Date(checkOut.value).getTime() - new Date(checkIn.value).getTime();
  return Math.max(0, Math.ceil(difference / 86_400_000));
});
const bookingTotal = computed(() => (selectedRoom.value?.price || lowestPrice.value) * bookingNights.value);
const lowestPrice = computed(() => {
  const prices = availableRooms.value.map((room) => room.price).filter((price) => price > 0);
  return prices.length ? Math.min(...prices) : hotel.value?.price || 0;
});
const gallery = computed(() => {
  if (!hotel.value) return [];
  return [...new Set([hotel.value.image, ...hotel.value.gallery].filter(Boolean))];
});

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return [];
}

function cleanImage(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim().replace(/[\[\]"']/g, "") : fallbackImage;
}

function loadHotel() {
  stopHotelListener?.();
  stopRoomsListener?.();
  hotel.value = null;
  rooms.value = [];
  selectedRoomId.value = "";
  error.value = "";
  loading.value = true;

  if (!db || !hotelId.value) {
    error.value = "This hotel could not be loaded.";
    loading.value = false;
    return;
  }

  stopHotelListener = onSnapshot(
    doc(db, "hotels", hotelId.value),
    (snapshot) => {
      if (!snapshot.exists()) {
        error.value = "This hotel is no longer available.";
        loading.value = false;
        return;
      }

      const data = snapshot.data();
      const loadedHotel: HotelDetails = {
        id: snapshot.id,
        name: String(data.name || "Unnamed hotel"),
        location: String(data.location || data.city || "Location not specified"),
        address: String(data.address || data.location || data.city || ""),
        description: String(data.description || "Details about this stay will be available soon."),
        price: Number(data.price || 0),
        rating: Number(data.rating || 0),
        image: cleanImage(data.imageUrl || data.image),
        gallery: asStringList(data.gallery),
        amenities: asStringList(data.amenities),
        badge: data.region || data.badge || undefined,
      };
      hotel.value = loadedHotel;
      loading.value = false;

      // Listen to rooms matching EITHER hotelId OR hotelName
      stopRoomsListener?.();
      stopRoomsListener = onSnapshot(
        query(
          collection(db, "rooms"), 
          or(
            where("hotelId", "==", hotelId.value),
            where("hotelName", "==", loadedHotel.name)
          )
        ),
        (roomSnapshot) => {
          rooms.value = roomSnapshot.docs.map((room) => {
            const roomData = room.data();
            return {
              id: room.id,
              title: String(roomData.title || roomData.type || "Room"),
              type: String(roomData.type || "Room"),
              price: Number(roomData.price || 0),
              status: String(roomData.status || "Available"),
              beds: String(roomData.beds || "Bed details available on request"),
              capacity: Number(roomData.capacity || 1),
              size: String(roomData.size || ""),
              amenity: String(roomData.amenity || ""),
              description: String(roomData.description || ""),
              image: cleanImage(roomData.image),
            };
          });
          if (!rooms.value.some((room) => room.id === selectedRoomId.value)) {
            selectedRoomId.value = rooms.value[0]?.id || "";
          }
        },
        () => {
          rooms.value = [];
        },
      );
    },
    () => {
      error.value = "We could not load this hotel right now.";
      loading.value = false;
    },
  );
}

function handleFavorite() {
  if (!hotel.value) return;
  toggleFavorite({
    id: hotel.value.id,
    name: hotel.value.name,
    location: hotel.value.location,
    price: lowestPrice.value,
    image: hotel.value.image,
    badge: hotel.value.badge,
    amenities: hotel.value.amenities,
  });
}

async function bookNow() {
  bookingError.value = "";
  bookingSuccess.value = "";
  if (!isLoggedIn.value || !user.value?.id) {
    await navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }
  if (!db || !hotel.value) {
    bookingError.value = "Booking is temporarily unavailable. Please try again.";
    return;
  }
  if (!checkIn.value || !checkOut.value || bookingNights.value < 1) {
    bookingError.value = "Choose a valid check-in and check-out date.";
    return;
  }
  if (guests.value < 1 || (selectedRoom.value && guests.value > selectedRoom.value.capacity)) {
    bookingError.value = "Choose a valid number of guests for this room.";
    return;
  }

  const currentHotel = hotel.value;
  const room = selectedRoom.value;
  isBooking.value = true;

  try {
    const price = room?.price || lowestPrice.value;
    const total = price * bookingNights.value;
    const bookingRef = await addDoc(collection(db, "bookings"), {
      userId: user.value.id,
      guestName: user.value.name || "Guest traveler",
      guestEmail: user.value.email || "",
      hotelId: currentHotel.id,
      hotelName: currentHotel.name,
      location: currentHotel.location,
      image: currentHotel.image,
      roomId: room?.id || "",
      roomName: room?.title || "Standard room",
      guests: guests.value,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      nights: bookingNights.value,
      pricePerNight: price,
      total,
      totalPrice: total,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    const userMessage = `Your request for ${currentHotel.name}${room ? ` (${room.title})` : ""} was received. We will notify you when it is confirmed.`;

    const adminSnapshot = await getDocs(
      query(collection(db, "users"), where("role", "==", "admin"))
    );

    const notificationPromises: Promise<any>[] = [
      addDoc(collection(db, "notifications"), {
        recipientId: user.value.id,
        actorId: user.value.id,
        recipientRole: "user",
        bookingId: bookingRef.id,
        type: "booking",
        title: "Booking request received",
        message: userMessage,
        isRead: false,
        createdAt: serverTimestamp(),
      }),
    ];

    adminSnapshot.forEach((adminDoc) => {
      notificationPromises.push(
        addDoc(collection(db, "notifications"), {
          recipientId: adminDoc.id,
          actorId: user.value.id,
          recipientRole: "admin",
          bookingId: bookingRef.id,
          type: "booking",
          title: "New booking request",
          message: `${user.value.name || user.value.email || "A guest"} requested ${currentHotel.name}${room ? ` — ${room.title}` : ""}.`,
          isRead: false,
          createdAt: serverTimestamp(),
        })
      );
    });

    await Promise.all(notificationPromises);
    bookingSuccess.value = "Booking request sent. You can view it in Dashboard → Bookings.";
  } catch (bookingFailure) {
    console.error("Unable to create booking", bookingFailure);
    bookingError.value = "We could not create your booking. Please try again.";
  } finally {
    isBooking.value = false;
  }
}

onMounted(loadHotel);
watch(hotelId, loadHotel);
onUnmounted(() => {
  stopHotelListener?.();
  stopRoomsListener?.();
});
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <main class="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Top Navigation -->
      <NuxtLink
        to="/hotels"
        class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-amber-400"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to hotels
      </NuxtLink>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 class="h-8 w-8 animate-spin text-amber-500 mb-3" />
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading hotel details...</p>
      </div>

      <!-- Error State -->
      <section v-else-if="error" class="mx-auto mt-12 max-w-xl rounded-none border border-white/10 bg-slate-900/80 p-10 text-center shadow-2xl backdrop-blur-xl">
        <h1 class="text-2xl font-extrabold text-white">Hotel unavailable</h1>
        <p class="mt-2 text-sm text-slate-400">{{ error }}</p>
        <NuxtLink
          to="/hotels"
          class="mt-6 inline-flex rounded-none bg-amber-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 transition-colors hover:bg-amber-400"
        >
          Browse hotels
        </NuxtLink>
      </section>

      <template v-else-if="hotel">
        <!-- Gallery Grid -->
        <section class="mt-6 grid gap-3 md:grid-cols-4 md:grid-rows-2">
          <div class="relative overflow-hidden md:col-span-2 md:row-span-2 group">
            <img :src="gallery[0]" :alt="hotel.name" class="h-72 w-full rounded-none object-cover transition-transform duration-700 group-hover:scale-105 md:h-full" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          </div>
          <div v-for="(image, index) in gallery.slice(1, 5)" :key="image" class="relative hidden overflow-hidden md:block group">
            <img :src="image" :alt="`${hotel.name} photo ${index + 2}`" class="h-36 w-full rounded-none object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-slate-950/20 transition-opacity group-hover:opacity-0" />
          </div>
        </section>

        <!-- Main Content & Sidebar -->
        <div class="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          
          <!-- Left Details Column -->
          <section>
            <div class="flex items-start justify-between gap-4">
              <div>
                <div v-if="hotel.badge" class="inline-flex items-center gap-1.5 rounded-none bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/20 mb-2">
                  <Sparkles class="h-3 w-3" />
                  <span>{{ hotel.badge }}</span>
                </div>
                <h1 class="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">{{ hotel.name }}</h1>
                <p class="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin class="h-4 w-4 text-amber-400/80 shrink-0" />
                  <span>{{ hotel.location }}</span>
                </p>
              </div>

              <button
                type="button"
                :aria-label="isFavorite(hotel.id) ? 'Remove from favorites' : 'Save to favorites'"
                class="flex h-11 w-11 items-center justify-center rounded-none border border-white/10 bg-slate-900/80 text-slate-300 backdrop-blur-md transition-all hover:border-amber-500/40 hover:text-rose-400 active:scale-95"
                @click="handleFavorite"
              >
                <Heart class="h-5 w-5" :class="isFavorite(hotel.id) ? 'fill-rose-500 text-rose-500' : ''" />
              </button>
            </div>

            <div class="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
              <span class="text-white">{{ hotel.rating ? hotel.rating.toFixed(1) : 'New' }}</span>
              <span class="font-normal text-slate-500">· Overall guest rating</span>
            </div>

            <!-- About Section -->
            <section id="rooms" class="mt-10 border-t border-white/10 pt-8">
              <h2 class="text-lg font-bold uppercase tracking-wider text-white">About this stay</h2>
              <p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 font-light">{{ hotel.description }}</p>
              <p v-if="hotel.address" class="mt-4 text-xs font-medium text-slate-400">{{ hotel.address }}</p>
            </section>

            <!-- Amenities Section -->
            <section v-if="hotel.amenities.length" class="mt-10 border-t border-white/10 pt-8">
              <h2 class="text-lg font-bold uppercase tracking-wider text-white">What this place offers</h2>
              <ul class="mt-4 grid gap-3 sm:grid-cols-2">
                <li v-for="amenity in hotel.amenities" :key="amenity" class="flex items-center gap-2.5 text-xs text-slate-300">
                  <div class="flex h-5 w-5 items-center justify-center rounded-none bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Check class="h-3 w-3" />
                  </div>
                  <span>{{ amenity }}</span>
                </li>
              </ul>
            </section>

            <!-- Available Rooms Section -->
            <section class="mt-10 border-t border-white/10 pt-8">
              <h2 class="text-lg font-bold uppercase tracking-wider text-white">Available Rooms</h2>
              <p class="mt-1 text-xs text-slate-400">Choose your room layout for booking.</p>

              <div v-if="availableRooms.length" class="mt-6 space-y-4">
                <button
                  v-for="room in availableRooms"
                  :key="room.id"
                  type="button"
                  class="grid w-full gap-4 rounded-none border p-4 text-left transition-all duration-300 sm:grid-cols-[140px_1fr_auto] sm:items-center"
                  :class="selectedRoom?.id === room.id ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/5' : 'border-white/10 bg-slate-900/60 hover:border-white/20'"
                  @click="selectedRoomId = room.id"
                >
                  <img :src="room.image" :alt="room.title" class="h-28 w-full rounded-none object-cover sm:h-24" />
                  <div>
                    <h3 class="font-bold text-white text-base">{{ room.title }}</h3>
                    <p class="mt-1 text-xs text-slate-400">{{ room.beds }}<span v-if="room.size"> · {{ room.size }}</span></p>
                    <p v-if="room.amenity" class="mt-2 text-xs text-amber-400/80">{{ room.amenity }}</p>
                  </div>
                  <div class="text-left sm:text-right">
                    <p class="text-xl font-extrabold text-white">${{ room.price.toLocaleString() }}</p>
                    <p class="text-[11px] text-slate-400">per night</p>
                  </div>
                </button>
              </div>
              <p v-else class="mt-5 rounded-none border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-400">
                Room availability will be updated soon. Contact property management for current options.
              </p>
            </section>
          </section>

          <!-- Right Booking Sidebar -->
          <aside class="h-fit rounded-none border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl lg:sticky lg:top-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Starting from</span>
            <p class="mt-1 text-3xl font-extrabold text-white">
              ${{ lowestPrice.toLocaleString() }}
              <span class="text-xs font-normal text-slate-400">/ night</span>
            </p>
            
            <div class="my-5 border-t border-white/10" />

            <div class="space-y-2 text-xs text-slate-300">
              <p class="flex items-center gap-2">
                <BedDouble class="h-4 w-4 text-amber-400" />
                <span>{{ availableRooms.length }} available room{{ availableRooms.length === 1 ? '' : 's' }}</span>
              </p>
              <p class="flex items-center gap-2">
                <Users class="h-4 w-4 text-amber-400" />
                <span>Room capacity shown per selection</span>
              </p>
            </div>

            <div v-if="selectedRoom" class="mt-5 rounded-none border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-semibold text-amber-400">
              Selected: {{ selectedRoom.title }}
            </div>

            <div class="mt-5 grid grid-cols-2 gap-2">
              <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Check-in
                <div class="relative mt-1">
                  <input
                    v-model="checkIn"
                    type="date"
                    class="w-full rounded-none border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                  />
                </div>
              </label>

              <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Check-out
                <div class="relative mt-1">
                  <input
                    v-model="checkOut"
                    type="date"
                    :min="checkIn || undefined"
                    class="w-full rounded-none border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                  />
                </div>
              </label>
            </div>

            <label class="mt-4 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Guests
              <input
                v-model.number="guests"
                type="number"
                min="1"
                :max="selectedRoom?.capacity || 8"
                class="mt-1 w-full rounded-none border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
              />
            </label>

            <div v-if="bookingNights" class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-white">
              <span>{{ bookingNights }} night{{ bookingNights === 1 ? '' : 's' }}</span>
              <span class="text-amber-400 text-sm">${{ bookingTotal.toLocaleString() }} total</span>
            </div>

            <button
              type="button"
              class="mt-6 w-full rounded-none border border-amber-500/30 bg-amber-500 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isBooking"
              @click="bookNow"
            >
              <span v-if="isBooking" class="flex items-center justify-center gap-2">
                <Loader2 class="h-4 w-4 animate-spin" />
                Sending request...
              </span>
              <span v-else>Book Now</span>
            </button>

            <p v-if="bookingSuccess" class="mt-3 text-center text-xs font-semibold text-emerald-400">{{ bookingSuccess }}</p>
            <p v-if="bookingError" class="mt-3 text-center text-xs font-semibold text-rose-400">{{ bookingError }}</p>
            <p class="mt-4 text-center text-[10px] text-slate-500">Prices and availability subject to room configuration.</p>
          </aside>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* Custom Webkit Styling for Date Pickers on Dark Theme */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>