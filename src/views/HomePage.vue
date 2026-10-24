<script setup>
import { ref, onMounted } from 'vue'

const cities = ref([])
const error = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/v1/cities', {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = await res.json()
    cities.value = Array.isArray(json) ? json : json.data
  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false   // muny unutma
  }
})
</script>

<template>
  <main class="min-h-screen bg-[#0B2230] text-white pt-20">
    <section class="relative overflow-hidden">
      <div
        class="pointer-events-none absolute -right-32 top-10 hidden h-[520px] w-[520px] md:block lg:-right-16"
        aria-hidden="true"
      >
        <div
          class="absolute inset-16 rounded-full bg-gradient-to-br from-[#2BB3A3] via-[#1F7A8C] to-[#0E3B4F]"
        ></div>
        <div class="orbit absolute inset-0 rounded-full border border-white/20">
          <span
            class="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-[#F5C451]"
          ></span>
        </div>
        <div class="absolute inset-6 rounded-full border border-white/10"></div>
      </div>

      <div class="relative mx-auto max-w-6xl px-6 pb-24 pt-24 md:pb-36 md:pt-32">
        <h1 class="max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Gezegen
        </h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
          Gezegen brings cities, hotels, tickets and tours together in one place. Pick a
          destination and see where to stay.
        </p>

        <div class="mt-10 flex flex-wrap gap-3">
          <RouterLink
            to="/cities"
            class="rounded-full bg-[#F5C451] px-7 py-3.5 font-semibold text-[#0B2230] transition hover:bg-[#ffd36b] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B2230]"
          >
            Browse cities
          </RouterLink>
          <RouterLink
            to="/hotels"
            class="rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:border-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Browse hotels
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="bg-[#EEF3F4] text-[#0B2230]">
      <div class="mx-auto max-w-6xl px-6 py-20">
        <div class="flex items-end justify-between gap-4">
          <h2 class="text-3xl font-bold tracking-tight md:text-4xl">Cities</h2>
          <RouterLink
            to="/cities"
            class="font-medium text-[#1F7A8C] underline-offset-4 hover:underline"
          >
            All cities
          </RouterLink>
        </div>

        <ul v-if="loading" class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="n in 3"
            :key="n"
            class="h-64 animate-pulse rounded-2xl bg-white/70"
          ></li>
        </ul>

        <ul
          v-else-if="cities.length"
          class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <li v-for="city in cities.slice(0, 3)" :key="city.id">
            <RouterLink
              to="/cities"
              class="block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F7A8C]"
            >
              <img
                src="/image/city.jfif"
                :alt="city.name"
                class="h-44 w-full object-cover"
              />
              <h3 class="truncate px-5 py-4 text-lg font-semibold">
                {{ city.name }}
              </h3>
            </RouterLink>
          </li>
        </ul>

        <p v-else class="mt-10 text-[#0B2230]/70">
          Could not load cities. Make sure the Laravel server is running.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-20">
      <div class="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <h2 class="max-w-md text-3xl font-bold tracking-tight">
          Already picked a city? Check out the hotels.
        </h2>
        <RouterLink
          to="/hotels"
          class="rounded-full bg-[#F5C451] px-7 py-3.5 font-semibold text-[#0B2230] transition hover:bg-[#ffd36b] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          View hotels
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.orbit {
  animation: spin 40s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit {
    animation: none;
  }
}
</style>