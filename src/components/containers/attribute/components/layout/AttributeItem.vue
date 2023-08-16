<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="attribute-item">
    <div class="attribute-label">{{ props.label }}</div>
    <div class="attribute-handler">
      <slot></slot>
    </div>
    <div class="attribute-other-handler">
      <slot name="other"></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.attribute-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-right: 80px;

  .attribute-label {
    flex-shrink: 0;
    width: 4em;
    margin-right: 14px;
  }

  .attribute-handler {
    flex: 1;
    margin: 0 10px;
  }

  .attribute-other-handler {
    flex-shrink: 0;
  }
}
</style>
