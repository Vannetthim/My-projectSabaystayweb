<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { doc, getDoc } from "firebase/firestore";
import { getHotelById } from "~/data/hotels";
import { useNuxtApp } from "nuxt/app";
import { definePageMeta, useRoute, useRouter } from '#imports';
import { useAuth } from '~/composables/auth/useAuth';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Star,
  Download,
  Ban,
  Loader2,
  BedDouble,
  Users,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Receipt,
  User,
  Mail,
  Phone
} from "lucide-vue-next";

interface BookingDetails {
  property: string;
  location: string;
  status: "Confirmed" | "Pending" | "Cancelled";
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
  specialRequests?: string;
  cancellationPolicy: string;
  paymentMethod: string;
  bookingDate: string;
}

definePageMeta({ layout: "user", middleware: "auth" });

const { $auth, $db } = useNuxtApp() as any;
const route = useRoute();
const router = useRouter();
const { user } = useAuth();
const bookingId = computed(() => String(route.params.id));
const isLoading = ref(true);
const bookingError = ref("");

const booking = ref<BookingDetails>({
  property: "",
  location: "",
  status: "Confirmed",
  image: "",
  rating: "",
  roomType: "",
  guests: 1,
  facilities: [],
  checkIn: "",
  checkOut: "",
  nights: 0,
  roomPrice: 0,
  taxes: 0,
  discount: 0,
  specialRequests: "",
  cancellationPolicy: "Free cancellation up to 48 hours before check-in",
  paymentMethod: "",
  bookingDate: "",
});

const guestName = computed(() => user.value?.name || "Guest traveler");
const guestEmail = computed(() => user.value?.email || "guest@example.com");
const guestPhone = computed(() => user.value?.phone || "Not provided");
const total = computed(
  () => booking.value.roomPrice + booking.value.taxes - booking.value.discount,
);
const displayStatus = computed<BookingDetails["status"]>(() => {
  const cancelledIds = getCancelledBookingIds();
  if (cancelledIds.includes(bookingId.value)) return "Cancelled";
  return booking.value.status;
});

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

async function loadBooking() {
  if (!$db) {
    isLoading.value = false;
    return;
  }

  try {
    const docSnap = await getDoc(doc($db, "bookings", bookingId.value));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const hotel = getHotelById(String(data.hotelId || ""));
      const nights = Number(data.nights || 0);
      const roomPrice = Number(data.pricePerNight || 0) * nights;

      booking.value = {
        property: String(data.hotelName || hotel?.name || "SabayStay property"),
        location: hotel ? `${hotel.location}` : "",
        status: (String(data.status || "pending").charAt(0).toUpperCase() +
          String(data.status || "pending").slice(1)) as BookingDetails["status"],
        image: hotel?.heroImage || "",
        rating: hotel ? `${hotel.rating} / 5` : "",
        roomType: String(data.roomName || "Room"),
        guests: Number(data.guests || 1),
        facilities: hotel
          ? hotel.amenities
          : ["Ocean view", "King bed", "Breakfast included", "Wi-Fi"],
        checkIn: String(data.checkIn || ""),
        checkOut: String(data.checkOut || ""),
        nights,
        roomPrice,
        taxes: Number(data.taxes || 0),
        discount: Number(data.discount || 0),
        specialRequests: String(data.specialRequests || ""),
        cancellationPolicy:
          "Free cancellation up to 48 hours before check-in",
        paymentMethod: String(data.paymentMethod || ""),
        bookingDate: data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "",
      };
    } else {
      bookingError.value = "Booking not found.";
    }
  } catch (error) {
    console.error("Failed to load booking", error);
    bookingError.value = "Your booking could not be loaded.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadBooking();
});

function cancelBooking() {
  booking.value.status = "Cancelled";
  const cancelledIds = getCancelledBookingIds();
  if (!cancelledIds.includes(bookingId.value)) {
    cancelledIds.push(bookingId.value);
    setCancelledBookingIds(cancelledIds);
  }
}

