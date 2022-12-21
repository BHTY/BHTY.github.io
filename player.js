import { ctx, canvas, GFX_DRAWLINE, GFX_DRAWLINES, GFX_DRAWSCENE, constrain, addArrays, rand, GFX_POLY, shieldSFX, laserSFX } from './script.js'
export function makePlayer() {
  let p = {
    pos: [0, 0, 0],
    rot: [0, 0, 0],
    vel: [0, 0, 0],
    speed: [0.8, 0.5, 0.25],
    verts: [],
    tris: [],
    collider: {
      origin: [-1, -1, -3],
      size: [2, 2, 3]
    },
    reticle: {
      pos: [0, 0],
      min: [-30, -15],
      max: [30, 15],
      speed: [4, 2, 0],
      size: [4, 4],
      return: 2,
    },
    fire: {
      origins: [[-1, -1, -1], [1, -1, -1]],
      color: "#00C0FF",
      active: false,
      energy: { amount: 200, max: 200, threshold: 100, depletion: 1, recovery: 2 },
    },
    health: 100,
    shield: {
      energy: { amount: 300, max: 300, threshold: 100, depletion: 1, recovery: 1, hitDepletion: 15 },
      color: [100, 100, 255, 1],
      timer: 0,
      numLines: 10,
      lines: [],
      active: false,
    },
    lives: 3,
    score: 0,
    action: { //x action is -1 when left and 1 when right. 0 when neither or both. Same idea for y
      move: [0, 0, 1],
      shield: false,
      fire: false
    }
  }

  return p
}

function moveReticle(s, p) {
  let r = p.reticle
  let a = p.action
  let d = [a.move[0] * r.speed[0], a.move[1] * r.speed[1]]
  for (let i = 0; i < r.pos.length; i++) {
    //changes the reticle by d but constrains by reticle bounds
    //might change this?
    r.pos[i] = constrain(r.pos[i] + d[i], r.min[i], r.max[i])
  }
  if ((d[0] === 0 || d[1] === 0) && (r.pos[0] !== 0 || r.pos[1] !== 0)) {

    let mag = Math.sqrt(Math.pow(r.pos[0], 2) + Math.pow(r.pos[1], 2))


    let change = [r.return * r.pos[0] / mag, r.return * r.pos[1] / mag]


    if (d[0] !== 0) {
      change[0] = 0
    }
    if (d[1] !== 0) {
      change[1] = 0
    }
    for (let i = 0; i < r.pos.length; i++) {
      //if the player stops moving, the reticle moves back to the center
      //wacky constrain stuff is to prevent overshooting
      //might change this?


      r.pos[i] = constrain(
        r.pos[i] - change[i],
        r.pos[i] > 0 ? 0 : r.min[i],
        r.pos[i] >= 0 ? r.max[i] : 0)
      /*
      r.pos[i] = constrain(
        r.pos[i] - Math.sign(r.pos[i]) * r.speed[i] / 2,
        r.pos[i] > 0 ? 0 : r.min[i],
        r.pos[i] >= 0 ? r.max[i] : 0)
      */

    }

  }
  //r.pos = [0, 0]

}

function movePlayer(s, p) {
  let a = p.action
  //adds button presses to velocity
  for (let i = 0; i < p.pos.length; i++) {
    p.vel[i] = a.move[i] * p.speed[i]
  }

  //adds velocity to position (no rotation scaling for now)
  for (let i = 0; i < p.pos.length; i++) {
    p.pos[i] += p.vel[i]

    if (s.min[i]) {
      p.pos[i] = constrain(p.pos[i], s.min[i] - p.collider.origin[i], s.max[i] - (p.collider.origin[i] + p.collider.size[i]))

    }
  }



}

export function drawFire(s, p) {



  let f = p.fire
  let c = [canvas.width / 2, canvas.height / 2]

  let r = p.reticle

  var fire = {
    pos: p.pos,
    rot: [0, 0, 0],
    color: f.color,
    verts: [f.origins[0], f.origins[1], [r.pos[0], r.pos[1], 100]],
    tris: [new GFX_POLY([0, 2], f.color), new GFX_POLY([1, 2], f.color)]
  };

  GFX_DRAWSCENE([fire], p.pos, [0, 0, 0])

  //doesn't work?
  //GFX_DRAWLINES([[f.origins[0], addArrays(r.pos, [c[0], c[1], 0])], [addArrays(f.origins[1], [2 * c[0], 2 * c[1], 0]), [addArrays(r.pos, [c[0], c[1], 0])]]], f.color)
}

export function drawShield(s, p) {
  let sh = p.shield
  let c = [canvas.width / 2, canvas.height / 2]

  sh.timer += 1
  sh.color[3] = 0.1 * -Math.cos(2 * Math.PI * sh.timer / 120) + 0.4

  sh.lines = []
  for (let i = 0; i < sh.numLines; i++) {
    sh.lines.push([rand(0, 2 * c[0]), rand(0, 2 * c[0]), rand(0, c[1] * 2)])
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(" + sh.color[0] + "," + sh.color[1] + "," + sh.color[2] + "," + sh.color[3] + ")";
  ctx.fillRect(0, 0, 2 * c[0], 2 * c[1]);
  ctx.fill();

  for (let i = 0; i < sh.numLines; i++) {
    GFX_DRAWLINE([sh.lines[i][0], sh.lines[i][2]], [sh.lines[i][1], sh.lines[i][2]], "rgba(" + sh.color[0] + "," + sh.color[1] + "," + sh.color[2] + "," + rand(0, 0.25) + ")")
  }
}



export function updatePlayer(s, p) {

  movePlayer(s, p)
  moveReticle(s, p)

  let e = p.fire.energy

  if (p.action.fire && e.amount > 0) {
    if ((!p.fire.active && e.amount > e.threshold) || p.fire.active) {
      p.fire.active = true
      e.amount = Math.max(0, e.amount - e.depletion)
      laserSFX.play()
    } else {
      e.amount = Math.min(e.max, e.amount + e.recovery)
      laserSFX.pause()
      laserSFX.currentTime = 0
    }
  } else {
    p.fire.active = false
    laserSFX.pause()
    laserSFX.currentTime = 0
    e.amount = Math.min(e.max, e.amount + e.recovery)
  }
  //console.log("after: " + p.fire.energy)

  e = p.shield.energy

  if (p.action.shield && e.amount > 0) {
    if ((!p.shield.active && e.amount > e.threshold) || p.shield.active) {
      e.amount = Math.max(0, e.amount - e.depletion)
      p.shield.active = true
      shieldSFX.play()
    } else {
      shieldSFX.pause()
      shieldSFX.currentTime = 0
      e.amount = Math.min(e.max, e.amount + e.recovery)
    }
  } else {
    p.shield.timer = 0
    p.shield.active = false
    shieldSFX.pause()
    shieldSFX.currentTime = 0
    e.amount = Math.min(e.max, e.amount + e.recovery)

  }

}
