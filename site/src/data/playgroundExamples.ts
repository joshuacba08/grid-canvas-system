import { PACMAN_GAME_HTML, PACMAN_GAME_JS_EN } from "./pacmanTutorial";

export interface PlaygroundExample {
  id: string;
  title: string;
  group: "Drawing" | "Runtime" | "Input" | "Systems" | "Games" | "Audio";
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
    id: "canvas-runtime",
    title: "Canvas runtime 1.1",
    group: "Runtime",
    description:
      "Responsive logical canvas with DPR, pointer subscriptions and lifecycle cleanup.",
    html: `<section class="demo-shell">
  <canvas id="canvas" aria-label="Canvas runtime 1.1 preview"></canvas>
  <div class="demo-actions" aria-label="Runtime controls">
    <button id="runtime-resize" type="button">Resize</button>
    <button id="runtime-render" type="button">Render once</button>
    <button id="runtime-destroy" type="button">Destroy</button>
  </div>
  <p id="runtime-status" class="demo-status">Move the pointer over the canvas.</p>
</section>`,
    javascript: `const statusNode = document.querySelector("#runtime-status");
const state = {
  target: { x: 160, y: 90 },
  actor: { x: 160, y: 90 },
  destroyed: false,
  phase: 0
};

function drawGrid(ctx, size) {
  ctx.fillStyle = "#050607";
  ctx.fillRect(0, 0, size.logicalWidth, size.logicalHeight);
  ctx.strokeStyle = "rgba(0, 212, 59, 0.14)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= size.logicalWidth; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, size.logicalHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= size.logicalHeight; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(size.logicalWidth, y + 0.5);
    ctx.stroke();
  }
}

const runtime = GridCanvasSystem.runtime.createCanvasRuntime({
  canvas,
  logicalWidth: 320,
  logicalHeight: 180,
  pixelRatio: "auto",
  maxPixelRatio: 2,
  imageSmoothing: false,
  pauseWhenHidden: true,
  reducedMotion: "lower-fps",
  update(deltaMs) {
    state.phase += deltaMs * 0.006;
    const blend = Math.min(1, deltaMs / 120);
    state.actor.x += (state.target.x - state.actor.x) * blend;
    state.actor.y += (state.target.y - state.actor.y) * blend;
  },
  render(ctx) {
    const size = runtime.getSize();
    drawGrid(ctx, size);
    ctx.fillStyle = "#e8f7ef";
    ctx.font = "10px monospace";
    ctx.fillText("logical " + size.logicalWidth + "x" + size.logicalHeight + " / DPR " + size.pixelRatio, 12, 18);
    ctx.strokeStyle = "#4da9ff";
    ctx.beginPath();
    ctx.moveTo(state.actor.x, state.actor.y);
    ctx.lineTo(state.target.x, state.target.y);
    ctx.stroke();
    ctx.fillStyle = "#00d43b";
    ctx.beginPath();
    ctx.arc(state.actor.x, state.actor.y, 12 + Math.sin(state.phase) * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e8f7ef";
    ctx.stroke();
  }
});

const offMove = runtime.onPointerMove(({ x, y }) => {
  state.target = { x, y };
  statusNode.textContent = "pointer " + Math.round(x) + ", " + Math.round(y);
});

document.querySelector("#runtime-resize").addEventListener("click", () => {
  canvas.style.width = canvas.style.width === "520px" ? "100%" : "520px";
  runtime.resizeToDisplaySize();
});
document.querySelector("#runtime-render").addEventListener("click", () => runtime.renderOnce());
document.querySelector("#runtime-destroy").addEventListener("click", () => {
  if (state.destroyed) return;
  offMove();
  runtime.destroy();
  state.destroyed = true;
  statusNode.textContent = "destroyed: RAF and pointer listener released";
});

runtime.resizeToDisplaySize();
runtime.start();`,
  },
  {
    id: "sprite-one-shot",
    title: "Sprite one-shot",
    group: "Systems",
    description:
      "Sprite Animator v2 plays an action once, fires completion and returns to idle.",
    html: `<section class="demo-shell">
  <canvas id="canvas" aria-label="Sprite one-shot preview"></canvas>
  <div class="demo-actions" aria-label="Sprite controls">
    <button id="wave" type="button">Wave</button>
    <button id="blink" type="button">Blink</button>
  </div>
  <p id="sprite-status" class="demo-status">Idle loop is running.</p>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.14)"
});

const frames = {
  idleA: ["0110", "1111", "1001", "0110"],
  idleB: ["0110", "1111", "1111", "0100"],
  waveA: ["0110", "1111", "1001", "0100"],
  waveB: ["0111", "1111", "1001", "0100"],
  waveC: ["1110", "1111", "1001", "0100"],
  blinkA: ["0110", "1001", "1111", "0110"],
  blinkB: ["0110", "1111", "1111", "0110"]
};
const palette = { 0: "transparent", 1: "#00d43b" };
const statusNode = document.querySelector("#sprite-status");
const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  initial: "idle",
  animations: {
    idle: { frames: ["idleA", "idleB"], fps: 3, loop: true },
    wave: { frames: ["waveA", "waveB", "waveC", "waveB"], fps: 8, loop: false },
    blink: { frames: ["blinkA", "blinkB", "blinkA"], fps: 10, loop: false }
  }
});

animator.onComplete((event) => {
  statusNode.textContent = event.animation + " complete -> idle";
  animator.play("idle");
});

function playOnce(name) {
  statusNode.textContent = "playing " + name;
  animator.play(name, { restart: true });
}

document.querySelector("#wave").addEventListener("click", () => playOnce("wave"));
document.querySelector("#blink").addEventListener("click", () => playOnce("blink"));

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    animator.update(elapsed);
  },
  draw() {
    grid.clearCanvas();
    const frame = frames[animator.getFrame()];
    grid.drawPixelSprite(frame, {
      x: 256,
      y: 88,
      pixelSize: 30,
      palette
    });
    grid.drawText(animator.getAnimation(), 320, 300, {
      color: "#e8f7ef",
      font: "20px monospace",
      textAlign: "center"
    });
  }
});`,
  },
  {
    id: "state-machine-sync",
    title: "State machine sync",
    group: "Systems",
    description:
      "Generic transitions with metadata drive animation without coupling to render.",
    html: `<section class="demo-shell">
  <canvas id="canvas" aria-label="State machine preview"></canvas>
  <div class="demo-actions" aria-label="State controls">
    <button data-state="tracking" type="button">Track</button>
    <button data-state="acting" type="button">Act</button>
    <button data-state="idle" type="button">Idle</button>
  </div>
  <p id="state-status" class="demo-status">State: idle</p>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(77, 169, 255, 0.14)"
});

const statusNode = document.querySelector("#state-status");
const machine = GridCanvasSystem.runtime.createStateMachine({
  initial: "idle",
  transitions: {
    idle: ["tracking"],
    tracking: ["idle", "acting"],
    acting: ["idle"]
  },
  states: {
    acting: {
      onEnter() {
        flash = 1;
      }
    }
  },
  historyLimit: 6
});
let flash = 0;
let angle = 0;

machine.subscribe((event) => {
  statusNode.textContent =
    "State: " + event.to + " / history " + machine.getHistory().length + " / source " + event.metadata.source;
});

document.querySelectorAll("[data-state]").forEach((button) => {
  button.addEventListener("click", () => {
    const next = button.dataset.state;
    if (!machine.transition(next, { metadata: { source: "button" } })) {
      statusNode.textContent = "Cannot transition " + machine.getState() + " -> " + next;
    }
  });
});

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    angle += elapsed * (machine.getState() === "tracking" ? 3 : 1);
    flash = Math.max(0, flash - elapsed * 2);
  },
  draw() {
    grid.clearCanvas();
    const state = machine.getState();
    const color = state === "acting" ? "#ffb14a" : state === "tracking" ? "#4da9ff" : "#00d43b";
    grid.drawShip({ x: 320, y: 160 }, 54 + flash * 18, {
      direction: angle,
      fillColor: color,
      strokeColor: "#e8f7ef",
      thruster: state !== "idle"
    });
    grid.drawText(state.toUpperCase(), 320, 286, {
      color: "#e8f7ef",
      font: "22px monospace",
      textAlign: "center"
    });
  }
});`,
  },
  {
    id: "audio-arcade",
    title: "Audio Arcade",
    group: "Audio",
    description:
      "Unlock browser audio and trigger retro SFX plus a looping patrol cue.",
    html: `<section class="demo-shell">
  <p id="audio-status" class="demo-status">Click a button to unlock browser audio.</p>
  <canvas id="canvas" aria-label="Audio Arcade preview"></canvas>
  <div class="demo-actions" aria-label="Audio controls">
    <button id="audio-shoot" type="button">Shoot</button>
    <button id="audio-pickup" type="button">Pickup</button>
    <button id="audio-loop" type="button">Patrol Loop</button>
    <button id="audio-stop" type="button">Stop</button>
    <button id="audio-mute" type="button">Mute</button>
  </div>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(77, 169, 255, 0.14)"
});

const audio = createArcadeAudio({ masterVolume: 0.72 });
const statusNode = document.querySelector("#audio-status");

let activeLoopId;
let activePreset = "none";
let muted = false;
let time = 0;
let flash = 0;

function setStatus(message) {
  statusNode.textContent = message;
}

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.05,
  update(elapsed) {
    time += elapsed;
    flash = Math.max(0, flash - elapsed * 2.4);
  },
  draw() {
    const pulse = GridCanvasSystem.runtime.oscillate01(time, 2.2);

    grid.clearCanvas();
    grid.drawBarIndicator("VOL", 18, 18, 88, 10, muted ? 0 : 72, 100, {
      fillColor: muted ? "#ff5c7a" : "#4da9ff",
      strokeColor: "#e8f7ef",
      textColor: "#e8f7ef",
      font: "11px monospace"
    });
    grid.drawBarIndicator("LOOP", 18, 40, 88, 10, activePreset === "none" ? 0 : 100, 100, {
      fillColor: "#00d43b",
      strokeColor: "#e8f7ef",
      textColor: "#e8f7ef",
      font: "11px monospace"
    });
    grid.drawShip({ x: 320, y: 176 }, 46, {
      rotation: -Math.PI / 2,
      curve1: 0.42,
      curve2: 0.8,
      thruster: activePreset !== "none",
      fillColor: "#101722",
      strokeColor: "#e8f7ef",
      lineWidth: 2
    });
    grid.drawGhost({ x: 154, y: 176 + Math.sin(time * 2) * 5 }, 28 + pulse * 2, {
      feet: 5,
      fillColor: muted ? "#ff5c7a" : "#00d43b",
      strokeColor: "#e8f7ef",
      lineWidth: 1
    });
    grid.drawProjectile({ x: 320 + flash * 180, y: 98 }, 8 + flash * 6, 0.74, {
      fillColor: "#4da9ff",
      strokeColor: "#e8f7ef",
      lineWidth: 1
    });
    grid.drawMessage("AUDIO ARCADE", activePreset === "none" ? "retro SFX ready" : "patrol loop running", {
      x: 320,
      y: 48
    });
  }
});

document.querySelector("#audio-shoot").addEventListener("click", async () => {
  try {
    await audio.playShoot();
    flash = 1;
    setStatus("Played shoot SFX.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
});

document.querySelector("#audio-pickup").addEventListener("click", async () => {
  try {
    await audio.playPickup();
    flash = 0.7;
    setStatus("Played pickup SFX.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
});

document.querySelector("#audio-loop").addEventListener("click", async () => {
  try {
    if (activeLoopId !== undefined) {
      audio.stopLoop(activeLoopId);
    }

    activeLoopId = await audio.playLoop("patrol");
    activePreset = "patrol";
    setStatus("Patrol loop running.");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : String(error));
  }
});

document.querySelector("#audio-stop").addEventListener("click", () => {
  if (activeLoopId !== undefined) {
    audio.stopLoop(activeLoopId);
    activeLoopId = undefined;
  }

  activePreset = "none";
  setStatus("Stopped the active loop.");
});

document.querySelector("#audio-mute").addEventListener("click", () => {
  muted = audio.mute();
  setStatus(muted ? "Muted arcade audio." : "Audio unmuted.");
});

window.addEventListener("beforeunload", () => {
  void audio.dispose();
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
    id: "collision-course",
    title: "Collision course",
    group: "Systems",
    description: "Keyboard and touch movement with wall response and circular targets.",
    html: `<section class="demo-shell">
  <canvas id="canvas" tabindex="0" aria-label="Interactive collision course"></canvas>
  <div class="demo-actions">
    <button id="collision-reset" type="button">Reset</button>
    <span class="demo-status" id="collision-status" aria-live="polite">Reach the green target.</span>
  </div>
</section>`,
    javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(77, 169, 255, 0.14)"
});

const runtime = GridCanvasSystem.runtime;
const keys = runtime.createKeyTracker(grid.canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
});
const pointer = runtime.createPointerTracker(grid.canvas, { preventDefault: true });
const player = { x: 70, y: 180, radius: 14 };
const walls = [
  { x: 210, y: 40, width: 40, height: 220 },
  { x: 390, y: 100, width: 40, height: 220 }
];
const targets = [
  { x: 330, y: 70, radius: 13 },
  { x: 540, y: 280, radius: 13 },
  { x: 100, y: 300, radius: 13 }
];
const statusNode = document.querySelector("#collision-status");
let targetIndex = 0;
let score = 0;
let collisionFlash = 0;
let pointerTargetActive = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hitsWall(circle) {
  return walls.some((wall) => runtime.hitTestCircleRectangle(circle, wall));
}

function movePlayer(dx, dy) {
  let collided = false;
  const nextX = { ...player, x: clamp(player.x + dx, player.radius, 640 - player.radius) };
  if (hitsWall(nextX)) {
    collisionFlash = 0.16;
    collided = true;
  }
  else player.x = nextX.x;

  const nextY = { ...player, y: clamp(player.y + dy, player.radius, 360 - player.radius) };
  if (hitsWall(nextY)) {
    collisionFlash = 0.16;
    collided = true;
  }
  else player.y = nextY.y;

  return collided;
}

function resetCourse() {
  player.x = 70;
  player.y = 180;
  targetIndex = 0;
  score = 0;
  pointerTargetActive = false;
  statusNode.textContent = "Reach the green target.";
  keys.focus();
}

document.querySelector("#collision-reset").addEventListener("click", resetCourse);
grid.canvas.addEventListener("pointerdown", () => {
  pointerTargetActive = true;
  keys.focus();
});

runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.04,
  update(elapsed) {
    collisionFlash = Math.max(0, collisionFlash - elapsed);
    let horizontal = Number(keys.isPressed("ArrowRight") || keys.isPressed("d"))
      - Number(keys.isPressed("ArrowLeft") || keys.isPressed("a"));
    let vertical = Number(keys.isPressed("ArrowDown") || keys.isPressed("s"))
      - Number(keys.isPressed("ArrowUp") || keys.isPressed("w"));

    if (horizontal !== 0 || vertical !== 0) pointerTargetActive = false;

    if (pointerTargetActive) {
      const point = pointer.position();
      const bounds = grid.canvas.getBoundingClientRect();
      const pointerX = point.x * (640 / bounds.width);
      const pointerY = point.y * (360 / bounds.height);
      const distance = Math.hypot(pointerX - player.x, pointerY - player.y);
      if (distance > 2) {
        horizontal = (pointerX - player.x) / distance;
        vertical = (pointerY - player.y) / distance;
      } else pointerTargetActive = false;
    }

    const length = Math.hypot(horizontal, vertical) || 1;
    const collided = movePlayer(
      (horizontal / length) * 190 * elapsed,
      (vertical / length) * 190 * elapsed
    );
    if (collided) pointerTargetActive = false;

    if (runtime.circlesIntersect(player, targets[targetIndex])) {
      score += 1;
      targetIndex = (targetIndex + 1) % targets.length;
      statusNode.textContent = "Target reached. Find the next one.";
    } else if (collisionFlash > 0) {
      statusNode.textContent = "Blocked by a rectangle collision.";
    }
  },
  draw() {
    grid.clearCanvas();
    walls.forEach((wall) => grid.drawPolyline([
      { x: wall.x, y: wall.y },
      { x: wall.x + wall.width, y: wall.y },
      { x: wall.x + wall.width, y: wall.y + wall.height },
      { x: wall.x, y: wall.y + wall.height }
    ], {
      closePath: true,
      strokeColor: collisionFlash > 0 ? "#fb7185" : "#64748b",
      lineWidth: 3
    }));
    grid.drawProjectile(targets[targetIndex], targets[targetIndex].radius, 1, {
      fillColor: "#22c55e", strokeColor: "#dcfce7", lineWidth: 2
    });
    grid.drawProjectile(player, player.radius, 1, {
      fillColor: collisionFlash > 0 ? "#fb7185" : "#4da9ff",
      strokeColor: "#e8f7ef",
      lineWidth: 2
    });
    grid.drawValueLabel("TARGETS", score, 18, 28, { color: "#e8f7ef" });
    grid.drawText("Arrows / WASD / drag", 622, 28, {
      color: "#8e9b93", font: "13px monospace", textAlign: "end"
    });
  }
});

resetCourse();`,
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
  {
    id: "pacman-complete",
    title: "Complete Pac-Man",
    group: "Games",
    description:
      "Full tutorial game loaded by example ID so the iframe URL stays short and reliable.",
    html: PACMAN_GAME_HTML,
    javascript: PACMAN_GAME_JS_EN,
  },
] as const;

export type PlaygroundExampleId = (typeof playgroundExamples)[number]["id"];

export function getPlaygroundExample(id: string): PlaygroundExample {
  return (
    playgroundExamples.find((example) => example.id === id) ?? playgroundExamples[0]
  );
}
