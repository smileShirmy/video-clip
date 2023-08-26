import mitt from 'mitt'

export enum Events {
  UPDATE_PLAYER_ITEMS = 'updatePlayerItems',
  UPDATE_PLAYER = 'updatePlayer'
}

const emitter = mitt<{
  [Events.UPDATE_PLAYER_ITEMS]: undefined
  [Events.UPDATE_PLAYER]: undefined
}>()

export { emitter }
