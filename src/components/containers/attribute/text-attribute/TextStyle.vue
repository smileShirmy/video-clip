<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import AttributeSlider from '../components/base/AttributeSlider.vue'
import InputNumber from '../components/base/InputNumber.vue'
import AttributeItem from '../components/layout/AttributeItem.vue'
import { useThrottleFn } from '@vueuse/core'
import type { TextTrackItem } from '@/services/track-item/text-track-item'
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { TEXT_HEIGHT_RATIO } from '@/config'

defineOptions({
  name: 'TextStyle'
})

const playerStore = usePlayerStore()

const trackStore = useTrackStore()
const trackItem: TextTrackItem = trackStore.selectedTrackItem as TextTrackItem

const scale = computed({
  get() {
    return trackItem.attribute.scale * 100
  },
  set(scale) {
    trackItem.attribute.scale = scale / 100
  }
})

const text = computed(() => trackItem.text)

const onTextInput = useThrottleFn(
  (event: Event) => {
    const { value } = event.target as HTMLTextAreaElement
    trackItem.text.value = value

    updateTextAttribute(value)
  },
  20,
  true
)

const textAttributeRef = ref<HTMLDivElement | null>(null)

function updateTextAttribute(text: string) {
  const wrapper = textAttributeRef.value
  if (!wrapper) return

  const { sceneHeight, sceneWidth } = playerStore
  const fontSize = TEXT_HEIGHT_RATIO * playerStore.sceneHeight

  wrapper.style.fontSize = `${fontSize}px`
  wrapper.innerText = text
  const {
    leftRatio: beforeLeftRatio,
    topRatio: beforeTopRatio,
    heightRatio: beforeHeightRatio,
    widthRatio: beforeWidthRatio
  } = trackItem.attribute

  const beforeCenterXRatio = beforeLeftRatio + beforeWidthRatio / 2
  const beforeCenterYRatio = beforeTopRatio + beforeHeightRatio / 2

  const { width, height } = wrapper.getBoundingClientRect()
  const widthRatio = width / sceneWidth
  const heightRatio = height / sceneHeight

  trackItem.attribute.widthRatio = widthRatio
  trackItem.attribute.heightRatio = heightRatio

  const newCenterXRatio = beforeLeftRatio + widthRatio / 2
  const newCenterYRatio = beforeTopRatio + heightRatio / 2

  const xDiff = beforeCenterXRatio - newCenterXRatio
  const yDiff = beforeCenterYRatio - newCenterYRatio

  // 根据中心点来缩放，因此需要调整位置
  trackItem.attribute.leftRatio = beforeLeftRatio + xDiff
  trackItem.attribute.topRatio = beforeTopRatio + yDiff
}
</script>

<template>
  <div ref="textAttributeRef" class="text-attribute"></div>

  <textarea class="textarea-input" rows="3" :value="text.value" @input="onTextInput"></textarea>
  <div class="split-line"></div>
  <AttributeItem label="缩放">
    <AttributeSlider :max="500" v-model="scale" />
    <template #other>
      <InputNumber :max="500" v-model="scale" unit="%" />
    </template>
  </AttributeItem>
</template>

<style lang="scss" scoped>
.textarea-input {
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  background-color: var(--app-bg-color-light);
  outline: none;
  border: none;
  resize: none;
  color: var(--app-text-color-regular);
  font-family: inherit;
}

.split-line {
  width: 100%;
  height: 1px;
  background-color: var(--app-bg-color-light);
}

.text-attribute {
  display: inline-block;
  position: fixed;
  font-family: 'Microsoft YaHei';
  bottom: 0;
  left: 0;
  opacity: 0;
  z-index: -1;
  line-height: 1;
  letter-spacing: 0;
}
</style>
