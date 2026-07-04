export interface PlaygroundExample {
  id: string;
  title: string;
  group: "Drawing" | "Runtime" | "Input" | "Systems" | "Games";
  description: string;
  html: string;
  javascript: string;
}

const canvasOnly = `<canvas id="canvas" aria-label="Grid Canvas preview"></canvas>`;

export const playgroundExamples: readonly PlaygroundExample[] = [
  {
    id: "pixel-sprite",
    title: "Pixel sprite",
    group: "Drawing",
    description: "Palette-driven pixel art on a visible grid.",
    html: canvasOnly,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 380,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.16)"
});

const sprite = [
  "00111100",
  "01122110",
  "11222211",
  "12233221",
  "11222211",
  "01111110",
  "00100100"
];

grid.drawPixelSprite(sprite, {
  x: 244,
  y: 110,
  pixelSize: 18,
  palette: {
    0: "transparent",
    1: "#00d43b",
    2: "#e8f7ef",
    3: "#050607"
  }
});

grid.drawText("HELLO, GRID.", 320, 300, {
  color: "#e8f7ef",
  font: "20px monospace",
  textAlign: "center"
});`,
  },
  {
    id: "runtime",
    title: "Runtime loop",
    group: "Runtime",
    description: "Elapsed-time animation with a reusable MassBody.",
    html: canvasOnly,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 380,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(77, 169, 255, 0.16)"
});

const body = new GridCanvasSystem.runtime.MassBody({
  x: 120,
  y: 190,
  radius: 34,
  xSpeed: 90,
  mass: 8
});

let time = 0;

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.05,
  update(elapsed) {
    time += elapsed;
    body.angle += elapsed * 0.45;
    body.update(elapsed, { width: 640, height: 380 });
  },
  draw() {
    grid.clearCanvas();
    grid.drawPacman(
      body.x,
      body.y,
      body.radius,
      GridCanvasSystem.runtime.oscillate01(time, 2.5),
      {
        direction: body.angle,
        fillColor: "#ffb14a",
        strokeColor: "#e8f7ef"
      }
    );
  }
});`,
  },
  {
    id: "grid-pong",
    title: "Grid Pong",
    group: "Games",
    description:
      "A complete pointer-controlled game with AI, scoring and pause states.",
    html: `<section class="demo-shell game-demo">
  <header class="demo-gamebar">
    <div><span>FIRST TO 5</span><strong id="pong-score">0 : 0</strong></div>
    <p id="pong-state" data-state="ready">Ready</p>
  </header>
  <canvas id="canvas" aria-label="Playable Grid Pong"></canvas>
  <div class="demo-actions">
    <button id="pong-toggle" type="button">Start</button>
    <button id="pong-reset" type="button">Reset</button>
    <span class="demo-hint">Pointer or W / S - Space pauses</span>
  </div>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.12)"
});

const runtime = GridCanvasSystem.runtime;
const pointer = runtime.createPointerTracker(grid.canvas, { preventDefault: true });
const keys = runtime.createKeyTracker(window, {
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "w", "s", " "]
});
const scoreNode = document.querySelector("#pong-score");
const stateNode = document.querySelector("#pong-state");
const toggleButton = document.querySelector("#pong-toggle");

const paddle = { width: 12, height: 78 };
const player = { x: 602, y: 141, ...paddle };
const cpu = { x: 26, y: 141, ...paddle };
const ball = { x: 320, y: 180, radius: 8, vx: 0, vy: 0 };
const score = { cpu: 0, player: 0 };
let mode = "ready";
let serveDelay = 0;
let serveDirection = 1;
let spaceWasDown = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncHud() {
  scoreNode.textContent = score.cpu + " : " + score.player;
  stateNode.textContent = mode === "gameover" ? "Match over" : mode;
  stateNode.dataset.state = mode;
  toggleButton.textContent = mode === "playing" ? "Pause" : mode === "gameover" ? "Play again" : "Start";
}

function resetBall(direction) {
  ball.x = 320;
  ball.y = 180;
  ball.vx = 0;
  ball.vy = 0;
  serveDirection = direction;
  serveDelay = 0.65;
}

function launchBall() {
  const angle = (Math.random() * 0.8) - 0.4;
  ball.vx = Math.cos(angle) * 270 * serveDirection;
  ball.vy = Math.sin(angle) * 270;
}

function resetMatch() {
  score.cpu = 0;
  score.player = 0;
  player.y = 141;
  cpu.y = 141;
  mode = "ready";
  resetBall(Math.random() > 0.5 ? 1 : -1);
  syncHud();
}

function toggleGame() {
  if (mode === "gameover") resetMatch();
  mode = mode === "playing" ? "paused" : "playing";
  syncHud();
}

function awardPoint(side) {
  score[side] += 1;
  if (score[side] >= 5) {
    mode = "gameover";
    ball.vx = 0;
    ball.vy = 0;
  } else {
    resetBall(side === "player" ? -1 : 1);
  }
  syncHud();
}

function bounceFrom(paddleRect, direction) {
  const offset = (ball.y - (paddleRect.y + paddleRect.height / 2)) / (paddleRect.height / 2);
  const speed = Math.min(440, Math.hypot(ball.vx, ball.vy) * 1.045);
  const angle = clamp(offset, -1, 1) * 0.72;
  ball.vx = Math.cos(angle) * speed * direction;
  ball.vy = Math.sin(angle) * speed;
  ball.x = direction > 0
    ? paddleRect.x + paddleRect.width + ball.radius
    : paddleRect.x - ball.radius;
}

toggleButton.addEventListener("click", toggleGame);
document.querySelector("#pong-reset").addEventListener("click", resetMatch);

runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.04,
  update(elapsed) {
    const spaceDown = keys.isPressed(" ");
    if (spaceDown && !spaceWasDown) toggleGame();
    spaceWasDown = spaceDown;
    if (mode !== "playing") return;

    const pointerPosition = pointer.position();
    if (pointerPosition) {
      const scale = grid.canvas.height / grid.canvas.getBoundingClientRect().height;
      player.y = pointerPosition.y * scale - player.height / 2;
    }
    const playerDirection = Number(keys.isPressed("ArrowDown") || keys.isPressed("s"))
      - Number(keys.isPressed("ArrowUp") || keys.isPressed("w"));
    player.y = clamp(player.y + playerDirection * 330 * elapsed, 0, 360 - player.height);

    const cpuTarget = ball.y - cpu.height / 2;
    cpu.y += clamp(cpuTarget - cpu.y, -210 * elapsed, 210 * elapsed);
    cpu.y = clamp(cpu.y, 0, 360 - cpu.height);

    if (serveDelay > 0) {
      serveDelay -= elapsed;
      if (serveDelay <= 0) launchBall();
      return;
    }

    ball.x += ball.vx * elapsed;
    ball.y += ball.vy * elapsed;
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= 360) {
      ball.y = clamp(ball.y, ball.radius, 360 - ball.radius);
      ball.vy *= -1;
    }
    if (ball.vx < 0 && runtime.hitTestCircleRectangle(ball, cpu)) bounceFrom(cpu, 1);
    if (ball.vx > 0 && runtime.hitTestCircleRectangle(ball, player)) bounceFrom(player, -1);
    if (ball.x < -ball.radius) awardPoint("player");
    if (ball.x > 640 + ball.radius) awardPoint("cpu");
  },
  draw() {
    grid.clearCanvas();
    for (let y = 12; y < 360; y += 28) {
      grid.drawLine({ x: 320, y }, { x: 320, y: y + 12 }, {
        strokeColor: "rgba(232, 247, 239, 0.26)", lineWidth: 2
      });
    }
    grid.drawLine(
      { x: cpu.x + cpu.width / 2, y: cpu.y },
      { x: cpu.x + cpu.width / 2, y: cpu.y + cpu.height },
      { strokeColor: "#4da9ff", lineWidth: cpu.width }
    );
    grid.drawLine(
      { x: player.x + player.width / 2, y: player.y },
      { x: player.x + player.width / 2, y: player.y + player.height },
      { strokeColor: "#00d43b", lineWidth: player.width }
    );
    grid.drawProjectile(ball, ball.radius, 1, {
      fillColor: "#e8f7ef", strokeColor: "#e8f7ef", lineWidth: 1
    });
    grid.drawText(String(score.cpu), 280, 54, {
      color: "#4da9ff", font: "30px monospace", textAlign: "center"
    });
    grid.drawText(String(score.player), 360, 54, {
      color: "#00d43b", font: "30px monospace", textAlign: "center"
    });
    if (mode !== "playing") {
      const message = mode === "gameover"
        ? (score.player > score.cpu ? "YOU WIN" : "CPU WINS")
        : mode === "paused" ? "PAUSED" : "GRID PONG";
      grid.drawMessage(message, mode === "ready" ? "Press Start or Space" : "Press Start to continue", { x: 320, y: 166 }, {
        color: "#e8f7ef", subColor: "#00d43b"
      });
    }
  }
});

resetMatch();`,
  },
  {
    id: "asteroid-dodge",
    title: "Asteroid Dodge",
    group: "Games",
    description:
      "Keyboard and touch action with projectiles, particles, lives and restart.",
    html: `<section class="demo-shell game-demo">
  <header class="demo-gamebar">
    <div><span>SCORE</span><strong id="dodge-score">0000</strong></div>
    <p id="dodge-lives" data-state="playing">3 shields</p>
  </header>
  <canvas id="canvas" tabindex="0" aria-label="Playable asteroid dodge game"></canvas>
  <div class="demo-actions">
    <button id="dodge-focus" type="button">Focus controls</button>
    <button id="dodge-reset" type="button">Restart</button>
    <span class="demo-hint">Arrows / WASD - Hold Space to fire - Drag on touch</span>
  </div>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(77, 169, 255, 0.11)"
});

const runtime = GridCanvasSystem.runtime;
const keys = runtime.createKeyTracker(grid.canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "]
});
const pointer = runtime.createPointerTracker(grid.canvas, { preventDefault: true });
const scoreNode = document.querySelector("#dodge-score");
const livesNode = document.querySelector("#dodge-lives");
const ship = { x: 320, y: 306, radius: 16, speed: 245 };
let asteroids = [];
let shots = [];
let particles = [];
let score = 0;
let lives = 3;
let spawnTimer = 0;
let fireTimer = 0;
let invulnerable = 0;
let gameOver = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function syncHud() {
  scoreNode.textContent = String(Math.floor(score)).padStart(4, "0");
  livesNode.textContent = gameOver ? "Mission over" : lives + (lives === 1 ? " shield" : " shields");
  livesNode.dataset.state = gameOver ? "gameover" : "playing";
}

function spawnAsteroid() {
  const radius = 14 + Math.random() * 17;
  asteroids.push({
    x: radius + Math.random() * (640 - radius * 2),
    y: -radius,
    radius,
    speed: 90 + Math.random() * 85 + Math.min(90, score / 30),
    spin: (Math.random() - 0.5) * 2,
    rotation: 0,
    shape: grid.createAsteroidShape(8)
  });
}

function burst(point, color) {
  particles = particles.concat(runtime.createParticleBurst(point, 14, {
    spread: Math.PI * 2,
    speed: 85,
    speedJitter: 45,
    life: 0.65,
    lifeJitter: 0.25,
    size: 3,
    sizeJitter: 1,
    color
  }));
}

function resetGame() {
  ship.x = 320;
  ship.y = 306;
  asteroids = [];
  shots = [];
  particles = [];
  score = 0;
  lives = 3;
  spawnTimer = 0;
  fireTimer = 0;
  invulnerable = 0;
  gameOver = false;
  syncHud();
  keys.focus();
}

document.querySelector("#dodge-focus").addEventListener("click", () => keys.focus());
document.querySelector("#dodge-reset").addEventListener("click", resetGame);
grid.canvas.addEventListener("pointerdown", () => keys.focus());

runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.04,
  update(elapsed) {
    particles = runtime.stepParticles(particles, elapsed, { gravityY: 24, drag: 0.08 });
    if (gameOver) return;

    score += elapsed * 12;
    invulnerable = Math.max(0, invulnerable - elapsed);
    spawnTimer -= elapsed;
    fireTimer -= elapsed;

    const horizontal = Number(keys.isPressed("ArrowRight") || keys.isPressed("d"))
      - Number(keys.isPressed("ArrowLeft") || keys.isPressed("a"));
    const vertical = Number(keys.isPressed("ArrowDown") || keys.isPressed("s"))
      - Number(keys.isPressed("ArrowUp") || keys.isPressed("w"));
    ship.x = clamp(ship.x + horizontal * ship.speed * elapsed, ship.radius, 640 - ship.radius);
    ship.y = clamp(ship.y + vertical * ship.speed * elapsed, ship.radius, 360 - ship.radius);

    if (pointer.isDown()) {
      const point = pointer.position();
      const rect = grid.canvas.getBoundingClientRect();
      ship.x = clamp(point.x * (640 / rect.width), ship.radius, 640 - ship.radius);
      ship.y = clamp(point.y * (360 / rect.height), ship.radius, 360 - ship.radius);
    }

    if (keys.isPressed(" ") && fireTimer <= 0) {
      shots.push({ x: ship.x, y: ship.y - ship.radius, radius: 4 });
      fireTimer = 0.16;
    }
    if (spawnTimer <= 0) {
      spawnAsteroid();
      spawnTimer = Math.max(0.34, 0.8 - score / 2500);
    }

    shots.forEach((shot) => { shot.y -= 360 * elapsed; });
    asteroids.forEach((asteroid) => {
      asteroid.y += asteroid.speed * elapsed;
      asteroid.rotation += asteroid.spin * elapsed;
    });

    for (let a = asteroids.length - 1; a >= 0; a -= 1) {
      const asteroid = asteroids[a];
      let destroyed = false;
      for (let s = shots.length - 1; s >= 0; s -= 1) {
        if (runtime.circlesIntersect(asteroid, shots[s])) {
          burst(asteroid, "#ffb14a");
          asteroids.splice(a, 1);
          shots.splice(s, 1);
          score += 100;
          destroyed = true;
          break;
        }
      }
      if (!destroyed && invulnerable === 0 && runtime.circlesIntersect(ship, asteroid)) {
        burst(ship, "#00d43b");
        asteroids.splice(a, 1);
        lives -= 1;
        invulnerable = 1.2;
        if (lives <= 0) gameOver = true;
      }
    }

    asteroids = asteroids.filter((asteroid) => asteroid.y < 410);
    shots = shots.filter((shot) => shot.y > -20);
    syncHud();
  },
  draw() {
    grid.clearCanvas();
    asteroids.forEach((asteroid) => {
      grid.drawAsteroid(asteroid, asteroid.radius, asteroid.shape, {
        rotation: asteroid.rotation,
        fillColor: "#101722",
        strokeColor: "#ffb14a",
        lineWidth: 1.5
      });
    });
    shots.forEach((shot) => grid.drawProjectile(shot, shot.radius, 1, {
      fillColor: "#4da9ff", strokeColor: "#e8f7ef", lineWidth: 1
    }));
    particles.forEach((particle) => grid.drawProjectile(
      particle,
      Math.max(1, particle.size),
      Math.max(0, particle.life / particle.maxLife),
      { fillColor: particle.color || "#ffb14a", strokeColor: "transparent", lineWidth: 0.5 }
    ));

    const visible = invulnerable === 0 || Math.floor(invulnerable * 10) % 2 === 0;
    if (visible) {
      grid.drawShip(ship, ship.radius, {
        rotation: -Math.PI / 2,
        thruster: true,
        fillColor: "#101722",
        strokeColor: "#00d43b"
      });
    }
    grid.drawValueLabel("SCORE", Math.floor(score), 18, 28, { color: "#e8f7ef" });
    grid.drawBarIndicator("SHIELD", 18, 44, 112, 10, lives, 3, {
      fillColor: "#00d43b", strokeColor: "#e8f7ef", textColor: "#e8f7ef"
    });
    if (gameOver) {
      grid.drawMessage("MISSION OVER", "Press Restart to fly again", { x: 320, y: 170 }, {
        color: "#e8f7ef", subColor: "#ffb14a"
      });
    }
  }
});

resetGame();`,
  },
  {
    id: "hud",
    title: "HUD overlay",
    group: "Drawing",
    description: "Animated status, score and centered messages.",
    html: canvasOnly,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 380,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.12)"
});

