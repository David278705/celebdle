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
  setup() {
    // Idioma reactivo
    const lang = ref("en"); // Idioma por defecto

    // Validar si el parámetro lang está presente en la URL
    onMounted(() => {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang");
      if (urlLang) {
        lang.value = urlLang; // Actualizar el idioma si está presente
      } else if (navigator.language.includes("es")) {
        lang.value = "es";
      }
    });

    // Proveer el idioma para que los componentes hijos puedan accederlo
    provide("lang", lang);

    return {
      lang,
    };
  },
};
</script>
