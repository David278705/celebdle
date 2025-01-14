<template>
  <div>
    <LogoIcon />
    <div class="bg-neutral-800 p-4 rounded-lg">
      <slot> </slot>
    </div>
  </div>
</template>

<script>
import LogoIcon from "./LogoIcon.vue";
export default {
  name: "TextTemplate",
  components: {
    LogoIcon,
  },
};
</script>
