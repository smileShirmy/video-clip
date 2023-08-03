import { createFFmpeg, type FFmpeg } from '@ffmpeg/ffmpeg'

/**
 * 0.12.* 版本没法调用 load() 之后没法继续往下执行，因此使用 0.11.* 版本
 */
class FFManger {
  private ffmpeg: FFmpeg

  constructor() {
    this.ffmpeg = createFFmpeg({
      corePath: '/ffmpeg/ffmpeg-core.js',
      log: true,
      progress: this.progress
    })

    this.init()
  }

  private async init() {
    await this.ffmpeg.load()

    this.initFileSystem()
  }

  private initFileSystem() {
    this.ffmpeg.FS('mkdir', '/videos/')
  }

  private progress({ ratio }: { ratio: number }) {
    console.log(ratio)
  }
}

const ffManager = new FFManger()

export { ffManager }
