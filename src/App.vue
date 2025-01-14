<!-- src/App.vue -->
<template>
  <div class="flex flex-col">
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer global -->
    <Footer />
  </div>
</template>

<script>
import Footer from "@/components/Footer.vue";

export default {
  name: "App",
  components: {
    Footer,
  },
};
</script>
