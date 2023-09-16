```bash
# 获取 input.mp4 总帧数
ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nokey=1:noprint_wrappers=1 input.mp4

# 绿幕换背景
ffmpeg -i background.jpg -i initVideo -shortest -filter_complex [0:v]scale=1080:1920[img];[1:a]volume=1.0[a];[1:v]chromakey=0x00D700:0.1:0.2[ckout];[img][ckout]overlay[out] -map [a] -map [out] outfile.mp4
```

```bash
# 视频裁剪

# -i in.mov 输入
# -vf 视频滤镜
# crop 滤镜名称
# =in_w 本身视频的宽
# -200 本身视频的宽减去 200
# in_h-200 本身视频的高度减去 200
# 默认是以中心点为基准
# -c:v 使用什么视频编码器
# libx264 视频编码器
# -c:a 使用什么音频编码器
# copy 不做处理直接复制
# out.mp4 输出文件
ffmpeg -i in.mov -vf crop=in_w-200:in_h-200 -c:v libx264 -c:a copy out.mp4

# crop 格市：crop=out_w:out_h:x:y
```

```bash
# 视频裁剪
# -ss 指定开始点
# -t 持续多长时间
# 10 10秒
ffmpeg -i in.mp4 -ss 00:00:00 -t 10 out.ts
```

```bash
# 音视频合并
# -f concat 对后面的文件进行拼接
# inputs.txt 文件列表，记录了所有想合并的视频文件的名字
# inputs.txt 内容为 file filename 格式
ffmpeg -f concat -i inputs.txt out.flv

# inputs.txt 内容
file '1.ts'
file '2.ts'
```

```bash
# 视频转图片
# -r 1 每秒转出 1 张图片
# -f 转成什么格式 image2 格式
# image-%3d.jpeg 由 3 个数字组成
ffmpeg -i in.flv -r 1 -f image2 image-%3d.jpeg

# 图片转视频
ffmpeg -i image-%3d.jpeg out.mp4
```

```bash
# 直播推流
# -re 减慢帧率速度，和真正的帧率保持同步
ffmpeg -re -i out.mp4 -c copy -f flv rtmp://server/live/streamName

# 直播拉流
ffmpeg -i rtmp://server/live/streamName -c copy dump.flv
```

```bash
# 滤镜
# 输出所有滤镜
ffmpeg -filters
# 查看帮助
ffmpeg -h filter=drawbox
# 在 avfilter 参数之间用 `:` 分割
# 在 avfilter 之间串联用 `,`分割，前一个是后一个的输入
# 在 avfilter 之间没有关联用 `;` 分割

ffmpeg -i input.mp4 -vf "movie=logo.png,scale=64:64[wm];[in][wm]overlay=30:10"
```
