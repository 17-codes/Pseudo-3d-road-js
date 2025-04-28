export function easeInOut(x: number) {
  return -Math.cos(x * Math.PI) / 2 + 0.5
}
export function easeInCubic(x: number) {
  return x * x * x
}
export function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3)
}
export function easeInSine(x: number) {
  return 1 - Math.cos((x * Math.PI) / 2)
}
export function easeOutSine(x: number) {
  return Math.sin((x * Math.PI) / 2)
}
export function easeInOutSine(x: number) {
  return -(Math.cos(Math.PI * x) - 1) / 2
}
export function easeOutCirc(x: number) {
  return Math.sqrt(1 - Math.pow(x - 1, 2))
}

export function getRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function MOD(a: number, b: number) {
  let v = a % b
  if (v < 0) return b + v
  return Math.abs(v)
}

export function getPercentage(x: number, total: number) {
  return x / total
}
