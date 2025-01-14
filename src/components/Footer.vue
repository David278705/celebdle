<!-- Footer.vue (o en tu App.vue, como prefieras) -->
<template>
  <footer class="bg-neutral-900 text-white py-3 px-4 rounded-lg mt-10">
    <div
      class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2"
    >
      <!-- Logo / Nombre del sitio (opcional) -->
      <div class="text-sm">
        © {{ currentYear }} Celebdle. Todos los derechos reservados.
      </div>

      <!-- Secciones legales -->
      <nav class="lg:flex gap-4 text-sm text-amber-300">
        <!-- Términos y Condiciones -->
        <router-link
          to="/terms"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          Términos y Condiciones
        </router-link>
        -
        <!-- Política de Privacidad -->
        <router-link
          to="/privacy"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          Política de Privacidad
        </router-link>
        -
        <!-- Política de Cookies -->
        <router-link
          to="/cookies"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          Política de Cookies
        </router-link>
        -
        <!-- Créditos / DMCA -->
        <router-link
          to="/dmca"
          class="text-amber-300 hover:text-amber-400 transition text-sm"
        >
          Créditos / DMCA
        </router-link>
      </nav>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  setup() {
    const currentYear = new Date().getFullYear();
    return {
      currentYear,
    };
  },
};
</script>

<style scoped>
/* Ajusta estilos a tu gusto */
</style>
