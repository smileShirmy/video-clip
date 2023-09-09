import mitt from 'mitt'

export enum Events {
  UPDATE_PLAYER_ITEMS = 'updatePlayerItems',
  UPDATE_PLAYER_ATTRIBUTE = 'updatePlayerAttribute'
}

const emitter = mitt<{
  // 当前轨道的资源发生变化
  [Events.UPDATE_PLAYER_ITEMS]: undefined
  // 当前属性发生变化
  [Events.UPDATE_PLAYER_ATTRIBUTE]: undefined
}>()

export { emitter }
