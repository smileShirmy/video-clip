<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import AttributeSlider from '../../components/base/AttributeSlider.vue'
import InputNumber from '../../components/base/InputNumber.vue'
import AttributeItem from '../../components/layout/AttributeItem.vue'
import { computed } from 'vue'
import type { VideoTrackItem } from '@/services/track-item/video-track-item'

defineOptions({
  name: 'VideoPicture'
})

const trackStore = useTrackStore()
const trackItem: VideoTrackItem = trackStore.selectedTrackItem as VideoTrackItem

const opacity = computed({
  get() {
    return trackItem.attribute.opacity * 100
  },
  set(opacity) {
    trackItem.attribute.opacity = opacity / 100
  }
})

const scale = computed({
  get() {
    return trackItem.attribute.scale * 100
  },
  set(scale) {
    trackItem.attribute.scale = scale / 100
  }
})

const rotate = computed({
  get() {
    return trackItem.attribute.rotate
  },
  set(rotate) {
    trackItem.attribute.rotate = rotate
  }
})

const translateX = computed({
  get() {
    return trackItem.attribute.leftRatio * 100
  },
  set(x) {
    trackItem.attribute.leftRatio = x / 100
  }
})

const translateY = computed({
  get() {
    return trackItem.attribute.topRatio * 100
  },
  set(y) {
    trackItem.attribute.topRatio = y / 100
  }
})
</script>

<template>
  <AttributeItem label="不透明度">
    <AttributeSlider v-model="opacity" />
    <template #other>
      <InputNumber v-model="opacity" unit="%" />
    </template>
  </AttributeItem>
  <AttributeItem label="缩放">
    <AttributeSlider :max="500" v-model="scale" />
    <template #other>
      <InputNumber :max="500" v-model="scale" unit="%" />
    </template>
  </AttributeItem>
  <AttributeItem label="坐标">
    <div class="coordinate">
      <InputNumber :min="-Infinity" :max="Infinity" v-model="translateX">
        <template #prefix>X</template>
      </InputNumber>
      <span class="split-line"></span>
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
</template>

<style lang="scss" scoped>
.coordinate {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  .split-line {
    width: 8px;
    height: 1px;
    margin: 0 4px;
    background-color: var(--app-bg-color-lighter);
  }
}
</style>
