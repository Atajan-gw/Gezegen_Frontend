<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'

const field =
  'w-full rounded-xl bg-white px-4 py-3 text-[#0B2230] placeholder-black/40 ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#F5C451] dark:bg-white/10 dark:text-white dark:placeholder-white/40 dark:ring-white/10'
const card =
  'rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-white/5 dark:shadow-none dark:ring-white/10'
const soft = 'text-[#0B2230]/70 dark:text-white/70'
const muted = 'text-[#0B2230]/60 dark:text-white/60'
const accent = 'text-[#1F7A8C] dark:text-[#F5C451]'
const outlineBtn =
  'rounded-full border border-[#0B2230]/30 hover:bg-[#0B2230]/5 dark:border-white/30 dark:hover:bg-white/10'

const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
const today = new Date().toISOString().slice(0, 10)

const fmt = (d) =>
  new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

const locations = ref([])
const route = reactive({ fromCountry: '', fromCity: '', toCountry: '', toCity: '', date: '' })

const fromCities = computed(
  () => locations.value.find((l) => l.country === route.fromCountry)?.cities ?? []
)
const toCities = computed(
  () => locations.value.find((l) => l.country === route.toCountry)?.cities ?? []
)
watch(() => route.fromCountry, () => (route.fromCity = ''))
watch(() => route.toCountry, () => (route.toCity = ''))

const hasFilters = computed(() => route.fromCity || route.toCity || route.date)

