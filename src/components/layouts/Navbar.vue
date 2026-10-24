<script setup>
import ToggleDarkMode from '../common/ToggleDarkMode.vue';

</script>

<template>
  <svg width="0" height="0" class="absolute" aria-hidden="true">
    <filter id="liquid" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.02" numOctaves="2" seed="3" result="noise" />
      <feGaussianBlur in="noise" stdDeviation="2" result="soft" />
      <feDisplacementMap in="SourceGraphic" in2="soft" scale="26" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>

  <header
    class="fixed inset-x-0 top-0 z-50 px-4 pt-3"
    style="padding-top: calc(env(safe-area-inset-top, 0px) + 0.75rem)"
  >
    <nav class="glass relative mx-auto flex h-16 w-full max-w-6xl items-center justify-between rounded-full pl-6 pr-2.5" aria-label="Esasy">
      
      <RouterLink to="/" class="rounded-full text-lg font-semibold tracking-tight text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900">
        Gezegen
      </RouterLink>

      
      <ul class="hidden items-center gap-1 text-sm font-medium md:flex">
        <li>
          <RouterLink to="/cities" class="block rounded-full px-4 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">
            Cities
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/hotels" class="block rounded-full px-4 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">
            Hotels
          </RouterLink>
        </li>
        <li>
          <a href="#" class="block rounded-full px-4 py-2 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900">
            Tickets
          </a>
        </li>
      </ul>

      <div class="flex items-center gap-2">
       
        <div class="relative hidden sm:block">
          <ToggleDarkMode />
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped>

.glass {
  background: rgba(255, 255, 255, 0.30);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
  backdrop-filter: url(#liquid) blur(10px) saturate(180%) brightness(1.04);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(255, 255, 255, 0.45),
    inset 0 0 0 1px rgba(255, 255, 255, 0.40),
    0 10px 34px rgba(30, 41, 59, 0.14),
    0 1px 3px rgba(30, 41, 59, 0.10);
}
.glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0) 65%);
}
.glass-strong { background: rgba(255, 255, 255, 0.62); }
.glass-chip {
  background: rgba(255, 255, 255, 0.60);
  box-shadow: inset 0 1px 0 #fff, 0 1px 6px rgba(30, 41, 59, 0.12);
}
@media (prefers-reduced-transparency: reduce) {
  .glass { background: rgba(255, 255, 255, 0.96); -webkit-backdrop-filter: none; backdrop-filter: none; }
}
</style>