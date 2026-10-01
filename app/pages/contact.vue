<script setup lang="ts">
import { ref } from "vue";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-vue-next";

interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  message: string;
}

const form = ref<ContactForm>({
  fullName: "",
  email: "",
  phone: "",
  message: "",
});

const isSubmitting = ref(false);
const submitStatus = ref<"idle" | "success" | "error">("idle");

const submitInquiry = async () => {
  isSubmitting.value = true;
  submitStatus.value = "idle";

  try {
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    console.log("Form submitted:", form.value);
    submitStatus.value = "success";

    form.value = {
      fullName: "",
      email: "",
      phone: "",
      message: "",
    };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    submitStatus.value = "error";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
    <!-- Header Banner -->
    <header class="relative border-b border-white/10 bg-slate-900/60 overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_70%)]" />
      
      <div class="relative z-10 mx-auto max-w-7xl">
        <span class="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 backdrop-blur-md">
          <MessageSquare class="h-3.5 w-3.5" />
          Get In Touch
        </span>
        <h1 class="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          We'd love to hear from you
        </h1>
        <p class="mt-4 max-w-2xl text-sm font-light leading-relaxed text-slate-300 sm:text-base">
          Have a question about a stay or need assistance with your booking? Send us a message and our dedicated concierge team will get back to you within 24 hours.
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="grid gap-8 lg:grid-cols-12 lg:items-start">
        
        <!-- Contact Info Sidebar -->
        <aside class="space-y-6 lg:col-span-5">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
              Direct Channels
            </span>
            <h2 class="mt-1 text-2xl font-extrabold tracking-tight text-white">
              Contact Details
            </h2>
            <p class="mt-1 text-xs font-light text-slate-400">
              Reach out directly or visit our office in Phnom Penh.
            </p>
          </div>

          <div class="space-y-4">
            <!-- Visit Card -->
            <div class="group flex items-start gap-4 border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                <MapPin class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Visit Us
                </h3>
                <p class="mt-1 text-sm font-medium text-white">
                  123 Sabaystay, Phnom Penh City
                </p>
                <p class="text-xs font-light text-slate-400">Cambodia</p>
              </div>
            </div>

            <!-- Call Card -->
            <div class="group flex items-start gap-4 border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                <Phone class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Call Us
                </h3>
                <a href="tel:+85512345678" class="mt-1 block text-sm font-medium text-white transition-colors hover:text-amber-400">
                  +855 12 345 678
                </a>
                <p class="text-xs font-light text-slate-400">Mon - Sun, 8:00 AM - 8:00 PM</p>
              </div>
            </div>

            <!-- Email Card -->
            <div class="group flex items-start gap-4 border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                <Mail class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Email Us
                </h3>
                <a href="mailto:info@sabaystay.com" class="mt-1 block text-sm font-medium text-white transition-colors hover:text-amber-400">
                  info@sabaystay.com
                </a>
                <p class="text-xs font-light text-slate-400">24/7 online support</p>
              </div>
            </div>
          </div>
        </aside>

        <!-- Form Section -->
        <section class="border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl sm:p-8 lg:col-span-7">
          <span class="text-xs font-bold uppercase tracking-widest text-amber-400">
            Inquiry Form
          </span>
          <h2 class="mt-1 text-2xl font-extrabold tracking-tight text-white">
            Send Message
          </h2>
          <p class="mt-1 text-xs font-light text-slate-400">
            Fill in the details below and our concierge team will respond shortly.
          </p>

          <!-- Feedback Alerts -->
          <div
            v-if="submitStatus === 'success'"
            class="mt-6 flex items-center gap-3 border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400"
          >
            <CheckCircle2 class="h-4 w-4 shrink-0" />
            <span>Thank you! Your message has been sent successfully.</span>
          </div>

          <div
            v-if="submitStatus === 'error'"
            class="mt-6 flex items-center gap-3 border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-400"
          >
            <AlertCircle class="h-4 w-4 shrink-0" />
            <span>Something went wrong. Please check your details and try again.</span>
          </div>

          <form @submit.prevent="submitInquiry" class="mt-6 space-y-5">
            <div class="grid gap-5 sm:grid-cols-2">
              <!-- Name Input -->
              <div>
                <label for="fullName" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Name <span class="text-amber-400">*</span>
                </label>
                <input
                  id="fullName"
                  v-model="form.fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  class="mt-2 w-full border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <!-- Email Input -->
              <div>
                <label for="email" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Your Email <span class="text-amber-400">*</span>
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  class="mt-2 w-full border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <!-- Phone Input -->
            <div>
              <label for="phone" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Phone Number <span class="text-slate-500">(Optional)</span>
              </label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                placeholder="+855 12 345 678"
                class="mt-2 w-full border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <!-- Message Textarea -->
            <div>
              <label for="message" class="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Your Message <span class="text-amber-400">*</span>
              </label>
              <textarea
                id="message"
                v-model="form.message"
                rows="5"
                placeholder="How can we assist you?"
                required
                class="mt-2 w-full resize-y border border-white/10 bg-slate-950/60 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all duration-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="inline-flex w-full items-center justify-center gap-2 border border-amber-500/30 bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all duration-300 hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 sm:w-auto"
            >
              <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
              <Send v-else class="h-3.5 w-3.5" />
              <span>{{ isSubmitting ? "Sending..." : "Send Message" }}</span>
            </button>
          </form>
        </section>

      </div>
    </main>
  </div>
</template>