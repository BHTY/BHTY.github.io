import { GFX_POLY, dist, addArrays } from './script.js'
export function newObject(name, params) {
  let object = {
    name: name,
    pos: [0, 0, 0],
    rot: [0, 0, 0],
    rotVel: [0, 0, 0],
    vel: [0, 0, 0],
    destructible: true,
    collider: {
      origin: [0, 0, 0],
      size: [0, 0, 0]
    },
    speed: [0, 0, 0],
    verts: [],
    polys: [],
    tris: [],
    health: 100,
    AI: { //the AI could just be a function and the objects could have some state vars 
      move: "straight",

    },

  }
  //alright we can revert the pllayer back to his old speed temporarily
  //go ahead, I was just testing aiming andf 
  //ah sick
  //the starfield kind of works
  //i can finish it later
  //when it works properly it looks good


  //switch statement here?
  object.verts = params.verts
  object.polys = params.polys
  object.pos = params.pos ? params.pos : object.pos
  object.rot = params.rot ? params.rot : object.rot
  object.vel = params.vel ? params.vel : object.vel
  object.rotVel = params.rotVel ? params.rotVel : object.rotVel
  object.color = params.color ? params.color : "#FFFFFF"
  object.AI = params.AI ? params.AI : object.AI
  object.destructible = params.destructible === false || params.destructible === true ? params.destructible : object.destructible

  object.collider = params.collider

  if (object.polys) {
    object.tris = []
    for (let i = 0; i < object.polys.length; i++) {
      object.tris.push(new GFX_POLY(object.polys[i], object.color))
    }
  }


  return object
}

function rand(n1, n2) {
  var range = n2 - n1;
  return (Math.random() * range) + n1;
}

export function updateObject(s, o) {

  moveObject(s, o)

  if (o.AI.fire) {
    console
    if (o.AI.fire.timer % o.AI.fire.rate === 0) {

      let d = dist(o.pos, s.player.pos)
      let bullet = o.AI.fire.bullet
      bullet.pos = [o.pos[0], o.pos[1], o.pos[2]]
      //bullet.rot = [(180 / Math.PI) * Math.acos((o.pos[0] - s.player.pos[0]) / d), (180 / Math.PI) * Math.acos((o.pos[1] - s.player.pos[1]) / d), (180 / Math.PI) * Math.acos((o.pos[2] - s.player.pos[2]) / d)]
      if (bullet.AI.move === "aimed") {
        bullet.vel = [-(o.pos[0] - s.player.pos[0]) / (o.pos[2] - s.player.pos[2]), -(o.pos[1] - s.player.pos[1]) / (o.pos[2] - s.player.pos[2]), -(o.pos[2] - s.player.pos[2]) / (o.pos[2] - s.player.pos[2]) + s.player.speed[2]]

      }
      if (bullet.randOffset) {
        let off = bullet.randOffset
        if (bullet.AI.move === "straight") {
          bullet.vel = [0, 0, bullet.vel[2]]
          ////alert(bullet.vel)
        }
        let stormTrooperAim = [rand(off[0][0], off[0][1]), rand(off[1][0], off[1][1]), rand(off[2][0], off[2][1])]
        bullet.vel = addArrays(bullet.vel, stormTrooperAim)
      }
      //-0.5]

      s.objects.push(newObject(bullet.name, bullet))
    } //this is good
    //we're almost done basically
    //all we need now is finishing theg ameplay loop and some polish 
    o.AI.fire.timer++
  }

}

export function changeObjColor(obj, color) {
  obj.color = color
  for (let i = 0; i < obj.tris.length; i++) {
    obj.tris[i] = new GFX_POLY(obj.tris[i].verts, color);
  }
  return obj
}

export function moveObject(s, o) {

  if (o.AI.move === "homing") {
    let d = dist(o.pos, s.player.pos)

    o.vel = [-(o.pos[0] - s.player.pos[0]) / (o.pos[2] - s.player.pos[2]), -(o.pos[1] - s.player.pos[1]) / (o.pos[2] - s.player.pos[2]), o.vel[2]]
    o.rot = [180, 0, 0]
    //o.rot = [(180 / Math.PI) * Math.acos((o.pos[0] - s.player.pos[0]) / d), (180 / Math.PI) * Math.acos((o.pos[1] - s.player.pos[1]) / d), (180 / Math.PI) * Math.acos((o.pos[2] - s.player.pos[2]) / d)]
  }

  for (let i = 0; i < o.rot.length; i++) {
    o.rot[i] += o.rotVel[i]
  }

  if (o.name === "debris") {
    //console.log(o.vel)
  }
  for (let i = 0; i < o.pos.length; i++) {

    o.pos[i] += o.vel[i]
  }

}

//only a rectangle, I'll probably change this to be poly-collide maybe?
export function collide(obj1, obj2) {
  let c1 = obj1.collider
  let c2 = obj2.collider

  let out = true
  for (let i = 0; i < c1.origin.length; i++) {
    out &&= c1.origin[i] + obj1.pos[i] < c2.origin[i] + c2.size[i] + obj2.pos[i] && c1.origin[i] + c1.size[i] + obj1.pos[i] > c2.origin[i] + obj2.pos[i]
  }
  return out
}

export function makeDebris(pos, color) {
  let d = newObject("debris", { rot: [rand(0, 360), rand(0, 360), rand(0, 360)], rotVel: [rand(-5, 5), rand(-5, 5), rand(-5, 5)], destructible: false, verts: [[0, 1, 0], [1, 0, 0], [-1, 0, 0]], polys: [[0, 1, 2]], color: color, pos: [...pos], vel: [rand(-0.1, 0.1), rand(-0.1, 0.1), rand(0, .0)], collider: { origin: [0, 0, 0], size: [0, 0, 0], AI: { move: "straight" } } })

  //console.log(d.vel)
  return d
}