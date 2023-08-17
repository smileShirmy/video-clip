import { createFFmpeg, fetchFile, type FFmpeg } from '@ffmpeg/ffmpeg'
import { ref } from 'vue'
import { warn } from '../helpers/warn'
import { FPS } from '@/config'
import { isString } from '../helpers/general'

/**
 * /resource/video-1.mp4
 * /resource/video-1.aac
 * /frame/video-1.mp4/f-1.jpg
 * /frame/video-1.mp4/f-2.jpg
 */
export enum FFDir {
  RESOURCE = '/resource/',
  FRAME = '/frame/',
  WAVE = '/wave/'
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
      log: false,
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
      this.ffmpeg.FS('mkdir', FFDir.FRAME),
      this.ffmpeg.FS('mkdir', FFDir.WAVE)
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
  public async writeFile(dir: FFDir, filename: string, fileUrl: string): Promise<{ path: string }> {
    const path = `${dir}${filename}`

    if (this.isFileExist(dir, filename)) return { path }

    await this.ffmpeg.FS('writeFile', path, await fetchFile(fileUrl))

    return { path }
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
      format: string
    }
  ) {
    const frameDir = `${FFDir.FRAME}${filename}`
    if (this.isDirExist(frameDir)) return

    if (!this.isFileExist(FFDir.RESOURCE, filename)) {
      warn('请先写入资源')
      return
    }

    const imageExtension = options.format === 'gif' ? 'png' : 'jpg'

    this.ffmpeg.FS('mkdir', frameDir)
    const resourcePath = `${FFDir.RESOURCE}${filename}`
    const commands = [
      '-i',
      resourcePath,
      '-vf',
      `fps=${FPS}`,
      '-s',
      `${options.width}x${options.height}`,
      `${frameDir}/f-%d.${imageExtension}`
    ]
    await this.ffmpeg.run(...commands)
  }

  public getFrame(filename: string, index: number, format: string) {
    const imageExtension = isString(format) && format === 'gif' ? 'png' : 'jpg'
    const type = isString(format) && format === 'gif' ? 'image/png' : 'image/jpeg'

    const fileBuffer = this.ffmpeg.FS(
      'readFile',
      `${FFDir.FRAME}${filename}/f-${index}.${imageExtension}`
    )
    return new Blob([fileBuffer], { type })
  }

  /**
   * 从视频中提取音频
   *
   * @param {string} filename 文件名称
   * @param {string} videoName 视频名称
   */
  public async extraAudio(filename: string, videoName: string): Promise<{ audioPath: string }> {
    const audioName = `${videoName}.aac`
    const audioPath = `${FFDir.RESOURCE}${audioName}`

    if (this.isFileExist(FFDir.RESOURCE, audioName)) {
      return { audioPath }
    }

    if (!this.isFileExist(FFDir.RESOURCE, filename)) {
      warn('请先写入资源')
      return { audioPath }
    }

    const resourcePath = `${FFDir.RESOURCE}${filename}`

    const commands = ['-v', 'quiet', '-i', resourcePath, '-acodec', 'copy', '-vn', audioPath]
    await this.ffmpeg.run(...commands)
    return { audioPath }
  }

  /**
   * 生成波形图片
   *
   * @param {string} audioPath 音频路径
   * @param {string} waveName 波形图片名称
   * @param options 其他配置
   */
  public async generateWaveform(
    audioPath: string,
    waveName: string,
    options: {
      width: number
      height: number
      color: string
    }
  ) {
    const wavePath = `${FFDir.WAVE}${waveName}.png`
    const { width, height } = options

    const commands = [
      '-i',
      audioPath,
      '-filter_complex',
      `aformat=channel_layouts=mono,compand,showwavespic=s=${width}x${height}:colors=${options.color}`,
      '-frames:v',
      '1',
      wavePath
    ]

    await this.ffmpeg.run(...commands)
  }

  /**
   * 获取波形图片
   *
   * @param {string} waveName 波形图片名称
   */
  public getWaveImageBlob(waveName: string) {
    const fileBuffer = this.ffmpeg.FS('readFile', `${FFDir.WAVE}${waveName}.png`)
    return new Blob([fileBuffer], { type: 'image/png' })
  }
}

const ffManager = new FFManger()

export { ffManager }
