<script setup>
import { ref, onMounted } from 'vue'

const isDark = ref(false)

function toggleDarkMode() {
    isDark.value = !isDark.value

    document.documentElement.classList.toggle(
        'dark',
        isDark.value
    )

    localStorage.setitem(
        'theme',
        isDark.value ? 'dark' : 'light'
    )
}

onMounted(() => {
    const theme = localStorage.getItem('theme')

    if (theme === 'dark') {
        isDark.value = true
        document.documentElement.classList.add('dark')
    }
})
</script>

<template>
    <button @click="toggleDarkMode" class="relative h-8 w-16 rounded-full bg-gray-300 transition-colors dark:bg-gray-700">
        <div class="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition-transform" :class="{ 'translate-x-8': isDark }">
            {{ isDark ? '🌙' : '☀️' }}
        </div>
    </button>
</template>