async function loadLocations() {
  try {
    const res = await fetch('/api/v1/flights/locations', { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    locations.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

const flights = ref([])
const page = ref(1)
const lastPage = ref(1)
const total = ref(0)
const loading = ref(true)
const listError = ref(null)

async function loadFlights() {
  loading.value = true
  listError.value = null
  try {
    const params = new URLSearchParams({ page: page.value })
    if (route.fromCity) params.set('from', route.fromCity)
    if (route.toCity) params.set('to', route.toCity)
    if (route.date) params.set('date', route.date)

    const res = await fetch(`/api/v1/flights?${params}`, { headers })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)

    flights.value = json.data
    lastPage.value = json.last_page ?? 1
    total.value = json.total ?? json.data.length
  } catch (e) {
    listError.value = e.message
    flights.value = []
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  loadFlights()
}

function resetFilters() {
  Object.assign(route, { fromCountry: '', fromCity: '', toCountry: '', toCity: '', date: '' })
  search()
}

function goTo(p) {
  if (p < 1 || p > lastPage.value || p === page.value) return
  page.value = p
  loadFlights()
}

onMounted(() => {
  loadLocations()
  loadFlights()
})

const selected = ref(null)
const passengers = ref([newPassenger()])
const quote = ref(null)
const quoting = ref(false)

function newPassenger() {
  return { first_name: '', last_name: '', age: '', phone: '' }
}

const maxPassengers = computed(() => Math.min(9, selected.value?.available_seats ?? 1))

const allAgesFilled = computed(() =>
  passengers.value.every((p) => p.age !== '' && p.age !== null)
)
const hasAdult = computed(() => passengers.value.some((p) => Number(p.age) >= 18))
const noAdult = computed(() => allAgesFilled.value && !hasAdult.value)

function selectFlight(f) {
  selected.value = f
  passengers.value = [newPassenger()]
  quote.value = null
  errors.value = {}
  message.value = null
  fetchQuote()
}

function addPassenger() {
  if (passengers.value.length < maxPassengers.value) passengers.value.push(newPassenger())
}
function removePassenger(i) {
  if (passengers.value.length > 1) passengers.value.splice(i, 1)
}

async function fetchQuote() {
  if (!selected.value) return
  quoting.value = true
  try {
    const res = await fetch('/api/v1/tickets/quote', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        flight_id: selected.value.id,
        passengers: passengers.value.length,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
    quote.value = json
  } catch (e) {
    message.value = e.message
  } finally {
    quoting.value = false
  }
}
watch(() => passengers.value.length, fetchQuote)

const submitting = ref(false)
const message = ref(null)
const errors = ref({})
const ticket = ref(null)

const err = (key) => errors.value[key]?.[0]

async function buy() {
  submitting.value = true
  message.value = null
  errors.value = {}
  try {
    const res = await fetch('/api/v1/tickets', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        flight_id: selected.value.id,
        passengers: passengers.value.map((p) => ({ ...p, age: Number(p.age) })),
      }),
    })
    const json = await res.json()

    if (res.status === 422) {
      errors.value = json.errors ?? {}
      message.value = json.message
      return
    }
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)

    ticket.value = json
  } catch (e) {
    message.value = e.message
  } finally {
    submitting.value = false
  }
}

function reset() {
  ticket.value = null
  selected.value = null
  passengers.value = [newPassenger()]
  loadFlights() 
}
</script>

<template>
  <main
    class="min-h-screen bg-[#EEF3F4] pb-20 pt-28 text-[#0B2230] dark:bg-[#0B2230] dark:text-white"
  >
    <div class="mx-auto max-w-4xl px-6">
      <h1 class="text-4xl font-bold tracking-tight md:text-5xl">Tickets</h1>

      <section v-if="ticket" :class="card" class="mt-8 p-8">
        <h2 class="text-3xl font-bold">Ticket confirmed</h2>
        <p :class="soft" class="mt-4">Your booking code</p>
        <p :class="accent" class="mt-1 text-4xl font-bold tracking-widest">{{ ticket.code }}</p>

        <p class="mt-6 text-lg font-semibold">
          {{ ticket.flight.from_city?.name }} → {{ ticket.flight.to_city?.name }}
        </p>
        <p :class="soft" class="text-sm">
          {{ ticket.flight.airline }} · {{ ticket.flight.flight_number }} ·
          {{ fmt(ticket.flight.departure_at) }}
        </p>

        <ul class="mt-6 space-y-1">
          <li v-for="p in ticket.passengers" :key="p.id">
            {{ p.first_name }} {{ p.last_name }}
            <span :class="muted">· {{ p.age }} y.o. · {{ p.phone }}</span>
          </li>
        </ul>

        <p class="mt-6 text-2xl font-bold">Total: ${{ ticket.total_price }}</p>

        <button
          @click="reset"
          :class="outlineBtn"
          class="mt-8 px-6 py-3 font-semibold"
        >
          Book another ticket
        </button>
      </section>

      <template v-else>
        <form
          v-if="!selected"
          @submit.prevent="search"
          :class="card"
          class="mt-8 space-y-5 p-6"
        >
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-3">
              <h2 :class="accent" class="font-semibold">From</h2>
              <select v-model="route.fromCountry" :class="field">
                <option value="" class="text-black">Country (any)</option>
                <option v-for="l in locations" :key="l.country" :value="l.country" class="text-black">
                  {{ l.country }}
                </option>
              </select>
              <select v-model="route.fromCity" :disabled="!route.fromCountry" :class="field">
                <option value="" class="text-black">City (any)</option>
                <option v-for="c in fromCities" :key="c.id" :value="c.id" class="text-black">
                  {{ c.name }}
                </option>
              </select>
            </div>

            <div class="space-y-3">
              <h2 :class="accent" class="font-semibold">To</h2>
              <select v-model="route.toCountry" :class="field">
                <option value="" class="text-black">Country (any)</option>
                <option v-for="l in locations" :key="l.country" :value="l.country" class="text-black">
                  {{ l.country }}
                </option>
              </select>
              <select v-model="route.toCity" :disabled="!route.toCountry" :class="field">
                <option value="" class="text-black">City (any)</option>
                <option v-for="c in toCities" :key="c.id" :value="c.id" class="text-black">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <input v-model="route.date" type="date" :min="today" :class="field" />
            <button
              type="submit"
              class="rounded-xl bg-[#F5C451] px-8 py-3 font-semibold text-[#0B2230] transition hover:bg-[#ffd36b] sm:whitespace-nowrap"
            >
              Find flights
            </button>
            <button
              v-if="hasFilters"
              type="button"
              @click="resetFilters"
              :class="outlineBtn"
              class="rounded-xl px-6 py-3 font-semibold sm:whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </form>

        <section v-if="!selected" class="mt-8">
          <div class="flex items-baseline justify-between">
            <h2 class="text-xl font-semibold">
              {{ hasFilters ? 'Search results' : 'All flights' }}
            </h2>
            <p v-if="!loading && !listError" :class="muted" class="text-sm">{{ total }} found</p>
          </div>

          <ul v-if="loading" class="mt-4 space-y-4">
            <li
              v-for="n in 3"
              :key="n"
              class="h-28 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10"
            ></li>
          </ul>

          <p
            v-else-if="listError"
            class="mt-4 rounded-xl bg-red-500/15 p-4 text-red-700 dark:text-red-200"
          >
            {{ listError }}
          </p>

          <p v-else-if="!flights.length" :class="card" class="mt-4 p-6 text-lg">
            {{ hasFilters ? 'No flights available for this route.' : 'No flights yet.' }}
          </p>

          <ul v-else class="mt-4 space-y-4">
            <li
              v-for="f in flights"
              :key="f.id"
              :class="card"
              class="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p class="text-lg font-semibold">
                  {{ f.from_city?.name }} <span :class="accent">→</span> {{ f.to_city?.name }}
                </p>
                <p :class="soft" class="text-sm">{{ f.airline }} · {{ f.flight_number }}</p>
                <p :class="soft" class="mt-1 text-sm">
                  {{ fmt(f.departure_at) }} → {{ fmt(f.arrival_at) }}
                </p>
              </div>
              <div class="flex items-center gap-5">
                <div class="text-right">
                  <p class="text-2xl font-bold">${{ f.price }}</p>
                  <p :class="muted" class="text-xs">per seat · {{ f.available_seats }} left</p>
                </div>
                <button
                  @click="selectFlight(f)"
                  class="rounded-full bg-[#F5C451] px-6 py-3 font-semibold text-[#0B2230] transition hover:bg-[#ffd36b]"
                >
                  Select
                </button>
              </div>
            </li>
          </ul>

          <div v-if="lastPage > 1" class="mt-8 flex items-center justify-center gap-4">
            <button
              :disabled="page === 1 || loading"
              @click="goTo(page - 1)"
              :class="outlineBtn"
              class="px-5 py-2 disabled:opacity-40"
            >
              Prev
            </button>
            <span :class="soft">{{ page }} / {{ lastPage }}</span>
            <button
              :disabled="page === lastPage || loading"
              @click="goTo(page + 1)"
              :class="outlineBtn"
              class="px-5 py-2 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>

        <form v-else @submit.prevent="buy" class="mt-8 space-y-6">
          <div :class="card" class="flex items-start justify-between gap-4 p-5">
            <div>
              <p class="text-lg font-semibold">
                {{ selected.from_city?.name }} <span :class="accent">→</span>
                {{ selected.to_city?.name }}
              </p>
              <p :class="soft" class="text-sm">
                {{ selected.airline }} · {{ selected.flight_number }} · {{ fmt(selected.departure_at) }}
              </p>
            </div>
            <button
              type="button"
              @click="selected = null"
              :class="muted"
              class="text-sm hover:opacity-70"
            >
              Change flight
            </button>
          </div>

          <p
            v-if="message"
            class="rounded-xl bg-red-500/15 p-4 text-red-700 dark:text-red-200"
          >
            {{ message }}
          </p>
          <p v-if="err('passengers')" class="text-sm text-red-600 dark:text-red-300">
            {{ err('passengers') }}
          </p>
          <p
            v-if="noAdult"
            class="rounded-xl bg-yellow-500/20 p-4 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-200"
          >
            At least one passenger must be 18 or older to buy a ticket.
          </p>

          <div
            v-for="(p, i) in passengers"
            :key="i"
            :class="card"
            class="space-y-3 p-5"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-semibold">Passenger {{ i + 1 }}</h3>
              <button
                v-if="passengers.length > 1"
                type="button"
                @click="removePassenger(i)"
                :class="muted"
                class="text-sm hover:opacity-70"
              >
                Remove
              </button>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <input v-model="p.first_name" placeholder="First name" :class="field" />
                <p v-if="err(`passengers.${i}.first_name`)" class="mt-1 text-sm text-red-600 dark:text-red-300">
                  {{ err(`passengers.${i}.first_name`) }}
                </p>
              </div>
              <div>
                <input v-model="p.last_name" placeholder="Last name" :class="field" />
                <p v-if="err(`passengers.${i}.last_name`)" class="mt-1 text-sm text-red-600 dark:text-red-300">
                  {{ err(`passengers.${i}.last_name`) }}
                </p>
              </div>
              <div>
                <input v-model="p.age" type="number" min="0" max="120" placeholder="Age" :class="field" />
                <p v-if="err(`passengers.${i}.age`)" class="mt-1 text-sm text-red-600 dark:text-red-300">
                  {{ err(`passengers.${i}.age`) }}
                </p>
              </div>
              <div>
                <input v-model="p.phone" type="tel" placeholder="Phone number" :class="field" />
                <p v-if="err(`passengers.${i}.phone`)" class="mt-1 text-sm text-red-600 dark:text-red-300">
                  {{ err(`passengers.${i}.phone`) }}
                </p>
              </div>
            </div>
          </div>

          <button
            v-if="passengers.length < maxPassengers"
            type="button"
            @click="addPassenger"
            :class="outlineBtn"
            class="px-5 py-2 text-sm"
          >
            + Add passenger
          </button>

          <div
            class="flex flex-col gap-4 border-t border-black/10 pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p :class="muted" class="text-sm">
                {{ quote?.passengers ?? passengers.length }} × ${{ quote?.price_per_seat ?? selected.price }}
              </p>
              <p class="text-3xl font-bold">
                Total: {{ quoting || !quote ? '...' : '$' + quote.total_price }}
              </p>
            </div>
            <button
              type="submit"
              :disabled="submitting || quoting || noAdult"
              class="rounded-full bg-[#F5C451] px-10 py-3.5 text-lg font-semibold text-[#0B2230] transition hover:bg-[#ffd36b] disabled:opacity-60"
            >
              {{ submitting ? 'Buying...' : 'Buy' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </main>
</template>