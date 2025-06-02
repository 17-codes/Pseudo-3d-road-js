import p5 from "p5"
import { Camera } from "./camera"
import { Road } from "./road"
import { CameraObject, ScreenObj, Segments } from "./types"
import { getPercentage, MOD } from "./helpers"

class Main {
  private p: p5
  // screen
  private windowWidth: number
  private windowHeight: number
  private centerX: number
  private centerY: number
  private gameWindow: HTMLCanvasElement
  // game
  protected drawDistance: number
  private dt: number
  private fov: number
  private depth: number

  // camera
  private Camera: Camera
  private initial_cam_height: number
  private initial_cam_x: number
  private initial_cam_z: number

  // player
  private velocity: number
  // road
  private Road: Road
  private roadWidth: number
  private segmentDistance: number
  private segments: Segments[]
  private totalSegments: number
  private trackLength: number
  private baseIndex: number

  constructor(gameWindow: HTMLCanvasElement, width = 640, height = 360, p: p5) {
    this.p = p
    // screen values
    this.windowWidth = width
    this.windowHeight = height
    this.centerX = this.windowWidth / 2
    this.centerY = this.windowHeight / 2
    this.gameWindow = gameWindow
    // game stuff
    this.dt = 0 // delta time in seconds
    this.drawDistance = 100
    this.fov = 100
    this.depth = 0

    this.velocity = 0

    // camera
    this.initial_cam_height = 800
    this.initial_cam_x = 0
    this.initial_cam_z = 0
    this.Camera = new Camera(
      this.initial_cam_x,
      this.initial_cam_height,
      this.initial_cam_z
    )

    // road
    this.roadWidth = 1200 //half width
    this.segmentDistance = 300 // each segment distance
    this.Road = new Road(this.segmentDistance, this.p)
    this.segments = []
    this.totalSegments = 0 // number of segments
    this.trackLength = 0 // segmentDistance*totalSegments
    this.baseIndex = 0 // initial index of segments where player is
  }
  pause() {
    // pause game calls a p5 function
    this.p.noLoop()
  }
  init(speed: number, drawDistance: number) {
    this.depth = 1 / Math.tan((this.fov / 2) * (Math.PI / 180))
    this.velocity = speed * 60
    this.drawDistance = drawDistance
    // create Roads
    this.Road.addHill(30, 25)
    this.Road.addCurve(50, 15)
    this.Road.addStraight(20)
    this.Road.addCurve(50, -15)
    this.Road.addHill(30, -25)
    this.segments = this.Road.getSegements()
    this.totalSegments = this.segments.length
    this.trackLength = this.Road.getTrackLength()
    this.segments[0].color = "green"
    this.segments[this.segments.length - 1].color = "red"
  }
  setup() {
    this.p.createCanvas(
      this.windowWidth,
      this.windowHeight,
      this.p.P2D,
      this.gameWindow ?? {}
    )
    this.p.angleMode(this.p.DEGREES)
  }
  // gameloop
  draw() {
    this.dt = this.p.deltaTime * 0.001 // dt in seconds
    // -- update --
    this.update()

    // -- draw --
    this.p.background("skyblue")

    this.drawRoad()
  }

  // class methods
  private update() {
    // update baseindex first to avoid projection error
    if (this.velocity != 0) {
      this.updateBaseIndex()
    }
    // update projection
    this.updateProjection()
    // movement update
    this.moveCamera(0, 0, this.velocity * this.dt)
  }
  // all update functions

  private updateBaseIndex() {
    let cameraPosition: CameraObject = this.Camera.getPositons()
    this.baseIndex =
      Math.floor(cameraPosition.z / this.segmentDistance) % this.totalSegments
  }

  private updateProjection() {
    let cameraPosition: CameraObject = this.Camera.getPositons()
    let basePercent = getPercentage(
      cameraPosition.z % this.segmentDistance,
      this.segmentDistance
    )
    let x = 0
    let baseRoad = this.segments[this.baseIndex]
    let dx = baseRoad.curve - baseRoad.curve * basePercent
    let dy = this.p.lerp(
      this.segments[MOD(this.baseIndex, this.totalSegments)].world.y,
      this.segments[MOD(this.baseIndex + 1, this.totalSegments)].world.y,
      basePercent
    )
    for (let i = 0; i < this.drawDistance; i += 1) {
      let j = (this.baseIndex + i) % this.totalSegments
      let offset = { x: 0, y: dy, z: 0 }
      if (this.segments[j].id < this.segments[this.baseIndex].id) {
        offset.z = this.trackLength
      }
      offset.x = x
      x += dx
      dx += this.segments[j].curve
      this.project(cameraPosition, this.segments[j], this.depth, offset)
    }
  }
  private moveCamera(
    increment_x: number,
    increment_y: number,
    increment_z: number
  ) {
    let cameraPosition = this.Camera.getPositons()
    this.Camera.update(
      cameraPosition.x + increment_x,
      cameraPosition.y + increment_y,
      MOD(cameraPosition.z + increment_z, this.trackLength)
    )
  }
  // all draw functions
  private drawRoad() {
    let curr_segment = null
    let next_segment = null
    // draw far segment first
    for (
      let i = this.baseIndex + this.drawDistance;
      i > this.baseIndex;
      i -= 1
    ) {
      curr_segment = this.segments[MOD(i - 1, this.totalSegments)]
      next_segment = this.segments[MOD(i, this.totalSegments)]
      let curr_screen: ScreenObj = curr_segment.screen as ScreenObj
      let next_screen: ScreenObj = next_segment.screen as ScreenObj
      if (next_screen.y >= this.windowHeight) continue
      this.p.beginShape()
      this.p.fill(curr_segment.color)
      this.p.stroke(0)
      this.p.vertex(curr_screen.x - curr_screen.width, curr_screen.y)
      this.p.vertex(curr_screen.x + curr_screen.width, curr_screen.y)
      this.p.vertex(next_screen.x + next_screen.width, next_screen.y)
      this.p.vertex(next_screen.x - next_screen.width, next_screen.y)
      this.p.endShape(this.p.CLOSE)

      this.p.beginShape()
      this.p.vertex(curr_screen.x, curr_screen.y)
      this.p.vertex(next_screen.x, next_screen.y)
      this.p.endShape()
    }
  }
  private project(
    camera: CameraObject,
    point: Segments,
    depth: number,
    offset: { x: number; y: number; z: number }
  ) {
    let tx = point.world.x - (camera.x - offset.x)
    let ty = point.world.y - (camera.y + offset.y)
    let tz = point.world.z - (camera.z - offset.z)
    point.scaleFactor = depth / tz
    point.screen.x = this.centerX + point.scaleFactor * tx * this.centerX
    point.screen.y = this.centerY - point.scaleFactor * ty * this.centerY
    point.screen.width = point.scaleFactor * this.roadWidth * this.centerX
  }
}

const sketch = (p: p5) => {
  const gamecanvas = document.querySelector("#main-canvas") as HTMLCanvasElement
  if (!gamecanvas) {
    throw new Error("Canvas element not found")
  }
  const aspectRatio = 16 / 9
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  let gameWidth = windowWidth
  let gameHeight = windowWidth / aspectRatio
  if (gameHeight > windowHeight) {
    gameHeight = windowHeight
    gameWidth = gameHeight * aspectRatio
  }
  const main = new Main(gamecanvas, gameWidth, gameHeight, p)
  main.init(30, 100)
  p.setup = () => {
    main.setup()
  }
  p.draw = () => {
    main.draw()
  }
}
new p5(sketch)
