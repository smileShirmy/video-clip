```bash
# 获取 input.mp4 总帧数
ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames -of default=nokey=1:noprint_wrappers=1 input.mp4

# 绿幕换背景
ffmpeg -i background.jpg -i initVideo -shortest -filter_complex [0:v]scale=1080:1920[img];[1:a]volume=1.0[a];[1:v]chromakey=0x00D700:0.1:0.2[ckout];[img][ckout]overlay[out] -map [a] -map [out] outfile.mp4
```
