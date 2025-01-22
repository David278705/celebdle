<template>
  <div>
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client="ca-pub-8707131788827604"
      data-ad-slot="6294068343"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  </div>
</template>

<script>
export default {
  name: "GoogleAd",
  mounted() {
    // Asegúrate de que el script de Google AdSense esté en tu proyecto.
    if (window.adsbygoogle) {
      console.log(window.adsbygoogle);
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("Error al cargar el anuncio:", e);
      }
    }
  },
};
</script>

<style scoped>
/* Opcional: Ajusta estilos si es necesario */
</style>
