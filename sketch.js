let t = 0
const particles = []
let bgImg = null // optional: background image

function preload() {
  // Draw a black placeholder before image loads
  document.body.style.background = '#000'
  // OPTIONAL: uncomment this line if you want a background image
  // bgImg = loadImage('background.jpg', () => {}, () => { bgImg = null; });
}

function setup() {
  const c = createCanvas(windowWidth, windowHeight)

  // iPhone-safe canvas setup (no external CSS required)
  pixelDensity(1)
  noStroke()

  // Keep canvas fixed and on top (prevents Safari address bar issues)
  if (c?.elt?.style) {
    const s = c.elt.style
    s.position = 'fixed'
    s.inset = '0'
    s.zIndex = '10'
    s.touchAction = 'none' // prevent browser gestures (scroll/zoom) on the canvas
    s.display = 'block'
  }

  // Ensure no margins or scroll in body (also handled inline in index.html)
  document.body.style.margin = '0'
  document.body.style.overflow = 'hidden'
}

function draw() {
  // Draw background image if available, otherwise use solid color
  if (bgImg) {
    // Cover the whole window while keeping aspect ratio (similar to CSS "background-size: cover")
    const ratio = Math.max(width / bgImg.width, height / bgImg.height)
    const w = bgImg.width * ratio
    const h = bgImg.height * ratio
    image(bgImg, (width - w) / 2, (height - h) / 2, w, h)
  } else {
    background(10) // solid dark background
  }

  // --- Wave ---
  const N = isMobile() ? 80 : 160 // fewer segments on mobile for better performance
  const amp = height * 0.15 // wave amplitude
  const y0 = height * 0.55 // vertical center of wave

  fill(255, 230)
  beginShape()
  vertex(0, height)
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * width
    const y = y0 + Math.sin(i * 0.18 + t) * amp
    vertex(x, y)
  }
  vertex(width, height)
  endShape(CLOSE)

  // --- Particles ---
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.vx *= 0.985
    p.vy = p.vy * 0.985 + 0.15
    p.x += p.vx
    p.y += p.vy
    p.a -= 3 // fade out gradually

    fill(p.rgba[0], p.rgba[1], p.rgba[2], p.a)
    circle(p.x, p.y, p.size)

    // remove particles that are invisible or off-screen
    if (p.a <= 0 || p.y > height + 50) particles.splice(i, 1)
  }

  t += 0.02 // wave motion speed
}

// Create a small burst of particles at (x, y)
function pointerAt(x, y) {
  const count = isMobile() ? 8 : 14
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1.5 + Math.random() * 3.5
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 4 + Math.random() * 10,
      a: 255,
      rgba: [255, 255, 255, 255],
    })
  }
}

// Desktop interactions
function mousePressed() {
  pointerAt(mouseX, mouseY)
}
function mouseDragged() {
  pointerAt(mouseX, mouseY)
  return false
}

// Mobile (iOS / Android) touch interactions
function touchStarted() {
  if (touches && touches.length) {
    for (const t of touches) pointerAt(t.x, t.y)
  } else {
    pointerAt(mouseX, mouseY)
  }
  return false // prevent browser scroll/zoom
}
function touchMoved() {
  if (touches && touches.length) {
    for (const t of touches) pointerAt(t.x, t.y)
  } else {
    pointerAt(mouseX, mouseY)
  }
  return false
}

// Handle viewport changes (e.g., Safari bars appearing/disappearing)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

// Detect if running on a mobile device
function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}
