<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "~/composables/auth/useAuth";
import { getHotelById } from "~/data/hotels";
import { useNuxtApp, definePageMeta } from "#imports";
import {
  Calendar,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  BedDouble,
  Users,
  User,
  Mail,
  Phone,
  Receipt,
  Download,
  Ban,
  Loader2,
  Building2
} from "lucide-vue-next";

definePageMeta({ layout: "user", middleware: "auth" });

interface Booking {
  id: string;
  property: string;
  location: string;
  dates: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  total: string;
  image: string;
  rating: string;
  roomType: string;
  guests: number;
  facilities: string[];
  checkIn: string;
  checkOut: string;
  nights: number;
  roomPrice: number;
  taxes: number;
  discount: number;
}

const { user } = useAuth();
const { $auth,$db } = useNuxtApp() as any;
const selectedBooking = ref<Booking | null>(null);
const isLoading = ref(true);
const bookingError = ref("");

function getCancelledBookingIds(): string[] {
  try {
    const stored = localStorage.getItem("sabaystay-cancelled-bookings");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setCancelledBookingIds(ids: string[]) {
  localStorage.setItem("sabaystay-cancelled-bookings", JSON.stringify(ids));
}

function isBookingCancelled(bookingId: string): boolean {
  const cancelledIds = getCancelledBookingIds();
  return cancelledIds.includes(bookingId);
}

function getDisplayStatus(booking: Booking): Booking["status"] {
  if (isBookingCancelled(booking.id)) return "Cancelled";
  return booking.status;
}

const bookings = ref<Booking[]>([]);

const guestName = computed(() => user.value?.name || "Guest traveler");
const guestEmail = computed(() => user.value?.email || "guest@example.com");
const guestPhone = computed(() => user.value?.phone || "Not provided");

async function loadBookings() {
  if (!$auth || !$db) {
    isLoading.value = false;
    return;
  }

  const firebaseUser = $auth.currentUser;

  if (!firebaseUser) {
    isLoading.value = false;
    return;
  }

  try {
    const snapshot = await getDocs(
      query(
        collection($db, "bookings"),
        where("userId", "==", firebaseUser.uid),
      ),
    );

    const savedBookings: Booking[] = snapshot.docs.map((bookingDoc) => {
      const data = bookingDoc.data();
      const status = String(data.status || "pending");
      const checkIn = String(data.checkIn || "");
      const checkOut = String(data.checkOut || "");
      const nights = Number(data.nights || 0);
      const roomPrice = Number(data.pricePerNight || 0) * nights;
      const hotel = getHotelById(String(data.hotelId || ""));

      return {
        id: bookingDoc.id,
        property: String(data.hotelName || hotel?.name || "SabayStay property"),
        location: String(data.location || hotel?.location || "Your saved hotel booking"),
        dates: `${checkIn} - ${checkOut}`,
        status: (status.charAt(0).toUpperCase() +
          status.slice(1)) as Booking["status"],
        total: `$${Number(data.total || 0).toLocaleString()}`,
        image: String(data.image || hotel?.image || ""),
        rating: hotel ? `${hotel.rating} / 5` : "Not rated",
        roomType: String(data.roomName || "Room"),
        guests: Number(data.guests || 1),
        facilities: hotel ? hotel.amenities : [],
        checkIn,
        checkOut,
        nights,
        roomPrice,
        taxes: 0,
        discount: 0,
      };
    });

    if (savedBookings.length > 0) {
      const cancelledIds = getCancelledBookingIds();
      bookings.value = savedBookings.map((booking) =>
        cancelledIds.includes(booking.id)
          ? {
              ...booking,
              status: "Cancelled" as Booking["status"],
              total: "$0",
            }
          : booking,
      );
    }
  } catch (error) {
    console.error("Failed to load bookings", error);
    bookingError.value = "Your saved bookings could not be loaded.";
  } finally {
    isLoading.value = false;
  }
}

let unsubscribe = () => {};

onMounted(() => {
  if ($auth && typeof onAuthStateChanged === "function") {
    unsubscribe = onAuthStateChanged($auth, () => {
      void loadBookings();
    });
  } else {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => unsubscribe());

function openDetails(booking: Booking) {
  const displayStatus = getDisplayStatus(booking);
  selectedBooking.value = {
    ...booking,
    status: displayStatus,
    total: displayStatus === "Cancelled" ? "$0" : booking.total,
  };
}

function closeDetails() {
  selectedBooking.value = null;
}

function cancelBooking() {
  if (!selectedBooking.value) return;

  selectedBooking.value.status = "Cancelled";
  selectedBooking.value.total = "$0";

  const cancelledIds = getCancelledBookingIds();
  if (!cancelledIds.includes(selectedBooking.value.id)) {
    cancelledIds.push(selectedBooking.value.id);
    setCancelledBookingIds(cancelledIds);
  }
}

function downloadConfirmation() {
  if (!selectedBooking.value) return;

  const booking = selectedBooking.value;
  const confirmation = [
    "SabayStay Booking Confirmation",
    `Booking ID: ${booking.id}`,
    `Hotel: ${booking.property}`,
    `Room: ${booking.roomType}`,
    `Stay: ${booking.checkIn} - ${booking.checkOut}`,
    `Guest: ${guestName.value}`,
    `Total: ${booking.total}`,
  ].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([confirmation], { type: "text/plain;charset=utf-8" }),
  );
  link.download = `${booking.id}-confirmation.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 text-slate-800 font-sans">
    <div>
      <h1 class="text-3xl font-serif font-bold text-slate-900">Bookings</h1>
      <p class="mt-1 text-sm text-slate-500 font-medium">
        Manage your upcoming stays and travel plans.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center gap-2 text-sm text-slate-500 font-medium">
      <Loader2 class="h-4 w-4 animate-spin text-[#07166b]" />
      Loading bookings...
    </div>

    <!-- Error State -->
    <div v-else-if="bookingError" class="text-sm font-medium text-red-600">
      {{ bookingError }}
    </div>

    <!-- Bookings List -->
    <div v-else class="space-y-4">
      <article
        v-for="booking in bookings"
        :key="booking.id"
        class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {{ booking.id }}
            </p>
            <h2 class="mt-1 text-lg font-bold text-slate-900">
              {{ booking.property }}
            </h2>
            <div class="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500 font-medium">
              <span class="inline-flex items-center gap-1">
                <MapPin class="h-3.5 w-3.5 text-slate-400" />
                {{ booking.location }}
              </span>
              <span>•</span>
              <span class="inline-flex items-center gap-1">
                <Calendar class="h-3.5 w-3.5 text-slate-400" />
                {{ booking.dates }}
              </span>
            </div>
          </div>

          <span
            class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            :class="
              getDisplayStatus(booking) === 'Cancelled'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : getDisplayStatus(booking) === 'Pending'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            "
          >
            <XCircle v-if="getDisplayStatus(booking) === 'Cancelled'" class="h-3.5 w-3.5" />
            <Clock v-else-if="getDisplayStatus(booking) === 'Pending'" class="h-3.5 w-3.5" />
            <CheckCircle2 v-else class="h-3.5 w-3.5" />
            {{ getDisplayStatus(booking) }}
          </span>

        </div>

        <div
          class="mt-5 flex items-center justify-between border-t border-slate-300 pt-4 text-sm"
        >
          <div>
            <span class="text-slate-500 font-medium">Total</span>
            <strong class="ml-2 text-base font-bold text-[#07166b]">{{ booking.total }}</strong>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 font-semibold text-[#07166b] transition hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl"
            @click="openDetails(booking)"
          >
            <Eye class="h-4 w-4" />
            <span>View Details</span>
          </button>
        </div>
      </article>

      <!-- Empty State -->
      <div
        v-if="bookings.length === 0"
        class="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm"
      >
        <Building2 class="mx-auto h-10 w-10 text-slate-300" />
        <p class="mt-3 text-sm font-medium text-slate-600">You have no bookings yet.</p>
      </div>
    </div>

    <!-- Modal Dialog -->
    <div
      v-if="selectedBooking"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 sm:p-8 backdrop-blur-sm"
      @click.self="closeDetails"
    >
      <section
        class="my-8 w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-50 shadow-2xl border border-slate-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
      >
        <div
          class="flex items-start justify-between gap-5 bg-[#07166b] px-6 py-6 text-white sm:px-8 border-b border-indigo-900"
        >
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wider text-indigo-200"
            >
              Booking Details
            </p>
            <h2
              id="booking-details-title"
              class="mt-1 text-2xl font-bold text-white"
            >
              {{ selectedBooking.property }}
            </h2>
            <p class="mt-1 text-xs text-indigo-100/70">{{ selectedBooking.id }}</p>
          </div>
          <button
            type="button"
            class="rounded-full bg-white/10 p-1.5 text-white transition hover:bg-white/20 border border-white/20"
            aria-label="Close booking details"
            @click="closeDetails"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-5 p-5 sm:p-8">
          <div
            class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-5 text-sm"
          >
            <span class="font-semibold text-slate-600"
              >Booking ID: {{ selectedBooking.id }}</span
            >
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
              :class="
                getDisplayStatus(selectedBooking) === 'Cancelled'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : getDisplayStatus(selectedBooking) === 'Pending'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              "
            >
              <XCircle v-if="getDisplayStatus(selectedBooking) === 'Cancelled'" class="h-3.5 w-3.5" />
              <Clock v-else-if="getDisplayStatus(selectedBooking) === 'Pending'" class="h-3.5 w-3.5" />
              <CheckCircle2 v-else class="h-3.5 w-3.5" />
              {{ getDisplayStatus(selectedBooking) }}
            </span>
          </div>

          <!-- Hotel Info Card -->
          <section
            class="grid gap-5 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:grid-cols-[180px_1fr]"
          >
            <img
              :src="selectedBooking.image"
              :alt="selectedBooking.property"
              class="h-36 w-full rounded-xl object-cover sm:h-full border border-slate-300"
            />
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-[#07166b]">
                Hotel Information
              </p>
              <p class="mt-1 text-lg font-bold text-slate-900">
                {{ selectedBooking.property }}
              </p>
              <p class="mt-1 flex items-center gap-1 text-sm text-slate-500 font-medium">
                <MapPin class="h-4 w-4 text-slate-400" />
                {{ selectedBooking.location }}
              </p>
              <p class="mt-2 flex items-center gap-1 text-sm font-semibold text-amber-600">
                <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
                {{ selectedBooking.rating }}
              </p>
            </div>
          </section>

          <div class="grid gap-5 md:grid-cols-2">
            <!-- Room Information -->
            <section class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <BedDouble class="h-5 w-5 text-[#07166b]" />
                <h3 class="font-bold text-slate-900">Room Information</h3>
              </div>
              <dl class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500">Room Type</dt>
                  <dd class="text-right font-semibold text-slate-900">
                    {{ selectedBooking.roomType }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500">Guests</dt>
                  <dd class="flex items-center gap-1 font-semibold text-slate-900">
                    <Users class="h-3.5 w-3.5 text-slate-400" />
                    {{ selectedBooking.guests }}
                  </dd>
                </div>
                <div>
                  <dt class="text-slate-500">Facilities</dt>
                  <dd class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="facility in selectedBooking.facilities"
                      :key="facility"
                      class="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {{ facility }}
                    </span>
                  </dd>
                </div>
              </dl>
            </section>

            <!-- Stay Information -->
            <section class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
              <div class="flex items-center gap-2">
                <Calendar class="h-5 w-5 text-[#07166b]" />
                <h3 class="font-bold text-slate-900">Stay Information</h3>
              </div>
              <dl class="mt-4 space-y-3 text-sm">
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500">Check-in</dt>
                  <dd class="text-right font-semibold text-slate-900">
                    {{ selectedBooking.checkIn }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500">Check-out</dt>
                  <dd class="text-right font-semibold text-slate-900">
                    {{ selectedBooking.checkOut }}
                  </dd>
                </div>
                <div class="flex justify-between gap-4">
                  <dt class="text-slate-500">Number of Nights</dt>
                  <dd class="font-semibold text-slate-900">
                    {{ selectedBooking.nights }}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          <!-- Guest Information -->
          <section class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <User class="h-5 w-5 text-[#07166b]" />
              <h3 class="font-bold text-slate-900">Guest Information</h3>
            </div>
            <div class="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div class="rounded-xl border border-slate-300 bg-slate-50 p-3">
                <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <User class="h-3.5 w-3.5" />
                  Name
                </p>
                <p class="mt-1 font-semibold text-slate-900">{{ guestName }}</p>
              </div>
              <div class="rounded-xl border border-slate-300 bg-slate-50 p-3">
                <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <Mail class="h-3.5 w-3.5" />
                  Email
                </p>
                <p class="mt-1 break-all font-semibold text-slate-900">
                  {{ guestEmail }}
                </p>
              </div>
              <div class="rounded-xl border border-slate-300 bg-slate-50 p-3">
                <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <Phone class="h-3.5 w-3.5" />
                  Phone
                </p>
                <p class="mt-1 font-semibold text-slate-900">
                  {{ guestPhone }}
                </p>
              </div>
            </div>
          </section>

          <!-- Price Summary -->
          <section class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
            <div class="flex items-center gap-2">
              <Receipt class="h-5 w-5 text-[#07166b]" />
              <h3 class="font-bold text-slate-900">Price Summary</h3>
            </div>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between">
                <dt class="text-slate-500">Room Price</dt>
                <dd class="font-medium text-slate-900">${{ selectedBooking.roomPrice.toLocaleString() }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-slate-500">Number of Nights</dt>
                <dd class="font-medium text-slate-900">{{ selectedBooking.nights }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-slate-500">Taxes / Fees</dt>
                <dd class="font-medium text-slate-900">${{ selectedBooking.taxes.toLocaleString() }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-slate-500">Discount</dt>
                <dd class="font-medium text-emerald-700">
                  -${{ selectedBooking.discount.toLocaleString() }}
                </dd>
              </div>
              <div
                class="flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-900"
              >
                <dt>Total</dt>
                <dd>{{ selectedBooking.total }}</dd>
              </div>
            </dl>
          </section>

          <!-- Actions -->
          <div
            class="flex flex-col-reverse justify-end gap-3 border-t border-slate-300 pt-5 sm:flex-row"
          >
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="getDisplayStatus(selectedBooking) === 'Cancelled'"
              @click="cancelBooking"
            >
              <Ban class="h-4 w-4" />
              <span>Cancel Booking</span>
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07166b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-900 border border-indigo-900"
              @click="downloadConfirmation"
            >
              <Download class="h-4 w-4" />
              <span>Download Confirmation</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>