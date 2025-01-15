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
import { provide, ref, onMounted } from "vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "App",
  components: {
    Footer,
  },
};
</script>
