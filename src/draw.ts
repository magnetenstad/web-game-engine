import { ImageAsset } from './assets'
import { Camera } from './camera'
import { Vec2 } from './math'

export type DrawStyle = {
  strokeStyle?: string
  lineWidth?: number
  fillStyle?: string
  font?: string
  fontSize?: number
  gui?: boolean
  imageSmoothingEnabled?: boolean
}

export class Canvas {
  private __parentElement: HTMLElement
  private __canvasElement: HTMLCanvasElement
  private __ctx: CanvasRenderingContext2D
  private __scale?: number = 1
  camera?: Camera

  constructor(__parentDiv: HTMLElement) {
    this.__parentElement = __parentDiv
    this.__canvasElement = document.createElement('canvas')
    this.__canvasElement.classList.add('gameCanvas')
    this.__parentElement.appendChild(this.__canvasElement)
    this.__ctx = this.__canvasElement.getContext('2d', { alpha: false })!
  }

  __getCameraPositionDelta() {
    if (!this.camera?.target) return new Vec2(0, 0)
    const positionDelta = this.camera.target.pos.minus(this.camera.posPrev)
    this.camera.posPrev = this.camera.target?.pos
    return positionDelta
  }

  setOptions(options: { width?: number; height?: number; scale?: number }) {
    this.__canvasElement.width = options.width ?? this.__canvasElement.width
    this.__canvasElement.height = options.height ?? this.__canvasElement.height
    this.__scale = options.scale ?? this.__scale
    if (options.scale) {
      this.__ctx.scale(options.scale, options.scale)
    }
  }

  get element() {
    return this.__canvasElement
  }

  get scale() {
    return this.__scale
  }

  private withStyle(style: DrawStyle, func: () => void) {
    this.__ctx.save()
    if (style.strokeStyle !== undefined)
      this.__ctx.strokeStyle = style.strokeStyle
    if (style.lineWidth !== undefined) this.__ctx.lineWidth = style.lineWidth
    if (style.fillStyle !== undefined) this.__ctx.fillStyle = style.fillStyle
    if (style.font !== undefined || style.fontSize !== undefined)
      this.__ctx.font = `${style.fontSize ?? 8}px ${style.font ?? 'arial'}`
    if (style.imageSmoothingEnabled != undefined)
      this.__ctx.imageSmoothingEnabled = style.imageSmoothingEnabled
    func()
    this.__ctx.restore()
  }

  private withStyleAndPos(
    style: DrawStyle,
    func: (pos: Vec2) => void,
    pos: Vec2
  ) {
    this.withStyle(style, () => {
      if (this.camera && !style.gui) {
        func(this.camera.toCanvasPosition(pos))
      } else {
        func(pos)
      }
    })
  }

  private withStyleAndPositions(
    style: DrawStyle,
    func: (positions: Vec2[]) => void,
    positions: Vec2[]
  ) {
    this.withStyle(style, () => {
      if (this.camera && !style.gui) {
        func(positions.map((pos) => this.camera!.toCanvasPosition(pos)))
      } else {
        func(positions)
      }
    })
  }

  drawRect(pos: Vec2, size: Vec2, style?: DrawStyle) {
    const _style = Object.assign({ fillStyle: 'white' }, style)
    this.withStyleAndPos(
      _style,
      (pos: Vec2) => {
        if (this.__ctx.fillStyle)
          this.__ctx.fillRect(pos.x, pos.y, size.x, size.y)
        if (this.__ctx.strokeStyle)
          this.__ctx.strokeRect(pos.x, pos.y, size.x, size.y)
      },
      pos
    )
  }

  drawClear() {
    this.__ctx.clearRect(
      0,
      0,
      this.__canvasElement.width,
      this.__canvasElement.height
    )
  }

  drawImage = (
    imageAsset: ImageAsset,
    pos: Vec2,
    scale?: number,
    style?: DrawStyle
  ) => {
    const _style = Object.assign({ imageSmoothingEnabled: false }, style)
    this.withStyleAndPos(
      _style,
      (pos: Vec2) => {
        if (imageAsset.image) {
          this.__ctx.drawImage(
            imageAsset.image,
            pos.x,
            pos.y,
            imageAsset.image.width * (scale ?? 1),
            imageAsset.image.height * (scale ?? 1)
          )
        }
      },
      pos
    )
  }

  drawPath(points: Vec2[], style?: DrawStyle) {
    const _style = Object.assign(
      {
        strokeStyle: 'white',
        lineWidth: 1,
      },
      style
    )
    this.withStyleAndPositions(
      _style,
      (points: Vec2[]) => {
        this.__ctx.beginPath()
        this.__ctx.moveTo(points[0].x, points[0].y)
        for (let i = 0; i < points.length; i++) {
          this.__ctx.lineTo(points[i].x, points[i].y)
        }
        this.__ctx.stroke()
      },
      points
    )
  }

  drawLine(
    a: Vec2,
    b: Vec2,
    options: {
      startOffset?: number
      endOffset?: number
      maxLength?: number
      minLength?: number
    },
    style?: DrawStyle
  ) {
    const _a = a.copy()
    const _b = b.copy()
    const angle = Math.atan2(_b.y - _a.y, _b.x - _a.x)
    if (options.startOffset) {
      _a.x += options.startOffset * Math.cos(angle)
      _a.y += options.startOffset * Math.sin(angle)
    }
    if (options.endOffset) {
      _b.x += options.endOffset * Math.cos(angle)
      _b.y += options.endOffset * Math.sin(angle)
    }
    const length = _a.lengthTo(_b)
    if (options.maxLength && length > options.maxLength) {
      _b.x = _a.x + options.maxLength * Math.cos(angle)
      _b.y = _a.y + options.maxLength * Math.sin(angle)
    } else if (options.minLength && length < options.minLength) {
      _b.x = _a.x + options.minLength * Math.cos(angle)
      _b.y = _a.y + options.minLength * Math.sin(angle)
    }
    this.drawPath([_a, _b], style)
  }

  drawText(text: string, pos: Vec2, style?: DrawStyle) {
    const _style = Object.assign(
      { fillStyle: 'white', font: 'arial', fontSize: 8 },
      style
    )
    this.withStyleAndPos(
      _style,
      (pos: Vec2) => {
        this.__ctx.fillText(text, pos.x, pos.y + (_style.fontSize ?? 0))
      },
      pos
    )
  }

  drawCircle(radius: number, pos: Vec2, style?: DrawStyle) {
    const _style = Object.assign({ fillStyle: 'white' }, style)
    this.withStyleAndPos(
      _style,
      (pos: Vec2) => {
        this.__ctx.beginPath()
        this.__ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        this.__ctx.closePath()
        if (this.__ctx.fillStyle) this.__ctx.fill()
        if (this.__ctx.strokeStyle) this.__ctx.stroke()
      },
      pos
    )
  }
}
