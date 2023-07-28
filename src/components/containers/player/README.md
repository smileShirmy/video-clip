# 思路

缩放：以中心纵轴作为基准，距离纵轴距离越近则缩放的倍数越小

旋转：以中心点为目标进行旋转

## 缩放

基础属性：

```ts
const attribute = {
  height: 100,
  width: 100,
  top: 0,
  left: 0,
  scale: 1,
  rotate: 0
}
```

1. 没有旋转的情况（画布左上角位置为`[200, 200]`）

根据基础属性初始化后 moveable 得到 `[200, 200], [400, 200], [200, 400], [400, 400]` 四个点，相对于屏幕左上角

那么中心点就是 `[300, 300]`

按下四个点均可以进行缩放，这时需要计算点到中心纵轴的距离

```js
Math.abs(pointX - centerX)
```

没有旋转当然什么都容易啦，但是要旋转就麻烦了，需要更为通用的公式

2. 旋转的情况（画布左上角位置为`[200, 200]`）

根据基础属性初始化后 moveable 得到 `[200, 200], [400, 200], [200, 400], [400, 400]` 四个点，相对于屏幕左上角

那么中心点就是 `[300, 300]`

旋转按钮位置假设为 `[300, 400]`

```js
function getAngle(x, y, centerX, centerY) {
  const addX = x - centerX
  const addY = y - centerY
  let angle = (Math.atan(addX / addY) / Math.PI) * 180

  // 第一象限
  if (addX >= 0 && addY < 0) {
    angle = 180 + Math.abs(angle)
  }
  // 第二象限
  else if (addX <= 0 && addY < 0) {
    angle = 180 - Math.abs(angle)
  }
  // 第三象限
  else if (addX <= 0 && addY > 0) {
    angle = Math.abs(angle)
  }
  // 第四象限
  else if (addX >= 0 && addY > 0) {
    angle = 360 - Math.abs(angle)
  }

  return angle
}

// 第三象限
getAngle(200, 400, 300, 300) // 45

// 第二象限
getAngle(200, 200, 300, 300) // 135

// 第一象限
getAngle(400, 200, 300, 300) // 225

// 第四象限
getAngle(400, 400, 300, 300) // 315
```

TODO: 计算的时候是根据舞台左上角作为坐标点，还是根据整个视窗左上角作为坐标点？抑或是别的计算方式？
