<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="`${iconName}`" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  iconClass: {
    type: String,
    required: true
  },
  className: {
    type: String,
    default: ''
  }
})

const iconName = computed(() => `#icon-${props.iconClass}`)
const svgClass = computed(() => {
  return 'svg-icon ' + props.iconClass
})
</script>

<style scoped></style>