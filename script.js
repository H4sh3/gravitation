const s = {
  props: {
    w: 5,
    h: 5,
    blockSize: 250,
  },
  field: [],
  texture: null,
  font: null,
  max: 0,
  i: 0,
  observeIndex: 0,
  observeDistance: 10,
  center: null
}

function setup() {
  angleMode(DEGREES);
  createCanvas(700, 700, WEBGL)
  s.font = loadFont('inconsolata.ttf');
  //frameRate(1)
  init()
}

function draw() {
  background(0)
  doPhysics()

  push()
  //rotateY(0.1 * frameCount)

  rotateX(90)
  // rotateY(0.5 * frameCount)
  drawBorderBlocks()
  //translate(100, 100, -200)
  render()

  pop()

  line(-0.5, 0, 0, 0.5, 0, 0)

  s.i += 1
}

function init() {
  spawnCenter()

  for (let i = 0; i < 250; i++) {
    const m = 1//random(0.1, 1)
    const acc = createVector(0, 0, 0)
    const vel = createVector(0, 0, 0) // createVector(random(-1, 1), random(-1, 1), random(-1, 1))
    const pos = createVector(map(i, 0, 250, -1, 1), map(i, 0, 250, -1, 1), map(i, 0, 250, -1, 1))
    // s.field.push({ pos: createVector(random(-1, 1), random(-1, 1), random(-1, 1)), m, acc, vel })
    s.field.push({ pos, m, acc, vel })
  }

  s.texture = loadImage('texture.jpg')

  s.recentMin = createVector(0, 0, 0) // vectors
  s.recentMax = createVector(0, 0, 0) // vectors
}

function drawBorderBlocks() {
  const positions = []
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        positions.push({ x, y, z })
      }
    }
  }
  positions.forEach(p => {
    push()
    translate(p.x * s.props.blockSize, p.y * s.props.blockSize, p.z * s.props.blockSize)
    box(10, 10, 10)
    pop()
  })

}

function doPhysics() {

  s.field.filter(o => !o.static).map(o1 => {
    let acc = createVector();
    let toRemove = []

    const dist = p5.Vector.dist(s.center.pos, o1.pos)
    if (dist < 0.01) {
      o1.m += s.center.m
      o1.vel.add(s.center.vel).mult(0.5)
      if (!s.center.static) {
        toRemove.push(s.center)
      }
    } else {
      const f = 9.81 * ((s.center.m * o1.m) / (dist * dist))
      const v = s.center.pos.copy().sub(o1.pos).mult(f)
      o1.acc = v
      o1.acc.rotate(90)
    }

    s.field = s.field.filter(s => !toRemove.includes(s))

    update(o1)
  })

  adjustDimensions()
}

function keyPressed(e) {
  if (e.key === 'ArrowRight') {
    s.observeIndex = s.observeIndex >= s.field.length - 1 ? s.observeIndex : s.observeIndex + 1
  } else if (e.key === 'ArrowLeft') {
    s.observeIndex = s.observeIndex <= 0 ? s.observeIndex : s.observeIndex - + 1
  } else if (e.key === 'ArrowUp') {
    s.observeDistance = s.observeDistance + 5
  } else if (e.key === 'ArrowDown') {
    s.observeDistance = s.observeDistance > 6 ? s.observeDistance - 5 : s.observeDistance
  }
  console.log(s.observeDistance)
  console.log(s.observeIndex)
}

function adjustDimensions() {
  // have on focus object, only take "close" objects in min max calculation

  const centerObj = s.field[s.observeIndex]

  const others = s.field.filter(o => o != centerObj)//.filter(o => o.pos.dist(centerObj.pos) < maxDist)

  others.forEach(o1 => {
    const dimensions = ['x', 'y', 'z'];
    dimensions.forEach(d => {
      s.recentMin[d] = o1.pos[d] < s.recentMin[d] ? o1.pos[d] : s.recentMin[d];
      s.recentMax[d] = o1.pos[d] > s.recentMax[d] ? o1.pos[d] : s.recentMax[d];
    })
  })
}

function spawnCenter() {
  const m = 15
  const acc = createVector(0, 0, 0)
  const vel = createVector(0, 0, 0)
  s.center = { pos: createVector(0, 0, 0), m, acc, vel, static: true }
}

function update(o1) {
  o1.vel.add(o1.acc).limit(0.025)
  o1.pos.add(o1.vel)
}

function render() {
  s.field.forEach(renderBox)
  renderBox(s.center)
}

function renderBox(f) {
  push()

  let x = f.pos.x
  let y = f.pos.y
  let z = f.pos.z
  x = map(x, s.recentMin.x, s.recentMax.x, -1, 1)
  y = map(y, s.recentMin.y, s.recentMax.y, -1, 1)
  z = map(z, s.recentMin.z, s.recentMax.z, -1, 1)

  x *= s.props.blockSize
  y *= s.props.blockSize
  z *= s.props.blockSize

  translate(x, y, z)
  texture(s.texture)
  if (f.static) {
    fill(255, 0, 0)
    sphere(10, 10, 10)
  } else {
    const r = map(x / s.props.blockSize, s.recentMin.x, s.recentMax.x, 255, 0)
    const g = map(y / s.props.blockSize, s.recentMin.y, s.recentMax.y, 255, 0)
    const b = map(z / s.props.blockSize, s.recentMin.z, s.recentMax.z, 255, 0)
    fill(r, g, b)
    sphere(5, 5, 5)
  }
  pop()
}