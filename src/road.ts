import p5 from "p5"
import { easeInOutSine, easeInSine, easeOutSine } from "./helpers"
import { Segments } from "./types"
export class Road {
  private segments: Segments[]
  private trackLength: number
  private segmentDistance: number
  private p: p5
  constructor(segmentDistance: number, p: p5) {
    this.segments = []
    this.trackLength = 0
    this.segmentDistance = segmentDistance
    this.p = p
  }
  getSegements(): Segments[] {
    return this.segments
  }
  getTrackLength() {
    return this.trackLength
  }
  addStraight(n: number) {
    this.addRoad(n, n, n, 0, 0)
  }
  addCurve(n: number, curve: number) {
    this.addRoad(n, n, n, curve, 0)
  }
  addHill(n: number, hill: number) {
    this.addRoad(n, n, n, 0, hill)
  }
  private addRoad(
    enter: number,
    hold: number,
    leave: number,
    curve: number,
    hill: number = 0
  ) {
    let startY = this.lastY()
    let endY = startY + hill * this.segmentDistance
    let t = enter + hold + leave
    for (let i = 0; i < enter; i++) {
      this.addSegment(
        this.p.lerp(0, curve, easeInSine(i / enter)),
        this.p.lerp(startY, endY, easeInOutSine(i / t))
      )
    }
    for (let i = 0; i < hold; i++) {
      this.addSegment(
        curve,
        this.p.lerp(startY, endY, easeInOutSine((enter + i) / t))
      )
    }

    for (let i = 0; i < leave; i++)
      this.addSegment(
        this.p.lerp(curve, 0, easeOutSine(i / enter)),
        this.p.lerp(startY, endY, easeInOutSine((enter + hold + i) / t))
      )

    this.trackLength = this.segments[this.segments.length - 1].world.z
  }
  private addSegment(curve: number, hill: number = 0) {
    this.segments.push({
      id: this.segments.length,
      world: {
        x: 0,
        y: hill,
        z: (this.segments.length + 1) * this.segmentDistance,
      },
      screen: {},
      scaleFactor: -1,
      color: "grey",
      curve,
    })
  }
  private lastY() {
    let n = this.segments.length
    return n == 0 ? 0 : this.segments[n - 1].world.y
  }
}
