<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import AttributeSlider from '../components/base/AttributeSlider.vue'
import InputNumber from '../components/base/InputNumber.vue'
import AttributeItem from '../components/layout/AttributeItem.vue'
import { useThrottleFn } from '@vueuse/core'
import type { TextTrackItem } from '@/services/track-item/text-track-item'
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'
import { DEFAULT_TEXT, TEXT_LINE_HEIGHT_RATIO } from '@/config'
import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'

defineOptions({
  name: 'TextStyle'
})

const playerStore = usePlayerStore()

const trackStore = useTrackStore()

const trackItem = computed(() => trackStore.selectedTrackItem as TextTrackItem)

const scale = computed({
  get() {
    return trackItem.value.attribute.scale * 100
  },
  set(scale) {
    trackItem.value.attribute.scale = scale / 100
  }
})

function onScaleChange(newVal: number, oldVal: number) {
  PlayerAttributeChangeAction.create(trackItem.value.id, 'scale', oldVal / 100).end(newVal / 100)
}

const text = computed(() => trackItem.value.text)

let isStartInputText = false

const onTextInput = useThrottleFn((event: Event) => {
  let { value } = event.target as HTMLTextAreaElement
  value = value === '' ? DEFAULT_TEXT : value
  trackItem.value.text.value = value

  updateTextAttribute(value)

  if (isStartInputText === false) {
    isStartInputText = true
  }
}, 20)

function onTextBlur() {
  isStartInputText = false
}

const textAttributeRef = ref<HTMLDivElement | null>(null)

function updateTextAttribute(text: string) {
  const wrapper = textAttributeRef.value
  if (!wrapper) return

  const lineCount = text.split('\n').length
  const { sceneHeight, sceneWidth } = playerStore
  const fontSize = TEXT_LINE_HEIGHT_RATIO * playerStore.sceneHeight

  const { letterSpacingRatio, lineSpacingRatio } = trackItem.value.textAttribute
  const letterSpacing = letterSpacingRatio * sceneWidth
  const lineSpacing = lineSpacingRatio * sceneHeight

  wrapper.style.fontSize = `${fontSize}px`
  wrapper.style.letterSpacing = `${letterSpacing}px`
  wrapper.innerText = text
  const {
    leftRatio: beforeLeftRatio,
    topRatio: beforeTopRatio,
    heightRatio: beforeHeightRatio,
    widthRatio: beforeWidthRatio
  } = trackItem.value.attribute

  const beforeCenterXRatio = beforeLeftRatio + beforeWidthRatio / 2
  const beforeCenterYRatio = beforeTopRatio + beforeHeightRatio / 2

  const { width, height } = wrapper.getBoundingClientRect()
  // 因为 letterSpacing 是跟随在每一个字符后面的，因此需要把最后一个字符的 letterSpacing 给去掉
  const widthRatio = (width - letterSpacing) / sceneWidth
  const heightRatio = (height + lineSpacing * (lineCount - 1)) / sceneHeight

  trackItem.value.attribute.widthRatio = widthRatio
  trackItem.value.attribute.heightRatio = heightRatio

  const newCenterXRatio = beforeLeftRatio + widthRatio / 2
  const newCenterYRatio = beforeTopRatio + heightRatio / 2

  const xDiff = beforeCenterXRatio - newCenterXRatio
  const yDiff = beforeCenterYRatio - newCenterYRatio

  // 根据中心点来缩放，因此需要调整位置
  trackItem.value.attribute.leftRatio = beforeLeftRatio + xDiff
  trackItem.value.attribute.topRatio = beforeTopRatio + yDiff
}

const opacity = computed({
  get() {
    return trackItem.value.attribute.opacity * 100
  },
  set(opacity) {
    trackItem.value.attribute.opacity = opacity / 100
  }
})

const rotate = computed({
  get() {
    return trackItem.value.attribute.rotate
  },
  set(rotate) {
    trackItem.value.attribute.rotate = rotate
  }
})

const translateX = computed({
  get() {
    return trackItem.value.attribute.leftRatio * 100
  },
  set(x) {
    trackItem.value.attribute.leftRatio = x / 100
  }
})

const translateY = computed({
  get() {
    return trackItem.value.attribute.topRatio * 100
  },
  set(y) {
    trackItem.value.attribute.topRatio = y / 100
  }
})

const letterSpacing = computed({
  get() {
    return trackItem.value.textAttribute.letterSpacingRatio * 500
  },
  set(letterSpacing) {
    trackItem.value.textAttribute.letterSpacingRatio = letterSpacing / 500

    updateTextAttribute(trackItem.value.text.value)
  }
})

const lineSpacing = computed({
  get() {
    return trackItem.value.textAttribute.lineSpacingRatio * 500
  },
  set(lineSpacing) {
    trackItem.value.textAttribute.lineSpacingRatio = lineSpacing / 500

    updateTextAttribute(trackItem.value.text.value)
  }
})
</script>

<template>
  <div ref="textAttributeRef" class="text-attribute"></div>

  <textarea
    class="textarea-input"
    rows="3"
    :value="text.value"
    @input="onTextInput"
    @blur="onTextBlur"
  ></textarea>

  <div class="s-split-line"></div>

  <h5 class="s-attribute-title">基础样式</h5>

  <AttributeItem label="缩放">
    <AttributeSlider :max="500" v-model="scale" @change="onScaleChange" />
    <template #other>
      <InputNumber :max="500" v-model="scale" unit="%" @change="onScaleChange" />
    </template>
  </AttributeItem>
  <AttributeItem label="不透明度">
    <AttributeSlider v-model="opacity" />
    <template #other>
      <InputNumber v-model="opacity" unit="%" />
    </template>
  </AttributeItem>

  <div class="s-split-line"></div>

  <h5 class="s-attribute-title">位置与对齐</h5>

  <AttributeItem label="坐标">
    <div class="s-coordinate">
      <InputNumber :min="-Infinity" :max="Infinity" v-model="translateX">
        <template #prefix>X</template>
      </InputNumber>
      <span class="s-attribute-item-line"></span>
      <InputNumber :min="-Infinity" :max="Infinity" v-model="translateY">
        <template #prefix>Y</template>
      </InputNumber>
    </div>
  </AttributeItem>
  <AttributeItem label="旋转">
    <AttributeSlider :max="360" v-model="rotate" />
    <template #other>
      <InputNumber :max="360" v-model="rotate" unit="°" />
    </template>
  </AttributeItem>
  <AttributeItem label="字间距">
    <div class="spacing-line-height">
      <InputNumber :max="100" v-model="letterSpacing" />
      <span class="line-height-label">行间距</span>
      <InputNumber :max="100" v-model="lineSpacing" />
    </div>
  </AttributeItem>
</template>

<style lang="scss" scoped>
@use '../assets/scss/shared.scss';

.textarea-input {
  box-sizing: border-box;
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  background-color: var(--app-bg-color-light);
  outline: none;
  border: none;
  resize: none;
  color: var(--app-text-color-regular);
  font-family: inherit;
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

.spacing-line-height {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .line-height-label {
    margin: 0 16px;
  }
}
</style>
