export function normalizeAngle(angle: number) {
  angle = (angle + Math.PI) % (Math.PI * 2);
  if (angle < 0) angle += Math.PI * 2;
  return angle - Math.PI;
}

export function angleDifference(a: number, b: number) {
  return normalizeAngle(b - a);
}

export function lerpAngle(a: number, b: number, t: number) {
  return a + angleDifference(a, b) * t;
}