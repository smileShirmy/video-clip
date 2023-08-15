<script setup lang="ts">
import { isNumber } from '@/services/helpers/general'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
    unit?: string
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1
  }
)

const emit = defineEmits({
  ['update:modelValue']: (val) => isNumber(val),
  change: (val) => isNumber(val)
})

function setModelValue(val: number) {
  emit('update:modelValue', val)
  emit('change', val)
}

function onInput(event: Event) {
  const { value } = event.target as HTMLInputElement

  let val = props.unit ? Number(value.replace(props.unit, '')) : Number(value)

  if (val > props.max) {
    val = props.max
  }
  if (val < props.min) {
    val = props.min
  }

  setModelValue(val)
}

function plus() {
  if (props.modelValue < props.max) {
    const val = props.modelValue + props.step
    setModelValue(val > props.max ? props.max : val)
  }
}

function minus() {
  if (props.modelValue > props.min) {
    const val = props.modelValue - props.step
    setModelValue(val < props.min ? props.min : val)
  }
}

const inputValue = computed(() => {
  const val = props.modelValue
  return props.unit ? `${val}${props.unit}` : val
})
</script>

<template>
  <div class="input-number">
    <div class="input-wrapper">
      <input class="input-inner" :value="inputValue" @input="onInput" type="text" />
    </div>
    <div class="handler">
      <div class="handler-arrow arrow-up" @click="plus"></div>
      <div class="handler-arrow arrow-down" @click="minus"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-number {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;

  .input-wrapper {
    box-sizing: border-box;
    width: 60px;
    height: 20px;
    border-radius: 4px;
    background-color: var(--app-bg-color-lighter);
    border: 1px solid transparent;

    &:hover {
      border-color: var(--app-bg-color-extra-lighter);
    }

    .input-inner {
      width: 100%;
      height: 100%;
      outline: none;
      color: var(--app-text-color-regular);
      text-align: center;
      background-color: transparent;
    }
  }

  .handler {
    margin-left: 4px;

    .handler-arrow {
      width: 16px;
      height: 10px;
      background-color: var(--app-bg-color-lighter);

      &:hover {
        background-color: var(--app-bg-color-extra-lighter);
      }
    }

    .arrow-up {
      border-radius: 4px 4px 0 0;
    }

    .arrow-down {
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
