<script setup>
import Navbar from './components/layouts/Navbar.vue';
</script>

<template>
  <div class="bg-white dark:bg-black min-h-screen">
    <div class="container mx-auto">
      <Navbar />
      <router-view />
    </div>
  </div> 
</template>

<style scoped></style>
