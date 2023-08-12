<script setup lang="ts">
import { ref } from 'vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'

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
      <IconChevronRight class="icon-chevron-right" />
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

    &:hover {
      background-color: var(--app-bg-color-extra-lighter);
    }

    .icon-chevron-right {
      margin: 0 -4px;
      fill: var(--app-text-color-primary);
    }
  }
}
</style>
