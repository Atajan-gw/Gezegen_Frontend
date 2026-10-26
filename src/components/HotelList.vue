<script setup>
import { ref, watch, onMounted } from 'vue'

const hotels = ref([])
const error = ref(null)
const page = ref(1)
const lastPage = ref(1)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/v1/hotels', {
      headers: { Accept: 'application/json' },
    })
    console.log('status:', res.status)

    const text = await res.text()
    console.log('response:', text)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const json = JSON.parse(text)
    hotels.value = Array.isArray(json) ? json : json.data
    console.log('hotels:', hotels.value)
  } catch (e) {
    error.value = e.message
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function load() {
  loading.value = true
  try {
    const res = await fetch(`/api/v1/hotels?page=${page.value}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    hotels.value = json.data
    lastPage.value = json.last_page ?? json.meta?.last_page ?? 1
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(page, load)

</script>

<template>
  <main class="min-h-screen bg-[#EEF3F4] pb-20 text-[#0B2230] dark:bg-[#0B2230] dark:text-white">
    <section class="mx-auto max-w-6xl px-4 py-10">
    <div class="mb-8 flex items-end justify-between">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-gray-900 pt-20 dark:text-white">Hotels</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-white">
          All: {{ hotels.length }}
        </p>
      </div>
    </div>

    <div
      v-if="loading"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="h-24 animate-pulse rounded-2xl bg-gray-200"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
    >
      <p class="font-semibold">Error</p>
      <p class="mt-1 text-sm">{{ error }}</p>
    </div>

    <div
      v-else-if="!hotels.length"
      class="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500"
    >
      List of hotels is empty
    </div>

    <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <li
      v-for="hotel in hotels"
      :key="hotel.id"
      class="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <img
        src="/image/hotel.jfif"
        :alt="hotel.name"
        class="h-40 w-full rounded-xl object-cover"
      />
      <div class="min-w-0">
        <h3 class="truncate text-lg font-semibold text-gray-900">
          {{ hotel.name }}
        </h3>
      </div>
    </li>
  </ul>

  <div class="mt-8 flex items-center justify-center gap-4 dark:text-white">
    <button :disabled="page === 1 || loading" @click="page--">Last Page</button>
    <span>{{ page }} / {{ lastPage }}</span>
    <button :disabled="page === lastPage || loading" @click="page++">Next Page</button>
  </div>
  </section>
  </main>
</template>