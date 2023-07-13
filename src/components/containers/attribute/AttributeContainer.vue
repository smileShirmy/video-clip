<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'fold', changedWidth: number): void
  (e: 'unfold', changedWidth: number): void
}>()

const attributeContainer = ref<HTMLElement>()

const isFold = ref(false)

const FOLD_WIDTH = 80

let changedWidth = 0

function fold() {
  if (!attributeContainer.value) return

  isFold.value = true

  changedWidth = attributeContainer.value.clientWidth - FOLD_WIDTH
  attributeContainer.value.style.width = `${FOLD_WIDTH}px`
  emit('fold', changedWidth)
}

function unfold() {
  if (!attributeContainer.value) return

  isFold.value = false

  attributeContainer.value.style.width = `${attributeContainer.value.clientWidth + changedWidth}px`
  emit('unfold', changedWidth)
}

function clickContainer() {
  if (isFold.value) {
    unfold()
  }
}

defineExpose({
  attributeContainer
})
</script>

<template>
  <div
    class="attribute-container app-width-transition"
    ref="attributeContainer"
    @click="clickContainer"
  >
    AttributeContainer

    <div v-show="!isFold" class="fold-wrapper" @click.stop="fold">
      <i class="fold-icon"></i>
    </div>
  </div>
</template>

<style scoped lang="scss">
.attribute-container {
  box-sizing: border-box;
  position: relative;
  width: calc(33% - 1px);
  background-color: var(--app-bg-color);

  .fold-wrapper {
    position: absolute;
    top: calc(50% - 17px);
    left: 0;
    display: flex;
    align-items: center;
    width: 10px;
    height: 34px;
    background-color: var(--app-bg-color-lighter);
    border-radius: 0 4px 4px 0;
    cursor: pointer;

    .fold-icon {
      position: relative;
      left: 3px;
      display: inline-block;
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 3px solid var(--app-color-white);
      border-right: 3px solid transparent;

      &::after {
        content: '';
        position: absolute;
        right: -2px;
        top: -6px;
        display: inline-block;
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 3px solid var(--app-bg-color-lighter);
        border-right: 3px solid transparent;
      }
    }
  }
}
</style>