let time = 0;

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    time += elapsed;
  },
  draw() {
    const pulse = GridCanvasSystem.runtime.oscillate01(time, 0.7);
    grid.clearCanvas();
    grid.drawShip({ x: 320, y: 230 }, 62, {
      rotation: -Math.PI / 2,
      thruster: true,
      fillColor: "#101722",
      strokeColor: "#e8f7ef"
    });
    grid.drawBarIndicator("HP", 20, 20, 120, 14, 65 + pulse * 30, 100, {
      fillColor: "#00d43b",
      strokeColor: "#e8f7ef",
      textColor: "#e8f7ef"
    });
    grid.drawValueLabel("SCORE", Math.floor(2400 + time * 30), 620, 32, {
      color: "#e8f7ef",
      textAlign: "end"
    });
    grid.drawMessage("SYSTEM READY", "HUD helpers online", { x: 320, y: 92 }, {
      color: "#e8f7ef",
      subColor: "#4da9ff"
    });
  }
});`,
  },
  {
    id: "grid-input",
    title: "Grid pointer",
    group: "Input",
    description: "Pointer tracking with explicit cell conversion.",
    html: canvasOnly,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 380,
  cellSize: 40,
  majorStep: 80,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.2)"
});

const pointer = GridCanvasSystem.runtime.createPointerTracker(grid.canvas, {
  preventDefault: true
});

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  draw() {
    grid.clearCanvas();
    const position = pointer.position() ?? { x: 320, y: 180 };
    const cell = GridCanvasSystem.runtime.canvasToGrid(position, { cellSize: 40 });
    const snapped = GridCanvasSystem.runtime.gridToCanvas(cell, { cellSize: 40 });

    grid.drawPolyline([
      snapped,
      { x: snapped.x + 40, y: snapped.y },
      { x: snapped.x + 40, y: snapped.y + 40 },
      { x: snapped.x, y: snapped.y + 40 }
    ], {
      closePath: true,
      color: "#ffb14a",
      lineWidth: 3
    });
    grid.drawText("cell " + cell.column + ":" + cell.row, 20, 360, {
      color: "#e8f7ef",
      font: "14px monospace"
    });
  }
});`,
  },
  {
    id: "grid-buddy",
    title: "Grid Buddy",
    group: "Systems",
    description: "Sprite animation, state transitions and HTML controls.",
    html: `<section class="demo-shell">
  <canvas
    id="canvas"
    aria-label="Grid Buddy preview"
  ></canvas>
  <div class="demo-actions" aria-label="Buddy controls">
    <button id="cheer" type="button">Cheer</button>
    <button id="rest" type="button">Rest</button>
  </div>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 340,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.14)"
});

const sprites = {
  idleA: ["00111100", "01222210", "12211221", "12122121", "12222221", "01211210", "00100100"],
  idleB: ["00111100", "01222210", "12211221", "12122121", "12222221", "01111110", "00011000"],
  happyA: ["00111100", "01222210", "12322321", "13211231", "12233221", "01222210", "00100100"],
  happyB: ["00111100", "01222210", "12322321", "13211231", "12233221", "01111110", "00011000"]
};

const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  animations: { idle: ["idleA", "idleB"], happy: ["happyA", "happyB"] },
  initial: "idle",
  fps: 3
});
const machine = GridCanvasSystem.runtime.createStateMachine({
  initial: "idle",
  transitions: { idle: ["happy"], happy: ["idle"] }
});
let moodTime = 0;

document.querySelector("#cheer").addEventListener("click", () => {
  if (machine.getState() === "idle") machine.transition("happy");
  animator.play("happy");
  moodTime = 2.5;
});
document.querySelector("#rest").addEventListener("click", () => {
  if (machine.getState() === "happy") machine.transition("idle");
  animator.play("idle");
  moodTime = 0;
});

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    moodTime = Math.max(0, moodTime - elapsed);
    if (moodTime === 0 && machine.getState() === "happy") {
      machine.transition("idle");
      animator.play("idle");
    }
    animator.update(elapsed);
  },
  draw() {
    grid.clearCanvas();
    grid.drawPixelSprite(sprites[animator.getFrame()], {
      x: 248,
      y: 90,
      pixelSize: 18,
      palette: { 0: "transparent", 1: "#00d43b", 2: "#e8f7ef", 3: "#ffb14a" }
    });
    grid.drawText(machine.getState().toUpperCase(), 320, 270, {
      color: machine.getState() === "happy" ? "#ffb14a" : "#00d43b",
      font: "16px monospace",
      textAlign: "center"
    });
  }
});`,
  },
  {
    id: "particles",
    title: "Particle burst",
    group: "Runtime",
    description: "Reusable scene helpers with gravity and lifetime.",
    html: canvasOnly,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 380,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(77, 169, 255, 0.12)"
});

