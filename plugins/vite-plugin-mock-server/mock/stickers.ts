interface StickerResource {
  name: string
  format: string
  source: string
  width: number
  height: number
  frameCount: number
}

export const stickers: StickerResource[] = [
  {
    name: 'sticker-1',
    format: 'gif',
    source: '/images/sticker/sticker-1.gif',
    width: 200,
    height: 200,
    frameCount: 15
  }
]
