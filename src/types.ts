export interface ScreenObj {
  x: number
  y: number
  width: number
}

export interface Segments {
  id: number
  world: {
    x: number
    y: number
    z: number
  }
  screen: Partial<ScreenObj>
  scaleFactor: number
  color: string
  curve: number
}

export interface CameraObject {
  x: number
  y: number
  z: number
}
