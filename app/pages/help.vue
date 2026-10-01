<script setup lang="ts">
import { computed, ref } from "vue";

type Faq = {
  question: string;
  answer: string;
  category: string;
};

const searchQuery = ref("");
const activeCategory = ref("All topics");
const openQuestion = ref<string | null>(null);

const categories = ["All topics", "Bookings", "Payments", "Stays", "Account"];

const faqs: Faq[] = [
  {
    question: "How do I make a booking?",
    answer:
      "Choose a hotel or experience, select your dates and guests, then select Book now. Review the details and complete payment to receive your confirmation by email.",
    category: "Bookings",
  },
  {
    question: "Can I change or cancel my reservation?",
    answer:
      "Open Dashboard, then Bookings to view your reservation. Each property has its own cancellation policy, which is shown before you confirm and on your booking details page.",
    category: "Bookings",
  },
  {
    question: "When will I receive my booking confirmation?",
    answer:
      "Your confirmation appears immediately in Dashboard > Bookings after a successful payment. We also send a copy to the email address on your account.",
    category: "Bookings",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "You can pay securely with the payment methods shown at checkout. The total price, taxes, and any additional fees are displayed before you submit payment.",
    category: "Payments",
  },
  {
    question: "What time is check-in and check-out?",
    answer:
      "Check-in and check-out times vary by property. You can find the exact times in the hotel's Amenities and policies section and in your confirmation.",
    category: "Stays",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Select Log in, choose Forgot password, and enter your account email. We will send instructions to create a new password.",
    category: "Account",
  },
];

const filteredFaqs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return faqs.filter((faq) => {
    const matchesCategory =
      activeCategory.value === "All topics" ||
      faq.category === activeCategory.value;
    const matchesSearch =
      !query || `${faq.question} ${faq.answer}`.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });
});

function toggleQuestion(question: string) {
  openQuestion.value = openQuestion.value === question ? null : question;
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f3ef] font-sans text-[#18253d]">
    <section class="bg-[#0d224a] px-5 pb-12 pt-12 text-white md:pb-16 md:pt-16">
      <div class="mx-auto max-w-5xl">
        <p
          class="text-xs font-semibold uppercase tracking-[0.24em] text-[#80d6c7]"
        >
          SabayStay support
        </p>
        <div class="mt-4 max-w-2xl">
          <h1 class="text-4xl font-bold tracking-tight md:text-5xl">
            How can we help?
          </h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-[#d9e2f1]">
            Find clear answers about bookings, stays, payments, and your
            account.
          </p>
        </div>

        <label class="relative mt-8 block max-w-2xl" for="help-search">
          <span class="sr-only">Search help articles</span>
          <span
            class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#60708d]"
            aria-hidden="true"
            >⌕</span
          >
          <input
            id="help-search"
            v-model="searchQuery"
            type="search"
            placeholder="Search your question..."
            class="w-full rounded-md border border-white/15 bg-white px-11 py-4 text-sm text-[#18253d] outline-none placeholder:text-[#8090a8] focus:ring-2 focus:ring-[#80d6c7]"
          />
        </label>
      </div>
    </section>

    <main class="mx-auto max-w-5xl px-5 py-10 md:py-14">
      <div class="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <aside>
          <p
            class="text-xs font-bold uppercase tracking-[0.16em] text-[#718096]"
          >
            Browse topics
          </p>
          <nav
            class="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1"
            aria-label="FAQ categories"
          >
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              :class="[
                'whitespace-nowrap rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeCategory === category
                  ? 'bg-[#0d224a] font-semibold text-white'
                  : 'text-[#53637c] hover:bg-white hover:text-[#0d224a]',
              ]"
              @click="activeCategory = category"
            >
              {{ category }}
            </button>
          </nav>
        </aside>

        <section aria-labelledby="faq-heading">
          <div
            class="flex items-end justify-between gap-4 border-b border-[#d9d9d4] pb-5"
          >
            <div>
              <p class="text-sm font-semibold text-[#087d72]">
                Frequently asked questions
              </p>
              <h2
                id="faq-heading"
                class="mt-2 text-2xl font-bold tracking-tight text-[#18253d]"
              >
                Common questions, answered
              </h2>
            </div>
            <span class="hidden text-xs text-[#718096] sm:block">
              {{ filteredFaqs.length }}
              {{ filteredFaqs.length === 1 ? "answer" : "answers" }}
            </span>
          </div>

          <div v-if="filteredFaqs.length" class="divide-y divide-[#d9d9d4]">
            <article v-for="faq in filteredFaqs" :key="faq.question">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-6 py-5 text-left"
                :aria-expanded="openQuestion === faq.question"
                @click="toggleQuestion(faq.question)"
              >
                <span
                  class="text-sm font-semibold text-[#263652] md:text-base"
                  >{{ faq.question }}</span
                >
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#bfc6d0] text-lg leading-none text-[#0d224a]"
                  aria-hidden="true"
                >
                  {{ openQuestion === faq.question ? "−" : "+" }}
                </span>
              </button>
              <p
                v-if="openQuestion === faq.question"
                class="-mt-2 max-w-2xl pb-5 pr-12 text-sm leading-7 text-[#65728a]"
              >
                {{ faq.answer }}
              </p>
            </article>
          </div>

          <div v-else class="border-b border-[#d9d9d4] py-12 text-center">
            <p class="font-semibold text-[#263652]">No answers found</p>
            <p class="mt-2 text-sm text-[#65728a]">
              Try another search or choose All topics.
            </p>
          </div>

          <div
            class="mt-10 flex flex-col justify-between gap-4 border border-[#d9d9d4] bg-white p-5 sm:flex-row sm:items-center md:p-6"
          >
            <div>
              <h3 class="font-bold text-[#18253d]">Still need a hand?</h3>
              <p class="mt-1 text-sm text-[#65728a]">
                Our support team is ready to help with your trip.
              </p>
            </div>
            <NuxtLink
              to="/contact"
              class="inline-flex items-center justify-center rounded-md bg-[#087d72] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#066b62]"
            >
              Contact support
            </NuxtLink>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