function downloadConfirmation() {
  const details = [
    "SabayStay Booking Confirmation",
    `Booking ID: ${bookingId.value}`,
    `Hotel: ${booking.value.property}`,
    `Room: ${booking.value.roomType}`,
    `Stay: ${booking.value.checkIn} - ${booking.value.checkOut}`,
    `Guest: ${guestName.value}`,
    `Total: $${total.value.toLocaleString()}`,
  ].join("\n");
  const url = URL.createObjectURL(new Blob([details], { type: "text/plain" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${bookingId.value}-confirmation.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

const statusConfig = {
  Confirmed: {
    bg: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  Pending: {
    bg: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  Cancelled: {
    bg: "bg-red-100 text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },
};
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <div v-if="isLoading" class="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 class="h-4 w-4 animate-spin text-[#07166b]" />
      Loading booking details...
    </div>
    <div v-else-if="bookingError" class="text-sm font-medium text-red-600">
      {{ bookingError }}
    </div>
    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <NuxtLink
            to="/dashboard/bookings"
            class="inline-flex items-center gap-2 text-sm font-semibold text-[#07166b] transition hover:text-indigo-800"
          >
            <ArrowLeft class="h-4 w-4" />
            Back to bookings
          </NuxtLink>
          <h1 class="mt-3 text-3xl font-bold text-slate-900">Booking Details</h1>
          <p class="mt-1 text-sm text-slate-500">Booking ID: {{ bookingId }}</p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          :class="statusConfig[displayStatus].bg"
        >
          <component :is="statusConfig[displayStatus].icon" class="h-4 w-4" />
          {{ displayStatus }}
        </span>
      </div>

      <section
        class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
      >
        <div class="grid md:grid-cols-[300px_1fr]">
          <div class="relative h-64 md:h-full">
            <img
              :src="booking.image"
              :alt="booking.property"
              class="h-full w-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent md:bg-gradient-to-r"
            />
          </div>
          <div class="p-6 sm:p-8">
            <p
              class="text-xs font-semibold uppercase tracking-wider text-[#07166b]"
            >
              Hotel Information
            </p>
            <h2 class="mt-2 text-3xl font-black text-slate-900">
              {{ booking.property }}
            </h2>
            <div
              class="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600"
            >
              <span class="flex items-center gap-1.5">
                <MapPin class="h-4 w-4 text-slate-400" />
                {{ booking.location }}
              </span>
              <span
                class="flex items-center gap-1.5 font-semibold text-amber-600"
              >
                <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
                {{ booking.rating }}
              </span>
            </div>
            <div class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="facility in booking.facilities.slice(0, 4)"
                :key="facility"
                class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {{ facility }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-5 md:grid-cols-2">
        <!-- Room Information -->
        <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div class="flex items-center gap-2">
            <BedDouble class="h-5 w-5 text-[#07166b]" />
            <h2 class="text-lg font-bold text-slate-900">Room Information</h2>
          </div>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Room Type</dt>
              <dd class="text-right font-semibold text-slate-900">
                {{ booking.roomType }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Guests</dt>
              <dd class="flex items-center gap-1 font-semibold text-slate-900">
                <Users class="h-3.5 w-3.5 text-slate-400" />
                {{ booking.guests }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Number of Nights</dt>
              <dd class="font-semibold text-slate-900">{{ booking.nights }}</dd>
            </div>
          </dl>
        </section>

        <!-- Stay Information -->
        <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div class="flex items-center gap-2">
            <Calendar class="h-5 w-5 text-[#07166b]" />
            <h2 class="text-lg font-bold text-slate-900">Stay Information</h2>
          </div>
          <dl class="mt-4 space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Check-in</dt>
              <dd class="text-right font-semibold text-slate-900">
                {{ booking.checkIn }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Check-out</dt>
              <dd class="text-right font-semibold text-slate-900">
                {{ booking.checkOut }}
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-slate-500">Booking Date</dt>
              <dd class="text-right font-semibold text-slate-900">
                {{ booking.bookingDate }}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <!-- Guest Information -->
      <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center gap-2">
          <User class="h-5 w-5 text-[#07166b]" />
          <h2 class="text-lg font-bold text-slate-900">Guest Information</h2>
        </div>
        <div class="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <User class="h-3.5 w-3.5" />
              Name
            </p>
            <p class="mt-1 font-semibold text-slate-900">{{ guestName }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <Mail class="h-3.5 w-3.5" />
              Email
            </p>
            <p class="mt-1 break-all font-semibold text-slate-900">
              {{ guestEmail }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <Phone class="h-3.5 w-3.5" />
              Phone
            </p>
            <p class="mt-1 font-semibold text-slate-900">{{ guestPhone }}</p>
          </div>
        </div>
      </section>

      <!-- Additional Details -->
      <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center gap-2">
          <FileText class="h-5 w-5 text-[#07166b]" />
          <h2 class="text-lg font-bold text-slate-900">Additional Details</h2>
        </div>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <FileText class="h-3.5 w-3.5" />
              Special Requests
            </p>
            <p class="mt-1 text-sm text-slate-900">
              {{ booking.specialRequests || "No special requests" }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <ShieldCheck class="h-3.5 w-3.5" />
              Cancellation Policy
            </p>
            <p class="mt-1 text-sm text-slate-900">
              {{ booking.cancellationPolicy }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <CreditCard class="h-3.5 w-3.5" />
              Payment Method
            </p>
            <p class="mt-1 text-sm text-slate-900">
              {{ booking.paymentMethod }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p class="flex items-center gap-1 text-xs uppercase tracking-wider text-slate-500">
              <Clock class="h-3.5 w-3.5" />
              Booking Status
            </p>
            <p class="mt-1 text-sm font-semibold text-slate-900">
              {{ displayStatus }}
            </p>
          </div>
        </div>
      </section>

      <!-- Price Summary -->
      <section class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div class="flex items-center gap-2">
          <Receipt class="h-5 w-5 text-[#07166b]" />
          <h2 class="text-lg font-bold text-slate-900">Price Summary</h2>
        </div>
        <dl class="mt-4 max-w-md space-y-3 text-sm">
          <div class="flex justify-between">
            <dt class="text-slate-500">
              Room Price ({{ booking.nights }} nights)
            </dt>
            <dd class="font-medium text-slate-900">
              ${{ booking.roomPrice.toLocaleString() }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Taxes / Fees</dt>
            <dd class="font-medium text-slate-900">
              ${{ booking.taxes.toLocaleString() }}
            </dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-slate-500">Discount</dt>
            <dd class="font-medium text-emerald-700">
              -${{ booking.discount.toLocaleString() }}
            </dd>
          </div>
          <div
            class="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"
          >
            <dt>Total</dt>
            <dd>${{ total.toLocaleString() }}</dd>
          </div>
        </dl>
      </section>

      <!-- Action Buttons -->
      <div
        class="flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pb-8 pt-2 sm:flex-row"
      >
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="displayStatus === 'Cancelled'"
          @click="cancelBooking"
        >
          <Ban class="h-4 w-4" />
          <span>Cancel Booking</span>
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#07166b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-900"
          @click="downloadConfirmation"
        >
          <Download class="h-4 w-4" />
          <span>Download Confirmation</span>
        </button>
      </div>
    </template>
  </div>
</template>