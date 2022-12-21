import { makePlayer, updatePlayer } from './player.js'
import { collide, newObject, updateObject, changeObjColor, makeDebris } from './objects.js'
import { ctx, canvas, GFX_DRAWLINE, GFX_DRAWLINES, GFX_DRAWSCENE, shake, constrain, increase_score, rand, addArrays, sound, destroySFX } from './script.js'

export function newSpace() {
  let space = {
    player: makePlayer(),
    objects: [],
    mesh: [],
    min: [-40, -20],
    max: [40, 20],
    starField: {
      stars: [],
      maxStars: 150,
      speed: 1,
    },
    timer: 0,
    shakeframes: 0,
    score: 0,
  }

  /*
  space.objects.push(newObject("cube", {
    pos: [5, 0, 5],
    verts: [[1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1]],
    polys: [
      [0, 1, 3, 2], [4, 5, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5], [0, 1, 5, 4], [3, 7, 6, 2]],
    collider: {
      origin: [-1, -1, -1],
      size: [2, 2, 2],
    },
  }))

  space.objects.push(newObject("ship", {
    pos: [5, 0, 10],
    verts: [[0, 0, -2],
    [0, 0, 1],
    [-1, 1, 2],
    [1, 1, 2],
    [0, -2, 2]],
    polys: [[0, 2, 1], [0, 3, 1], [0, 4, 1]],
    collider: {
      origin: [-1, -1, -2],
      size: [2, 2, 3],
    },
  }))
  */

  return space
}


export function updateSpace(s, keys) {
  let p = s.player
  let a = s.player.action

  a.move[0] = keys.rightarrow - keys.leftarrow
  a.move[1] = keys.downarrow - keys.uparrow
  a.fire = keys.z === 1
  a.shield = keys.x === 1
  //player stuff


  if (p.health > 0) {
    if (s.timer % 60 === 0) {
      s.objects.push(newObject("ship", {
        pos: [rand(s.min[0], s.max[0]), rand(s.min[1], s.max[1]), p.pos[2] + 100],
        verts: [[0, 0, -2],
        [0, 0, 1],
        [-1, 1, 2],
        [1, 1, 2],
        [0, -2, 2]],
        polys: [[0, 2, 1], [0, 3, 1], [0, 4, 1]],
        collider: {
          origin: [-1.5, -1.5, -2],
          size: [3, 3, 3], //(2, 2)
        },
        AI: { //the AI could just be a function and the objects could have some state vars
          move: "straight",
          fire: {
            rate: 60,
            timer: 1,
            bullet: {
              AI: {
                move: "aimed"
              },
              name: "laser",
              destructible: false,
              vel: [0, 0, -1],
              randOffset: [[-.1, .1], [-.1, .1], [-.1, .1]],
              collider: {
                origin: [0, 0, 0],
                size: [0, 0, 0],
              },
              verts: [[0, 0, 1], [0, -0.5, -1], [0, 0.5, -1], [0.5, 0, -1], [-0.5, 0, -1]],
              polys: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3, 2, 4]],
              //color: "#5555ff"
              color: "#FF8000"
            }
          }
        }
      }))
    } else if (s.timer % 200 === 0) {
      s.objects.push(newObject("gunner", {
        pos: [rand(s.min[0], s.max[0]), rand(s.min[1], s.max[1]), p.pos[2] + 100],
        verts: [[0, 0, -2],
        [0, 0, 1],
        [-1, 1, 2],
        [1, 1, 2],
        [0, -2, 2]],
        color: "#8888FF",
        polys: [[0, 2, 1], [0, 3, 1], [0, 4, 1]],
        collider: {
          origin: [-1.5, -1.5, -2],
          size: [3, 3, 3],
        },
        AI: { //the AI could just be a function and the objects could have some state vars
          move: "straight",
          fire: {
            rate: 10,
            timer: 1,
            bullet: {
              AI: {
                move: "straight"
              },
              name: "laser",
              vel: [0, 0, -1],
              destructible: false,
              randOffset: [[-.4, .4], [-.4, .4], [0, 0]],
              collider: {
                origin: [0, 0, 0],
                size: [0, 0, 0],
              },
              verts: [[0, 0, 1], [0, -0.5, -1], [0, 0.5, -1], [0.5, 0, -1], [-0.5, 0, -1]],
              polys: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3, 2, 4]],
              color: "#5555ff"
              //color: "#FF8000"
            }
          }
        }
      }))
    } else if (s.timer % 130 === 0) {
      s.objects.push(newObject("cruiser", {
        pos: [rand(s.min[0], s.max[0]), rand(s.min[1], s.max[1]), p.pos[2] + 100],
        verts: [[0, 0, -2],
        [0, 0, 1],
        [-1, 1, 2],
        [1, 1, 2],
        [0, -2, 2]],
        color: "#FF4444",
        polys: [[0, 2, 1], [0, 3, 1], [0, 4, 1]],
        collider: {
          origin: [-1.5, -1.5, -2],
          size: [3, 3, 3],
        },
        AI: { //the AI could just be a function and the objects could have some state vars
          move: "straight",
          fire: {
            rate: 90,
            timer: 1,
            bullet: {
              AI: {
                move: "homing"
              },
              name: "laser",
              vel: [0, 0, -0.5],
              destructible: false,
              randOffset: [[-.2, .2], [-.2, .2], [-.2, .2]],
              collider: {
                origin: [0, 0, 0],
                size: [0, 0, 0],
              },
              verts: [[0, 0, 1], [0, -0.5, -1], [0, 0.5, -1], [0.5, 0, -1], [-0.5, 0, -1]],
              polys: [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3, 2, 4]],
              color: "#FF7777"
              //color: "#FF8000"
            }
          }
        }
      }))
    }
  }

  if (p.health > 0) {
    updatePlayer(s, p)
  }

  //object stuff


  for (let i = 0; i < s.objects.length; i++) {
    let destroyed = false
    let hit = false
    updateObject(s, s.objects[i])

    if (collide(p, s.objects[i])) {
      s.objects[i] = changeObjColor(s.objects[i], "#ff0000")
      if (!p.shield.active && s.objects[i].name !== "debris") {
        p.health -= 10
        //console.log("COLLIDE" + s.objects.name)
        //console.log("Play hit taken SFX");
        shake();
        destroyed = true;
      } else {
        p.shield.energy.amount = Math.max(0, p.shield.energy.amount - p.shield.energy.hitDepletion)
      }
    }

    if (s.objects[i].pos[2] < p.pos[2]) {
      destroyed = true
    }
    if (p.fire.active) {
      for (let j = 0; j < p.fire.origins.length; j++) {

        if (raymarch(addArrays(p.pos, p.fire.origins[j]), addArrays(p.pos, [p.reticle.pos[0], p.reticle.pos[1], 100]), s.objects[i])) {
          //console.log(s.objects[i].name, s.objects[i].destructible)


          destroyed = s.objects[i].destructible



          if (destroyed && !hit) {
            hit = true
            console.log("Direct hit, play laser hit SFX");

            let dest = document.getElementById("destroy").cloneNode(false)
            dest.volume = 0.2
            dest.play()


            increase_score();
            console.log(s.timer, "score", i)
            for (let d = 0; d < 5; d++) {
              s.objects.push(makeDebris(s.objects[i].pos, s.objects[i].color))

            }
          }

          //s.objects[i] = changeObjColor(s.objects[i], "#00ff00")
        }
      }
    }
    if (destroyed) {
      s.objects.splice(i, 1)
      i--
    }
  }

  s.timer++

}

