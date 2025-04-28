export class Camera {
  private y: number
  private x: number
  private z: number
  constructor(x: number, height: number, z: number) {
    this.y = height 
    this.x = x
    this.z = z
  }
  update(x = 0, y = 0, z = 0) {
    this.z = z
    this.x = x
    this.y = y
  }
  updateX(x: number) {
    this.x = x
  }
  updateZ(z: number) {
    this.z = z
  }
  updateY(y: number) {
    this.y = y
  }
  getPositons() {
    return { x: this.x, y: this.y, z: this.z }
  }
}
