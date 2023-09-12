<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { createPopper, type Instance } from '@popperjs/core/lib/popper-lite.js'
import { watch } from 'vue'
import arrow from '@popperjs/core/lib/modifiers/arrow'
import offset from '@popperjs/core/lib/modifiers/offset'
import PopperArrow from './PopperArrow.vue'

defineOptions({
  name: 'AppPopper'
})

const props = defineProps({
  content: {
    type: String,
    default: null
  },
  hover: {
    type: Boolean,
    default: false
  }
})

const isOpen = ref(false)
let popperInstance: Instance | null = null

const triggerNodeRef = ref()

const popperNodeRef = ref()

function initPopper() {
  popperInstance = createPopper(triggerNodeRef.value, popperNodeRef.value, {
    placement: 'bottom',
    strategy: 'fixed',
    modifiers: [
      arrow,
      offset,
      {
        name: 'offset',
        options: {
          offset: [0, 6]
        }
      }
    ]
  })

  popperInstance.update()
}

function closePopper() {
  if (!isOpen.value) return

  isOpen.value = false
}

function openPopper() {
  if (isOpen.value) return

  isOpen.value = true
}

function togglePopper() {
  isOpen.value ? closePopper() : openPopper()
}

watch(isOpen, (isOpen) => {
  if (isOpen) {
    initPopper()
  }
})

onBeforeUnmount(() => {
  popperInstance?.destroy()
})
</script>

<template>
  <div ref="popperContainerNode" @mouseleave="hover && closePopper()">
    <div ref="triggerNodeRef" @click="togglePopper" @mouseover="hover && openPopper()">
      <slot></slot>
    </div>
    <div v-show="isOpen" class="popper" ref="popperNodeRef">
      <slot name="content">
        <span class="popper-content">{{ props.content }}</span>
      </slot>
      <PopperArrow />
    </div>
  </div>
</template>

<style lang="scss">
.popper {
  color: var(--app-text-color-regular);
  padding: 6px 8px;
  background-color: var(--app-bg-color-darker);
  border-radius: 4px;
  z-index: 9;
  border: 1px solid var(--app-bg-color-lighter);

  .popper-content {
    font-size: var(--app-font-size-small);
  }
}
</style>