function pushTo(arr, obj) {
  arr.push(obj)
}

export function drawObjects(s) {

  GFX_DRAWSCENE(s.objects, s.player.pos, s.player.rot)

}

export function drawUI(s) {
  let p = s.player

  let r = p.reticle

  let w = 320
  let h = 240
  let center = [w / 2, h / 2]


  let xDir = ['min', 'max']
  let yDir = ['max', 'min']
  for (let x = 0; x < xDir.length; x++) {
    for (let y = 0; y < yDir.length; y++) {

      GFX_DRAWLINES([[
        [center[0] + r[xDir[x]][0], center[1] + r[yDir[y]][1]],
        [center[0] + r[xDir[x]][0], center[1] + r[yDir[y]][1] / 2]],

      [[center[0] + r[xDir[x]][0], center[1] + r[yDir[y]][1]],
      [center[0] + r[xDir[x]][0] / 2, center[1] + r[yDir[y]][1]]],
      ], "#ffffff");

    }
  }
  GFX_DRAWLINES(
    [
      [[r.pos[0] + center[0] + r.size[0], r.pos[1] + center[1] + r.size[1]], [r.pos[0] + center[0] + r.size[0], r.pos[1] + center[1] - r.size[1]]],
      [[r.pos[0] + center[0] + r.size[0], r.pos[1] + center[1] + r.size[1]], [r.pos[0] + center[0] - r.size[0], r.pos[1] + center[1] + r.size[1]]],
      [[r.pos[0] + center[0] - r.size[0], r.pos[1] + center[1] - r.size[1]], [r.pos[0] + center[0] + r.size[0], r.pos[1] + center[1] - r.size[1]]],
      [[r.pos[0] + center[0] - r.size[0], r.pos[1] + center[1] - r.size[1]], [r.pos[0] + center[0] - r.size[0], r.pos[1] + center[1] + r.size[1]]]
    ], "#ffffff")


  drawEnergyBars(s)
  //drawMiniMap(s)

}

