import mitt from 'mitt'

export enum Events {
  UPDATE_PLAYER_ITEMS = 'updatePlayerItems',
  UPDATE_PLAYER_ATTRIBUTE = 'updatePlayerAttribute',
  INIT_AUDIO = 'initAudio'
}

const emitter = mitt<{
  // 当前轨道的资源发生变化
  [Events.UPDATE_PLAYER_ITEMS]: undefined
  // 当前属性发生变化
  [Events.UPDATE_PLAYER_ATTRIBUTE]: undefined
  // 初始化音频
  [Events.INIT_AUDIO]: undefined
}>()

export { emitter }
