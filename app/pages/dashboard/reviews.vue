<script setup lang="ts">
import { definePageMeta } from '#imports'
import { onMounted, ref } from "vue";

definePageMeta({ layout: "user", middleware: "auth" });

interface Review {
  id: string;
  property: string;
  text: string;
  rating: number;
  createdAt: string;
}

const reviewText = ref("");
const rating = ref(5);
const hoverRating = ref(0);
const submitted = ref(false);
const reviews = ref<Review[]>([]);

onMounted(() => {
  const stored = localStorage.getItem("sabaystay-reviews");
  if (stored) {
    try {
      reviews.value = JSON.parse(stored);
    } catch {
      reviews.value = [];
    }
  }
});

function getStarArray(value: number): number[] {
  return Array.from({ length: 5 }, (_, index) => index + 1);
}

function setRating(value: number) {
  rating.value = value;
}

function submitReview() {
  if (!reviewText.value.trim()) return;

  const review: Review = {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `rev-${Date.now()}`,
    property: "The Azure Retreat",
    text: reviewText.value.trim(),
    rating: rating.value,
    createdAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  reviews.value.unshift(review);
  localStorage.setItem("sabaystay-reviews", JSON.stringify(reviews.value));
  reviewText.value = "";
  rating.value = 5;
  submitted.value = true;
  window.setTimeout(() => (submitted.value = false), 2500);
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6 pb-12 text-slate-800 font-sans">
    <div>
      <h1 class="text-3xl font-serif font-bold text-slate-900">Reviews</h1>
      <p class="mt-1 text-sm text-slate-500 font-medium">
        Share your stay experience with future travelers.
      </p>
    </div>

    <!-- Review Form Section -->
    <section class="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm md:p-8">
      <h2 class="text-lg font-bold text-slate-900">
        Write a review for The Azure Retreat
      </h2>
      <form class="mt-6 space-y-5" @submit.prevent="submitReview">
        <div>
          <label class="text-sm font-semibold text-slate-700">Rating</label>
          <div class="mt-2 flex items-center gap-1">
            <button
              v-for="star in getStarArray(5)"
              :key="star"
              type="button"
              class="text-2xl transition"
              :class="
                star <= (hoverRating || rating)
                  ? 'text-amber-500'
                  : 'text-slate-300'
              "
              @mouseenter="hoverRating = star"
              @mouseleave="hoverRating = 0"
              @click="setRating(star)"
            >
              ★
            </button>
          </div>
        </div>

        <label class="block text-sm font-semibold text-slate-700">
          Your Review
          <textarea
            v-model="reviewText"
            rows="4"
            required
            placeholder="Tell us about your experience..."
            class="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#07166b] focus:bg-white"
          />
        </label>

        <div class="flex items-center gap-4">
          <button
            type="submit"
            class="rounded-xl bg-[#07166b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-900 border border-indigo-900"
          >
            Submit Review
          </button>
          <span
            v-if="submitted"
            class="text-sm font-semibold text-emerald-700"
            role="status"
          >
            Review submitted successfully.
          </span>
        </div>
      </form>
    </section>

    <!-- Reviews List Section -->
    <section class="space-y-4">
      <h2 class="text-lg font-bold text-slate-900">Your Reviews</h2>
      
      <div
        v-if="reviews.length === 0"
        class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"
      >
        <p class="text-sm font-medium text-slate-500">
          You haven't submitted any reviews yet.
        </p>
      </div>

      <article
        v-for="review in reviews"
        :key="review.id"
        class="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:shadow-md"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-900">{{ review.property }}</h3>
            <p class="mt-1 text-xs font-medium text-slate-400">{{ review.createdAt }}</p>
          </div>
          <div class="flex gap-0.5 text-amber-500">
            <span
              v-for="star in getStarArray(review.rating)"
              :key="star"
              aria-hidden="true"
            >
              ★
            </span>
          </div>
        </div>
        <p class="mt-3 text-sm leading-relaxed text-slate-600">{{ review.text }}</p>
      </article>
    </section>
  </div>
</template>