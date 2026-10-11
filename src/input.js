export function joystickDirection(dx,dy) {
  if(Math.hypot(dx,dy)<12)return null;
  return Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
}
