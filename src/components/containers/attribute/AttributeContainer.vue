<script setup lang="ts">
import { ref } from 'vue'

const attributeContainer = ref<HTMLElement>()

defineExpose({
  attributeContainer
})
</script>

<template>
  <div class="attribute-container app-width-transition" ref="attributeContainer">
    AttributeContainer
  </div>
</template>

<style scoped lang="scss">
.attribute-container {
  box-sizing: border-box;
  width: calc(33% - 1px);
  background-color: var(--app-bg-color);
}
</style>