let particles = [];
let timer = 0;

function burst() {
  particles = [
    ...particles,
    ...GridCanvasSystem.runtime.createParticleBurst(
      { x: 320, y: 190 },
      28,
      {
        angle: -Math.PI / 2,
        spread: Math.PI * 1.8,
        speed: 105,
        speedJitter: 55,
        life: 1.5,
        lifeJitter: 0.7,
        size: 4,
        sizeJitter: 2
      }
    )
  ];
}

burst();
GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    timer += elapsed;
    if (timer > 1.1) {
      timer = 0;
      burst();
    }
    particles = GridCanvasSystem.runtime.stepParticles(particles, elapsed, {
      gravityY: 48,
      drag: 0.08
    });
  },
  draw() {
    grid.clearCanvas();
    particles.forEach((particle, index) => {
      grid.drawProjectile(
        { x: particle.x, y: particle.y },
        Math.max(1, particle.size),
        Math.max(0, particle.life / particle.maxLife),
        {
          fillColor: index % 2 === 0 ? "#00d43b" : "#4da9ff",
          strokeColor: "#e8f7ef",
          lineWidth: 0.5
        }
      );
    });
  }
});`,
  },
] as const;

export type PlaygroundExampleId = (typeof playgroundExamples)[number]["id"];

export function getPlaygroundExample(id: string): PlaygroundExample {
  return (
    playgroundExamples.find((example) => example.id === id) ?? playgroundExamples[0]
  );
}
