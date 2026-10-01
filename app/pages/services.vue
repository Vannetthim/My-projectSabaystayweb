<script setup lang="ts">
const services = [
  {
    number: "01",
    label: "Arrive in comfort",
    title: "Airport Transfers",
    image:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=900&q=85",
    description:
      "Begin your escape the moment you land. Our private transfers connect you to the resort with a professional driver, luggage assistance, and a smooth welcome.",
    detail: "Private vehicles and personal welcome",
  },
  {
    number: "02",
    label: "Make it yours",
    title: "Personal Concierge",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",
    description:
      "From restaurant reservations to a surprise celebration, your dedicated concierge is here to shape the details around your perfect stay.",
    detail: "Thoughtful planning, whenever you need it",
  },
  {
    number: "03",
    label: "Restore and renew",
    title: "Spa & Wellness",
    image:
      "https://images.unsplash.com/photo-1544161515-81205f8abecc?auto=format&fit=crop&w=900&q=85",
    description:
      "Slow down with restorative treatments, quiet rituals, and wellness experiences inspired by the natural rhythm of your destination.",
    detail: "Signature treatments and mindful moments",
  },
  {
    number: "04",
    label: "Taste the destination",
    title: "Private Dining",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2cab2707d?auto=format&fit=crop&w=900&q=85",
    description:
      "Enjoy local ingredients and thoughtful menus in a setting made just for you, from a quiet terrace breakfast to an unforgettable dinner under the stars.",
    detail: "Menus crafted around your occasion",
  },
  {
    number: "05",
    label: "Go beyond the resort",
    title: "Curated Experiences",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85",
    description:
      "Discover hidden beaches, local culture, and the stories that make each destination special with experiences selected by people who know it best.",
    detail: "Local guides and memorable days out",
  },
  {
    number: "06",
    label: "Celebrate beautifully",
    title: "Events & Celebrations",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=85",
    description:
      "Let our events team bring your moment to life with a beautiful setting, considered details, and warm service from the first idea to the final toast.",
    detail: "Weddings, anniversaries, and intimate gatherings",
  },
];
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fc] font-sans text-[#18253d]">
    <header class="relative overflow-hidden bg-[#243f8f] text-white">
      <div
        class="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[36px] border-white/10"
        aria-hidden="true"
      />
      <div
        class="relative mx-auto w-[min(1100px,calc(100%-40px))] py-16 md:py-20"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.24em] text-[#9fe4d7]"
        >
          The SabayStay difference
        </p>
        <div class="mt-5 max-w-2xl">
          <h1
            class="m-0 text-4xl font-bold leading-tight tracking-tight md:text-6xl"
          >
            Everything you need for an unforgettable stay.
          </h1>
          <p
            class="mt-5 max-w-xl text-sm leading-7 text-[#dce6f9] md:text-base"
          >
            Arrive, settle in, and let us take care of the details. Our services
            are designed to make every moment of your escape feel effortless.
          </p>
        </div>
      </div>
    </header>

    <main class="mx-auto w-[min(1100px,calc(100%-40px))] pb-20">
      <div
        class="grid border-x border-b border-[#e3e7ef] bg-white sm:grid-cols-3"
      >
        <div
          class="border-b border-[#e3e7ef] px-6 py-5 sm:border-b-0 sm:border-r"
        >
          <p class="text-2xl font-bold text-[#243f8f]">24/7</p>
          <p class="mt-1 text-xs text-[#718096]">Concierge care</p>
        </div>
        <div
          class="border-b border-[#e3e7ef] px-6 py-5 sm:border-b-0 sm:border-r"
        >
          <p class="text-2xl font-bold text-[#243f8f]">6 ways</p>
          <p class="mt-1 text-xs text-[#718096]">To enrich your stay</p>
        </div>
        <div class="px-6 py-5">
          <p class="text-2xl font-bold text-[#087d72]">1:1</p>
          <p class="mt-1 text-xs text-[#718096]">Personalized attention</p>
        </div>
      </div>

      <div class="mb-7 mt-14 flex items-end justify-between gap-5">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-[#087d72]"
          >
            Our services
          </p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
            Designed around your stay
          </h2>
        </div>
        <p
          class="hidden max-w-xs text-right text-sm leading-6 text-[#718096] md:block"
        >
          From the first welcome to the last goodnight, every detail is
          considered.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-5 max-[700px]:grid-cols-1">
        <article
          v-for="service in services"
          :key="service.title"
          class="group flex flex-col overflow-hidden border border-[#e3e7ef] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="relative overflow-hidden">
            <img
              :src="service.image"
              :alt="service.title"
              class="block h-52 w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span
              class="absolute left-4 top-4 bg-[#0d224a] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white"
              >{{ service.number }}</span
            >
          </div>
          <div class="flex flex-1 flex-col p-6">
            <p
              class="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#087d72]"
            >
              {{ service.label }}
            </p>
            <h2
              class="mb-3 mt-3 text-lg font-bold leading-[1.25] text-[#18253d]"
            >
              {{ service.title }}
            </h2>
            <p class="text-sm leading-6 text-[#65728a]">
              {{ service.description }}
            </p>
            <div class="mt-auto border-t border-[#edf0f4] pt-5">
              <p class="text-xs font-semibold text-[#53637c]">
                {{ service.detail }}
              </p>
              <NuxtLink
                to="/contact"
                class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#243f8f] hover:text-[#087d72]"
              >
                Learn more
                <span
                  aria-hidden="true"
                  class="transition-transform group-hover:translate-x-1"
                  >-&gt;</span
                >
              </NuxtLink>
            </div>
          </div>
        </article>
      </div>

      <section
        class="mt-14 flex flex-col justify-between gap-8 bg-[#0d224a] px-7 py-9 text-white md:flex-row md:items-center md:px-10"
      >
        <div class="max-w-xl">
          <p
            class="text-xs font-semibold uppercase tracking-[0.2em] text-[#9fe4d7]"
          >
            Plan with confidence
          </p>
          <h2 class="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
            Need help choosing a service?
          </h2>
          <p class="mt-3 text-sm leading-6 text-[#cbd7ea]">
            Tell us what you are planning and we will point you in the right
            direction.
          </p>
        </div>
        <NuxtLink
          to="/contact"
          class="inline-flex shrink-0 items-center justify-center bg-[#9fe4d7] px-5 py-3 text-sm font-bold text-[#0d224a] transition-colors hover:bg-white"
          >Talk to our team</NuxtLink
        >
      </section>
    </main>
  </div>
</template>
