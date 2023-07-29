# 思路

缩放：以中心纵轴作为基准，距离纵轴距离越近则缩放的倍数越小

旋转：以中心点为目标进行旋转

## 缩放

基础属性：

```ts
const attribute = {
  height: 200,
  width: 200,
  top: 0,
  left: 0,
  scale: 1,
  rotate: 0
}
```

计算的时候是根据舞台左上角作为坐标点，还是根据整个视窗左上角作为坐标点？抑或是别的计算方式？

使用 `transform: translate()` 来进行计算

点击某个操作目标时，获取四个顶点相对于画布左上角的坐标

假如当前目标的位置是 `[100, 100]`

1. 没有旋转的情况

根据基础属性初始化后 moveable 得到 `[0, 0], [200, 0], [200, 0], [200, 200]` 四个点，相对于屏幕左上角

那么中心点就是 `[100, 100]`

按下四个点均可以进行缩放，这时需要计算点到中心纵轴的距离

```js
Math.abs(pointX - centerX)
```

没有旋转当然什么都容易啦，但是要旋转就麻烦了，需要更为通用的公式

2. 旋转的情况

根据基础属性初始化后 moveable 得到 `[0, 0], [200, 0], [200, 0], [200, 200]` 四个点，相对于屏幕左上角

那么中心点就是 `[100, 100]`

旋转按钮位置假设为 `[100, 300]`

```js
function getDegree(x, y, centerX, centerY) {
  const addX = x - centerX
  const addY = y - centerY
  let degree = (Math.atan(addX / addY) / Math.PI) * 180

  // 第一象限
  if (addX >= 0 && addY < 0) {
    degree = 180 + Math.abs(degree)
  }
  // 第二象限
  else if (addX <= 0 && addY < 0) {
    degree = 180 - Math.abs(degree)
  }
  // 第三象限
  else if (addX <= 0 && addY > 0) {
    degree = Math.abs(degree)
  }
  // 第四象限
  else if (addX >= 0 && addY > 0) {
    degree = 360 - Math.abs(degree)
  }

  return degree
}

// 第三象限
getAngle(0, 200, 100, 100) // 45

// 第二象限
getAngle(0, 0, 100, 100) // 135

// 第一象限
getAngle(200, 0, 100, 100) // 225

// 第四象限
getAngle(200, 200, 100, 100) // 315
```

# 计算

1. 计算之前要先获取中心点的坐标，然后根据旋转角度去计算四个顶点的坐标

如何获取中心点坐标？

```ts
const { top, left, width, height } = $0.getBoundingClientRect()
```

`width / 2` 得到的是横坐标，`height / 2` 得到的是纵坐标，如果是相对于整个画布，则加上距离画布左上角顶点的坐标，如果是相对于整个视窗则加上 `top` 和 `left`

这个中心点坐标是相对于画布固定的，因此可以作为计算的基准，这样有旋转角度和原本四个点的坐标（根据中心坐标，放大倍数，宽高进行计算）就能计算出四个顶点旋转后的坐标

2. 根据中心点坐标，当前旋转角度，计算四个顶点的坐标

```js
function degreeToRadian(degree) {
  return ((2 * Math.PI) / 360) * degree
}

function getRotatedPoint(point, center, rotate) {
  /**
   * 旋转公式：
   *  点a(x, y)
   *  旋转中心c(x, y)
   *  旋转后点n(x, y)
   *  旋转角度θ
   * nx = cosθ * (ax - cx) - sinθ * (ay - cy) + cx
   * ny = sinθ * (ax - cx) + cosθ * (ay - cy) + cy
   */
  return {
    x:
      (point.x - center.x) * Math.cos(degreeToRadian(rotate)) -
      (point.y - center.y) * Math.sin(degreeToRadian(rotate)) +
      center.x,
    y:
      (point.x - center.x) * Math.sin(degreeToRadian(rotate)) +
      (point.y - center.y) * Math.cos(degreeToRadian(rotate)) +
      center.y
  }
}

getRotatedPoint({ x: 0, y: 0 }, { x: 100, y: 100 }, 45) // {x: 100, y: -41.42135623730951}
getRotatedPoint({ x: 0, y: 0 }, { x: 100, y: 100 }, 90) // {x: 200, y: 0}
```

如何获取旋转前的四个顶点坐标？

<!-- 根据中心点进行反推，已知缩放倍数和初始宽高 -->
