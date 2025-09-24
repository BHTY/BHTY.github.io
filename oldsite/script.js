import { newSpace, drawUI, updateSpace, drawObjects, starField, drawField } from './space.js'
import { drawFire, drawShield } from './player.js'
import { makeDebris } from './objects.js';
//var space.shakeframes = 0;
//var score = 0;

var f = new FontFace('Font name', "url(https://fonts.gstatic.com/s/pressstart2p/v14/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2)");

f.load().then(function(font) {

  // Ready to use the font in a canvas context
  console.log('font ready');

  // Add font on the html page
  document.fonts.add(font);

});

function create_vector() {
  return [0, 0, 0];
}

export function shake() {
  space.shakeframes = 5;
  const newAudio = document.getElementById("hit").cloneNode(false);
  newAudio.volume = 0.2
  newAudio.play();

  //s(new sound('hit.wav')).play();

}

export function increase_score() {
  space.score += 10;
}

function create_matrix() {
  let x = create_vector();
  x[0] = create_vector();
  x[1] = create_vector();
  x[2] = create_vector();

  return x
}

export function constrain(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

export function addArrays(a, b) {
  let c = []

  //console.log(a, b)

  for (let i = 0; i < a.length; i++) {
    c.push(a[i] + b[i])
  }
  return c
}

export function rand(min, max) {
  return Math.random() * (max - min) + min

}

export function dist(p1, p2) {
  let d = 0
  for (let i = 0; i < p1.length; i++) {
    d += Math.pow((p1[i] - p2[i]), 2)
  }
  return Math.sqrt(d)
}

function copyPoly(poly) {
  let l = []

  for (let j = 0; j < poly.verts.length; j++) {
    l.push(poly.verts[j])
  }
  return new GFX_POLY(l, poly.color)

}

export class GFX_TRI {
  constructor(vert1, vert2, vert3, color) {
    this.vert1 = vert2;
    this.vert2 = vert2;
    this.vert3 = vert3;
    this.color = color;
  }
}

export class GFX_POLY {
  constructor(verts, color) {
    this.verts = verts;
    this.color = color;
  }
}

let test_cube = {
  pos: [5, 0, 20],
  rot: [0, 0, 0],
  verts: [[1, 1, 1],
  [1, 1, -1],
  [1, -1, 1],
  [1, -1, -1],
  [-1, 1, 1],
  [-1, 1, -1],
  [-1, -1, 1],
  [-1, -1, -1]
  ],
  tris: [
    new GFX_POLY([0, 1, 3, 2], "#ffffff"),
    new GFX_POLY([4, 5, 7, 6], "#ffffff"),
    new GFX_POLY([0, 2, 6, 4], "#ffffff"),
    new GFX_POLY([1, 3, 7, 5], "#ffffff"),
    new GFX_POLY([0, 1, 5, 4], "#ffffff"),
    new GFX_POLY([3, 7, 6, 2], "#ffffff")
  ]
};

//pos, rot, verts, tris

function reloadScript() {
  var newscr = document.createElement('script');
  newscr.id = 'reloadMe';
  newscr.appendChild(document.createTextNode(document.getElementById('reloadMe').innerHTML));
  body.removeChild(document.getElementById('reloadMe'));
  body.appendChild(newscr);

}

/*
Core Renderer State Begins Here
*/
let GFX_VERTEX_INDEX = 0;
let GFX_TRI_INDEX = 0;
let GFX_TRI_LIST = [];
let GFX_VERTEX_LIST = [];
let GFX_WORLD_ROTATION_MATRIX = create_matrix();
let GFX_CAMERA_POS = create_vector();

const x_fov = 100;
const y_fov = 100;

/*
Core Renderer State Ends Here
*/

function print(text) {
  document.getElementById("myText").value = text;
}

function GFX_ROTATE(rot) { //returns rot matrix
  let pitch = rot[0];
  let yaw = rot[1];
  let roll = rot[2];

  let sin_pitch = Math.sin(pitch * Math.PI / 180);
  let cos_pitch = Math.cos(pitch * Math.PI / 180);
  let sin_yaw = Math.sin(yaw * Math.PI / 180);
  let cos_yaw = Math.cos(yaw * Math.PI / 180);
  let sin_roll = Math.sin(roll * Math.PI / 180);
  let cos_roll = Math.cos(roll * Math.PI / 180);

  let x = [[cos_yaw * cos_roll, -cos_pitch * sin_roll + sin_pitch * sin_yaw * cos_roll, sin_pitch * sin_roll + cos_pitch * sin_yaw * cos_roll],
  [cos_yaw * sin_roll, cos_pitch * cos_roll + sin_pitch * sin_yaw * sin_roll, -sin_pitch * cos_roll + cos_pitch * sin_yaw * sin_roll],
  [-sin_yaw, sin_pitch * cos_yaw, cos_pitch * cos_yaw]];

  return x;
}

function GFX_MATMUL(matrix, vector) {
  let x = create_vector();

  for (let i = 0; i < 3; i++) {
    for (let p = 0; p < 3; p++) {
      x[i] += matrix[i][p] * vector[p];
    }
  }

  return x;
}

function GFX_BEGIN() {
  GFX_VERTEX_INDEX = 0;
  GFX_TRI_INDEX = 0;
  GFX_TRI_LIST = [];
  GFX_VERTEX_LIST = [];
}

function GFX_END() {

  //console.log(GFX_TRI_LIST)
  for (let p = 0; p < GFX_TRI_INDEX; p++) {
    let tri = GFX_TRI_LIST[p];

    //connect v0 to v[-1]

    GFX_DRAWLINE(GFX_VERTEX_LIST[tri.verts[0]], GFX_VERTEX_LIST[tri.verts[tri.verts.length - 1]], tri.color);

    for (let t = 0; t < tri.verts.length - 1; t++) {
      GFX_DRAWLINE(GFX_VERTEX_LIST[tri.verts[t]], GFX_VERTEX_LIST[tri.verts[t + 1]], tri.color);
    }

  }


}

function GFX_VERTEX(vert) {
  vert[0] -= GFX_CAMERA_POS[0];
  vert[1] -= GFX_CAMERA_POS[1];
  vert[2] -= GFX_CAMERA_POS[2];
  vert = GFX_MATMUL(GFX_WORLD_ROTATION_MATRIX, vert);

  vert[0] = vert[0] * x_fov / vert[2] + 160;
  vert[1] = vert[1] * y_fov / vert[2] + 120;

  GFX_VERTEX_LIST.push(vert);
  GFX_VERTEX_INDEX += 1;
}

function generate_star(campos) { //each star is a single point
  return [campos[0] + Math.random() * 200 - 100, campos[1] + Math.random() * 200 - 100, campos[2] + Math.random() * 200];
}

var stars = [];

for (let i = 0; i < 100; i++) {
  stars.push(generate_star([0, 0, 0]));
}

let volume = 0.2

//seriously, my code works
//what is the problem exactly

export let destroySFX = document.getElementById("destroy").cloneNode()
export let shieldSFX = document.getElementById("shield").cloneNode()
export let deathSFX = document.getElementById("death").cloneNode()
export let flySFX = document.getElementById("fly").cloneNode()
export let laserSFX = document.getElementById("phaser").cloneNode()
laserSFX.volume = 0.2
deathSFX.volume = 0.2
flySFX.volume = 0.2
shieldSFX.volume = 0.2


//Alright
//for the hit sound effect I agree with you

//alright, hold on, why is it moving some to the left and some to the right
function GFX_STARS(stars, cam) { //draws the goddamn stars

  for (let i = 0; i < stars.length; i++) {
    var curstar = [stars[i][0] - cam[0], stars[i][1] - cam[1], stars[i][2] - (cam[2])];
    stars[i][2] -= 0.5;

    curstar[0] = curstar[0] * x_fov / curstar[2] + 160;
    curstar[1] = curstar[1] * y_fov / curstar[2] + 120;

    var dot = [curstar[0] + 1, curstar[1] + 1];

    GFX_DRAWLINE(curstar, dot, "#ffffff");

    if (stars[i][2] < cam[2]) {
      stars[i] = generate_star(cam);

    }
  }

}

function GFX_TRIANGLES(polys, offset) {
  for (let i = 0; i < polys.length; i++) {
    let tri = copyPoly(polys[i]);

    for (let p = 0; p < tri.verts.length; p++) {
      tri.verts[p] += offset;
    }

    GFX_TRI_LIST.push(tri);
    GFX_TRI_INDEX += 1;
  }
}

function GFX_TRANSLATE(campos) {
  GFX_CAMERA_POS = campos;
}

function comparePolys(a, b) {
  let aZTotal = 0;
  let bZTotal = 0;

  for (let i = 0; i < a.verts.length; i++) {
    aZTotal += GFX_VERTEX_LIST[a.verts[i]][2];
  }

  for (let i = 0; i < b.verts.length; i++) {
    bZTotal += GFX_VERTEX_LIST[b.verts[i]][2];
  }

  let aZAverage = aZTotal / a.verts.length;
  let bZAverage = bZTotal / b.verts.length;

  return bZAverage - aZAverage;
}

export function GFX_ZSORT() {
  GFX_TRI_LIST.sort(comparePolys);
}

export function GFX_DRAWSCENE(objects, campos, camrot) {

  GFX_TRANSLATE(campos);
  GFX_WORLD_ROTATION_MATRIX = GFX_ROTATE(camrot);
  GFX_BEGIN();

  for (let i = 0; i < objects.length; i++) {
    let current_index = GFX_VERTEX_INDEX;
    let model_rot_matrix = GFX_ROTATE(objects[i].rot);

    for (let p = 0; p < objects[i].verts.length; p++) {
      let vert = GFX_MATMUL(model_rot_matrix, objects[i].verts[p]);
      GFX_VERTEX([vert[0] + objects[i].pos[0], vert[1] + objects[i].pos[1], vert[2] + objects[i].pos[2]]);
    }

    GFX_TRIANGLES(objects[i].tris, current_index);
  }

  GFX_ZSORT();

  GFX_END();
}

var running = 0;
var testInterval = setInterval(titlescreen, 16);

var image = new Image();

image.onload = function() {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}
image.src = "logo.webp";

document.getElementById("titletheme").loop = true;
document.getElementById("titletheme").volume = 0.2;
document.getElementById("titletheme").currentTime = 0;
document.getElementById("titletheme").play();

function start() {
  if (running == 0) {
    document.getElementById("titletheme").pause();
    document.getElementById("pursue").play();
    running = 1;
    clearInterval(testInterval);
    window.setInterval(main_loop, 16);


    document.getElementById("fly").loop = true;
    document.getElementById("fly").volume = 0.2;
    document.getElementById("fly").currentTime = 0;
    document.getElementById("fly").play();

  }
}

function titlescreen() {
  document.getElementById("titletheme").play();
  GFX_CLEARSCREEN();
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  starField(space);
  drawField(space);
}

//import {newSpace}from './space.js'

//console.log([[1, 1, 1], [1, 1, 1], [1, 1, 1]]);
export let canvas = document.getElementById("myCanvas");
export let ctx = canvas.getContext("2d");

canvas.addEventListener('click', start, false);

//ctx.fillStyle = "#000000";
//ctx.fillRect(0, 0, 320, 240);

let keys = { leftarrow: 0, rightarrow: 0, uparrow: 0, downarrow: 0, space: 0 };
let mousePressed = false

function keydown(e) {
  switch (e.key) {
    case "ArrowLeft":
      keys.leftarrow = 1;
      break;
    case "ArrowRight":
      keys.rightarrow = 1;
      break;
    case "ArrowUp":
      keys.uparrow = 1;
      break;
    case "ArrowDown":
      keys.downarrow = 1;
      break;
    case "z":
      keys.z = 1;


      //not when we want to play the laser
      //if you hold it when you don't have enough energy it still plays
      //fine
      /*
      document.getElementById("phaser").loop = true;
      document.getElementById("phaser").volume = 0.2;
      document.getElementById("phaser").currentTime = 0;
      document.getElementById("phaser").play();
      */


      break;
    case "x":
      keys.x = 1;
      break;
  }


  //Fixes arrow key scrolling
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}

function keyup(e) {
  switch (e.key) {
    case "ArrowLeft":
      keys.leftarrow = 0;
      break;
    case "ArrowRight":
      keys.rightarrow = 0;
      break;
    case "ArrowUp":
      keys.uparrow = 0;
      break;
    case "ArrowDown":
      keys.downarrow = 0;
      break;
    case "z":
      keys.z = 0;

      //document.getElementById("phaser").pause();


      break;
    case "x":
      keys.x = 0;
      break;
  }
}

document.onkeydown = keydown;
document.onkeyup = keyup;


document.addEventListener("mousedown", function(e) { mousePressed = true }, false);


document.addEventListener("mouseup", function(e) { mousePressed = false }, false);


export function GFX_DRAWLINE(p1, p2, color) {
  if (p1[0] > 320 || p1[0] < 0 || p1[1] > 240 || p1[1] < 0 || p2[0] > 320 || p2[0] < 0 || p2[1] > 240 || p2[1] < 0) {
    return;
  } //performs clipping

  ctx.strokeStyle = color;

  let xScale = canvas.width / 320
  let yScale = canvas.height / 240
  ctx.beginPath();
  ctx.moveTo(p1[0] * xScale, p1[1] * yScale);
  ctx.lineTo(p2[0] * xScale, p2[1] * yScale);
  ctx.stroke();
}

export function GFX_DRAWLINES(lines, color) {
  for (let i = 0; i < lines.length; i++) {
    GFX_DRAWLINE(lines[i][0], lines[i][1], color)
  }
}

function GFX_CLEARSCREEN() {
  ctx.beginPath();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.stroke();
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

let x = 160;
let y = 120;


let space = newSpace()

function preShake() {
  ctx.save();
  var dx = Math.random() * 10;
  var dy = Math.random() * 10;
  ctx.translate(dx, dy);
}

function postShake() {
  ctx.restore();
}

var shaken = 0;

function main_loop() {

  shaken = 0;
  updateSpace(space, keys)

  let p = space.player

  //starField(space)


  GFX_CLEARSCREEN();

  let xScale = canvas.width / 320

  let yScale = canvas.height / 240

  if (p.health > 0) {
    ctx.textAlign = "left";

    ctx.fillStyle = "#00ff00";
    ctx.font = (10 * xScale) + "px Font name";

    //    ctx.font = "20px trebuchet ms";
    //ctx.fillText("Health: " + p.health, 5 * xScale, 25 * yScale); //remember this one is just for testing

    ctx.fillText("SCORE: " + space.score, 5 * xScale, 40 * yScale);

    //sound effects are now the only thing left for me to add

  } else {
    p.fire.active = false
    p.shield.active = false

    ctx.fillStyle = "#ff0000";
    ctx.font = (10 * xScale) + "px Font name";
    ctx.textAlign = "center";
    ctx.fillText("You died in the service", 160 * xScale, 80 * yScale);
    ctx.fillText("of the Imperious Leader.", 160 * xScale, 100 * yScale);
    ctx.fillText("Your sacrifice will not", 160 * xScale, 120 * yScale);
    ctx.fillText("be remembered.", 160 * xScale, 140 * yScale);
    ctx.fillText("Score: " + space.score, 160 * xScale, 180 * yScale);
    space.shakeframes = 0;

    if (mousePressed) {
      space = newSpace()

      stars = [];

      for (let i = 0; i < 100; i++) {
        stars.push(generate_star(space.player.pos));
      }
      document.getElementById("fly").currentTime = 0;
      document.getElementById("fly").play();


      //reset stuff?
    }
  }
  if (space.shakeframes) {
    space.shakeframes -= 1;
    preShake();
    shaken = 1;
  }


  //drawField(space)


  //GFX_DRAWSCENE([test_cube], [0, 0, 15], [0, 0, 0]);
  //GFX_DRAWSCENE([test_cube], p.pos, [0, 0, 0]);
  //GFX_DRAWLINE([x - 10, y - 10], [x + 10, y + 10], "#ffffff");
  //GFX_DRAWLINE([x + 10, y - 10], [x - 10, y + 10], "#ffffff");

  test_cube.rot[0] = test_cube.rot[0] + 1;
  test_cube.rot[1] = test_cube.rot[1] + 1;
  test_cube.rot[2] = test_cube.rot[2] + 1;

  drawObjects(space)
  GFX_STARS(stars, p.pos);

  if (space.player.fire.active) {
    drawFire(space, space.player);
  }
  if (space.player.shield.active) {
    drawShield(space, space.player)
  }

  if (p.health > 0) {
    drawUI(space);


    if (keys.leftarrow) {
      x--;
    }
    if (keys.rightarrow) {
      x++;
    }
    if (keys.uparrow) {
      y--;
    }
    if (keys.downarrow) {
      y++;
    }

    if (p.health <= 50) {
      GFX_DRAWLINE([160, 100], [100, 130], "#ffffff");
      GFX_DRAWLINE([160, 100], [215, 140], "#ffffff");
      GFX_DRAWLINE([160, 100], [215, 85], "#ffffff");
      GFX_DRAWLINE([120, 85], [160, 100], "#ffffff");
      GFX_DRAWLINE([100, 130], [80, 160], "#ffffff");
      GFX_DRAWLINE([80, 160], [20, 170], "#ffffff");
      GFX_DRAWLINE([20, 170], [0, 192], "#ffffff");
    }

    if (p.health <= 20) { //draw screen crack

      GFX_DRAWLINE([30, 0], [40, 50], "#ffffff");
      GFX_DRAWLINE([40, 50], [70, 80], "#ffffff");
      GFX_DRAWLINE([70, 80], [120, 85], "#ffffff");
      GFX_DRAWLINE([215, 140], [180, 155], "#ffffff");
      GFX_DRAWLINE([180, 155], [220, 200], "#ffffff");
      GFX_DRAWLINE([215, 85], [200, 70], "#ffffff");
      GFX_DRAWLINE([200, 70], [215, 50], "#ffffff");
      GFX_DRAWLINE([215, 50], [319, 40], "#ffffff");
    }

    if (shaken) {
      postShake();
    }
  }

  if (p.health === 0) {


    //document.getElementById("fly").pause();

    //yeah there's some weird shit with the impacts being out of sync
    //both you hitting them and them hitting you
    //sometimes you'll have a hit of yours against an enemy not play and then two play at once
    //I think thats just buffering
    //same with looping sounds, there will always be a gap

    //true, your array system miiiight help the impacts tho

    laserSFX.pause()
    document.querySelectorAll('audio').forEach(el => el.pause());
    deathSFX.play()

    space.objects = []
    for (let i = 0; i < 200; i++) {
      space.objects.push(makeDebris([p.pos[0], p.pos[1], p.pos[2] + 10], "#FFFFFF"))
      space.objects[space.objects.length - 1].vel[2] = 0
      //this will lag the shit out of it btw

      //alright there was a crazy explosion letś figure out how to make it more consistently awesome

    }
    p.speed = [0, 0, 0]
    p.health = -10
    //alert("You died in the service of the Imperious Leader. Your sacrifice will not be remembered.\nScore: " + score); //and do something to reload the game
  }

}


//window.setInterval(main_loop, 16);


//in the final game, the music and title screen will be invoked 
//when you click, the music ends, the game loop is invoked, and the flying sound begins

export function sound(src) {
  //this.sound = document.createElement("audio");


  this.sound = document.getElementById(src).cloneNode(false)
  //this.sound.src = src;
  console.log(this.sound)
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  this.sound.volume = volume
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  }
  this.stop = function() {
    this.sound.pause();
  }
}

