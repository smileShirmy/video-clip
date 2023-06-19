interface Video {
  name: string
  format: string
  source: string
  width: number
  height: number
  fps: number
  frameCount: number
}

export const videos: Video[] = [
  {
    name: 'video-1',
    format: 'mp4',
    source: '/videos/video-1.mp4',
    width: 1920,
    height: 1080,
    fps: 30,
    frameCount: 1920
  }
]
