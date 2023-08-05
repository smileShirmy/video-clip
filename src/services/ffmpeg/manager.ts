import { createFFmpeg, fetchFile, type FFmpeg } from '@ffmpeg/ffmpeg'
import { ref } from 'vue'
import { warn } from '../helpers/warn'
import { FPS } from '@/config'

export enum FFDir {
  RESOURCE = '/resource/',
  FRAME = '/frame/'
}

/**
 * 0.12.* 版本调用 load() 之后没法继续往下执行，因此使用 0.11.* 版本
 */
class FFManger {
  private ffmpeg: FFmpeg

  public isLoaded = ref(false)

  constructor() {
    this.ffmpeg = createFFmpeg({
      corePath: '/ffmpeg/ffmpeg-core.js',
      log: true,
      progress: this.progress
    })

    this.init()
  }

  /**
   * 初始化 FFmanger
   */
  private async init() {
    await this.ffmpeg.load()
    await this.initFileSystem()
    this.isLoaded.value = true
  }

  /**
   * 初始化文件系统
   */
  private async initFileSystem() {
    await Promise.all([
      this.ffmpeg.FS('mkdir', FFDir.RESOURCE),
      this.ffmpeg.FS('mkdir', FFDir.FRAME)
    ])
  }

  private progress({ ratio }: { ratio: number }) {
    console.log(ratio)
  }

  /**
   * 获取当前目录
   *
   * @param {FFDir} dir 文件目录
   */
  private readDir(dir: FFDir | string) {
    return this.ffmpeg.FS('readdir', dir)
  }

  /**
   * 文件是否存在
   *
   * @param {FFDir} dir 文件目录
   * @param {string} filename 文件名称
   */
  private isFileExist(dir: FFDir, filename: string) {
    return this.readDir(dir).includes(filename)
  }

  /**
   * 目录是否存在
   * @param {string} dir
   */
  private isDirExist(dir: string): boolean {
    try {
      this.readDir(dir)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 把文件写入到指定文件目录中
   *
   * @param {FFDir} dir 文件目录
   * @param {string} filename 文件名称
   * @param {string} fileUrl 文件地址
   */
  public async writeFile(dir: FFDir, filename: string, fileUrl: string) {
    if (this.isFileExist(dir, filename)) return

    const path = `${dir}${filename}`
    await this.ffmpeg.FS('writeFile', path, await fetchFile(fileUrl))
  }

  /**
   * 视频/gif 抽帧
   *
   * @param {string} filename 文件名称
   * @params options 其他配置
   */
  public async generateFrames(
    filename: string,
    options: {
      width: number
      height: number
    }
  ) {
    const frameDir = `${FFDir.FRAME}${filename}`
    if (this.isDirExist(frameDir)) return

    if (!this.isFileExist(FFDir.RESOURCE, filename)) {
      warn('请先写入资源')
      return
    }

    this.ffmpeg.FS('mkdir', frameDir)
    const resourcePath = `${FFDir.RESOURCE}${filename}`
    const commands = [
      '-i',
      resourcePath,
      '-vf',
      `fps=${FPS}`,
      '-s',
      `${options.width}x${options.height}`,
      `${frameDir}/f-%d.jpg`
    ]
    await this.ffmpeg.run(...commands)
  }

  public getFrame(filename: string, index: number) {
    const fileBuffer = this.ffmpeg.FS('readFile', `${FFDir.FRAME}${filename}/f-${index}.jpg`)
    return new Blob([fileBuffer], { type: 'image/jpeg' })
  }
}

const ffManager = new FFManger()

export { ffManager }
