<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import AttributeSlider from '../../components/base/AttributeSlider.vue'
import InputNumber from '../../components/base/InputNumber.vue'
import AttributeItem from '../../components/layout/AttributeItem.vue'
import type { StickerTrackItem } from '@/services/track-item/sticker-track-item'
import { computed } from 'vue'
import { useOpacity } from '../../hooks/use-opacity'
import { useScale } from '../../hooks/use-scale'
import { useRotate } from '../../hooks/use-rotate'
import { useTranslate } from '../../hooks/use-translate'

defineOptions({
  name: 'StickerPicture'
})

const trackStore = useTrackStore()
const trackItem = computed(() => trackStore.selectedTrackItem as StickerTrackItem)

const { opacity, onOpacityChange } = useOpacity(trackItem)
const { scale, onScaleChange } = useScale(trackItem)
const { rotate, onRotateChange } = useRotate(trackItem)
const { translateX, translateY, onTranslateXChange, onTranslateYChange } = useTranslate(trackItem)
</script>

<template>
  <AttributeItem label="不透明度">
    <AttributeSlider v-model="opacity" @change="onOpacityChange" />
    <template #other>
      <InputNumber v-model="opacity" unit="%" @change="onOpacityChange" />
    </template>
  </AttributeItem>
  <AttributeItem label="缩放">
    <AttributeSlider :max="500" v-model="scale" @change="onScaleChange" />
    <template #other>
      <InputNumber :max="500" v-model="scale" unit="%" @change="onScaleChange" />
    </template>
  </AttributeItem>
  <AttributeItem label="坐标">
    <div class="s-coordinate">
      <InputNumber
        :min="-Infinity"
        :max="Infinity"
        v-model="translateX"
        @change="onTranslateXChange"
      >
        <template #prefix>X</template>
      </InputNumber>
      <span class="s-attribute-item-line"></span>
      <InputNumber
        :min="-Infinity"
        :max="Infinity"
        v-model="translateY"
        @change="onTranslateYChange"
      >
        <template #prefix>Y</template>
      </InputNumber>
    </div>
  </AttributeItem>
  <AttributeItem label="旋转">
    <AttributeSlider :max="360" v-model="rotate" @change="onRotateChange" />
    <template #other>
      <InputNumber :max="360" v-model="rotate" unit="°" @change="onRotateChange" />
    </template>
  </AttributeItem>
</template>

<style lang="scss" scoped>
@use '../../assets/scss/shared.scss';
</style>