function drawMiniMap(s) {
  let p = s.player
  ctx.stroke();
  ctx.fillStyle = "#4444FF";
  ctx.fillRect(5, 5, 40, 20);
  ctx.fill();
  ctx.fillStyle = "#FF4444";
  ctx.fillRect(25 + 1 * (p.collider.origin[0] + p.pos[0]), 15 + 1 * (p.collider.origin[1] + p.pos[1]), 1 * p.collider.size[0], 1 * p.collider.size[1]);
  ctx.fill();
}

function drawEnergyBars(s) {
  let p = s.player

  let scaleX = canvas.width / 320
  let scaleY = canvas.height / 240

  //fire energy


  let w = 10
  let h = 20

  let e = p.fire.energy

  ctx.stroke();
  ctx.fillStyle = "#666666";
  ctx.fillRect(5 * scaleX, 5 * scaleY, w * scaleX, h * scaleY);
  ctx.fill();
  ctx.fillStyle = "#00C0FF";
  ctx.fillRect(5 * scaleX, (5 + h - (h * (e.amount / e.max))) * scaleY, w * scaleX, (h * (e.amount / e.max)) * scaleY);
  ctx.fill();

  GFX_DRAWLINE([5, 5 + h - h * (e.threshold / e.max)], [5 + w, 5 + h - h * (e.threshold / e.max)], "#222222")

  //shield energy

  w = 10
  h = 20

  e = p.shield.energy

  ctx.stroke();
  ctx.fillStyle = "#666666";
  ctx.fillRect(305 * scaleX, 5 * scaleY, w * scaleX, h * scaleY);
  ctx.fill();
  ctx.fillStyle = "#6464FF";
  ctx.fillRect(305 * scaleX, (5 + h - (h * (e.amount / e.max))) * scaleY, w * scaleX, (h * (e.amount / e.max)) * scaleY);
  ctx.fill();

  GFX_DRAWLINE([305, 5 + h - h * (e.threshold / e.max)], [305 + w, 5 + h - h * (e.threshold / e.max)], "#222222")

}

export function starField(s) {
  let sf = s.starField

  for (let i = 0; i < constrain(sf.maxStars - sf.stars.length, 0, 2); i++) {
    sf.stars.push([0, rand(0, 2 * Math.PI)])
  }

  for (let i = 0; i < sf.stars.length; i++) {
    sf.stars[i][0] += sf.speed

    let x = sf.stars[i][0] * Math.cos(sf.stars[i][1])
    let y = sf.stars[i][0] * Math.sin(sf.stars[i][1])

    let c = [canvas.width / 2, canvas.height / 2]

    if (((x + c[0]) < 0) || ((x + c[0]) > canvas.width) || ((y + c[1]) < 0) || ((y + c[1]) > canvas.height)) {
      sf.stars[i] = [0, rand(0, 2 * Math.PI)]
    }



  }


}

export function drawField(s) {
  let sf = s.starField
  let p = s.player
  for (let i = 0; i < sf.stars.length; i++) {

    let x = sf.stars[i][0] * Math.cos(sf.stars[i][1])
    let y = sf.stars[i][0] * Math.sin(sf.stars[i][1])
    let dx = (sf.stars[i][0] + sf.speed) * Math.cos(sf.stars[i][1])
    let dy = (sf.stars[i][0] + sf.speed) * Math.sin(sf.stars[i][1])
    let c = [320 / 2 + p.pos[0], 240 / 2 + p.pos[1]]

    GFX_DRAWLINE([x + c[0], y + c[1]], [dx + c[0], dy + c[1]], "#ffffff")

    //console.log(canvas.height);

    sf.stars[i][0] += sf.speed

  }
}

export function raymarch(p1, p2, obj) {
  let col = obj.collider
  let slope = [(p2[0] - p1[0]) / (p2[2] - p1[2]), (p2[1] - p1[1]) / (p2[2] - p1[2])]



  for (let i = 0; i < p2[2] - p1[2]; i += 0.5) {
    if (Math.floor(p1[2] + i) === Math.floor(obj.pos[2])) {


    }
    if (collide(obj, {
      pos: [p1[0] + slope[0] * i, p1[1] + slope[1] * i, p1[2] + i],
      collider: {
        origin: [-1, -1, -1],
        size: [2, 2, 2]
      }
    })) {
      return obj
    }
  }
  return false
}