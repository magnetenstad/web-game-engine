import { GameObject } from './gameObject.ts';

export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(pos: Vec2) {
    return new Vec2(this.x + pos.x, this.y + pos.y);
  }

  snap(gridSize: number) {
    return new Vec2(
      Math.round(this.x / gridSize) * gridSize,
      Math.round(this.y / gridSize) * gridSize
    );
  }

  copy() {
    return new Vec2(this.x, this.y);
  }
}

export class PositionObject extends GameObject {
  pos: Vec2;

  constructor(x: number, y: number) {
    super();
    this.pos = new Vec2(x, y);
    this.setZIndex(y);
  }
}