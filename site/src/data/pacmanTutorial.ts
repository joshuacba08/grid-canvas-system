import { libraryVersion } from "./siteRelease";
import type { TutorialStep } from "./tutorialsContent";

const repoUrl = "https://github.com/joshuacba08/grid-canvas-system";

export interface PacmanTutorial {
  audience: string;
  coverage: string[];
  duration: string;
  outcomes: string[];
  prerequisites: string[];
  project: {
    deliverables: string[];
    description: string;
    label: string;
    title: string;
  };
  steps: TutorialStep[];
  summary: string;
  tagline: string;
  title: string;
  version: string;
}

export type PacmanTutorialLocale = "en" | "es" | "ja";

// El HTML y el JavaScript de cada juego se inyectan como cadenas.
// El JS no usa backticks ni interpolacion para poder vivir dentro de esta plantilla.
const PACMAN_GAME_HTML = `<canvas id="canvas" aria-label="Pac-Man completo hecho con grid-canvas-system"></canvas>`;

const PACMAN_GAME_JS_EN = `// Pac-Man - a faithful tribute built with grid-canvas-system.
// In the Playground, GridCanvasSystem, createArcadeAudio, canvas and root already exist.
"use strict";

var runtime = GridCanvasSystem.runtime;

// ---------------------------------------------------------------------------
// 1. Maze. '#' wall, '.' pellet, 'o' energizer, ' ' empty, '-' door.
// ---------------------------------------------------------------------------
var RAW_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......##.......##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

var COLS = RAW_MAZE[0].length;
var ROWS = RAW_MAZE.length;
var TILE = 16;
var HUD_TOP = 48;
var HUD_BOTTOM = 32;
var ORIGIN = { x: 0, y: HUD_TOP };
var TUNNEL_ROW = 14;

var WIDTH = COLS * TILE;
var HEIGHT = HUD_TOP + ROWS * TILE + HUD_BOTTOM;

var PAC_SPAWN = { col: 13, row: 26 };
var DOOR_TILE = { col: 13, row: 12 };
var EXIT_TILE = { col: 13, row: 11 };
var HOUSE_CENTER = { col: 13, row: 14 };
var GHOST_SPAWN = {
  blinky: { col: 13, row: 11 },
  pinky: { col: 13, row: 14 },
  inky: { col: 11, row: 14 },
  clyde: { col: 16, row: 14 },
};
var SCATTER = {
  blinky: { col: COLS - 3, row: 0 },
  pinky: { col: 2, row: 0 },
  inky: { col: COLS - 1, row: ROWS - 1 },
  clyde: { col: 0, row: ROWS - 1 },
};
var GHOST_COLORS = {
  blinky: "#ff0000",
  pinky: "#ffb8ff",
  inky: "#00ffff",
  clyde: "#ffb852",
};

var UP = { x: 0, y: -1 };
var DOWN = { x: 0, y: 1 };
var LEFT = { x: -1, y: 0 };
var RIGHT = { x: 1, y: 0 };
var DIRS = [UP, LEFT, DOWN, RIGHT];

// ---------------------------------------------------------------------------
// 2. Canvas + pixel art assets compiled once.
// ---------------------------------------------------------------------------
var grid = new GridCanvasSystem("canvas", {
  width: WIDTH,
  height: HEIGHT,
  cellSize: TILE,
  majorStep: TILE * 100,
  backgroundColor: "#000000",
  gridColor: "transparent",
  gridLabelColor: "transparent",
});
var ctx = grid.ctx;

var fruitPalette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#ff0000",
  "2": "#00d43b",
  "3": "#ffffff",
});
var cherry = GridCanvasSystem.compilePixelSprite(
  [
    "00000020",
    "00000200",
    "00003200",
    "00113110",
    "01111110",
    "11311131",
    "11111111",
    "01111110",
  ],
  fruitPalette,
);
var lifeIconPalette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#ffe600",
});
var lifeIcon = GridCanvasSystem.compilePixelSprite(
  ["01110", "11100", "11000", "11100", "01110"],
  lifeIconPalette,
);

var WALL_TILESET = { "#": "#1414c8", "-": "#ff9cc8" };

// ---------------------------------------------------------------------------
// 3. Optional arcade audio (browser-native).
// ---------------------------------------------------------------------------
var audio = null;
try {
  audio = createArcadeAudio({ masterVolume: 0.4 });
} catch (error) {
  audio = null;
}
var sirenId = null;
function sfx(name) {
  if (audio === null) return;
  if (name === "pellet") audio.playPickup({ volume: 0.25 });
  else if (name === "power") audio.playShoot();
  else if (name === "ghost") audio.playPreset("pickup", { volume: 0.6 });
  else if (name === "death") audio.playExplosion();
}
function startSiren() {
  if (audio === null || sirenId !== null) return;
  audio.playLoop("danger", { volume: 0.15 }).then(function (id) {
    sirenId = id;
  });
}
function stopSiren() {
  if (audio === null || sirenId === null) return;
  audio.stopLoop(sirenId);
  sirenId = null;
}

// ---------------------------------------------------------------------------
// 4. Cell / pixel helpers.
// ---------------------------------------------------------------------------
function centerOf(col, row) {
  return {
    x: ORIGIN.x + col * TILE + TILE / 2,
    y: ORIGIN.y + row * TILE + TILE / 2,
  };
}
function tileOf(entity) {
  return {
    col: Math.round((entity.x - ORIGIN.x - TILE / 2) / TILE),
    row: Math.round((entity.y - ORIGIN.y - TILE / 2) / TILE),
  };
}
function mazeChar(col, row) {
  if (row < 0 || row >= ROWS) return "#";
  if (col < 0 || col >= COLS) {
    return row === TUNNEL_ROW ? " " : "#";
  }
  return game.maze[row].charAt(col);
}
function isWallForPac(col, row) {
  var c = mazeChar(col, row);
  return c === "#" || c === "-";
}
function isWallForGhost(col, row, ghost) {
  var c = mazeChar(col, row);
  if (c === "#") return true;
  if (c === "-") return ghost.pass !== true;
  return false;
}
function opposite(dir) {
  return { x: -dir.x, y: -dir.y };
}
function sameDir(a, b) {
  return a.x === b.x && a.y === b.y;
}

// ---------------------------------------------------------------------------
// 5. Global state.
// ---------------------------------------------------------------------------
var game = {
  maze: [],
  pelletsLeft: 0,
  score: 0,
  high: 0,
  lives: 3,
  level: 1,
  extraAwarded: false,
  pac: null,
  ghosts: [],
  modeTimer: 0,
  modeIndex: 0,
  globalMode: "scatter",
  globalElapsed: 0,
  frightenedTime: 0,
  ghostChain: 0,
  readyTimer: 0,
  dyingTimer: 0,
  popups: [],
  particles: [],
  fruit: null,
  fruitTimer: 0,
  blink: 0,
};

var MODE_SCHEDULE = [
  { mode: "scatter", dur: 7 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 7 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 },
  { mode: "chase", dur: Infinity },
];

function frightenedDuration() {
  return Math.max(1.5, 7 - (game.level - 1) * 0.5);
}
function pacSpeed() {
  return 76 + (game.level - 1) * 4;
}
function ghostSpeed() {
  return 72 + (game.level - 1) * 4;
}

var TOTAL_PELLETS = (function () {
  var total = 0;
  for (var r = 0; r < ROWS; r += 1) {
    for (var c = 0; c < COLS; c += 1) {
      var ch = RAW_MAZE[r].charAt(c);
      if (ch === "." || ch === "o") total += 1;
    }
  }
  return total;
})();

// ---------------------------------------------------------------------------
// 6. Build / reset.
// ---------------------------------------------------------------------------
function buildMaze() {
  game.maze = RAW_MAZE.slice();
  game.pelletsLeft = TOTAL_PELLETS;
  // Pac starts on an empty cell: he never "arrives" at his own start tile, so
  // a pellet there would never be eaten and the level could never be completed.
  var ch = game.maze[PAC_SPAWN.row].charAt(PAC_SPAWN.col);
  if (ch === "." || ch === "o") {
    game.maze = runtime.setTileAt(game.maze, { column: PAC_SPAWN.col, row: PAC_SPAWN.row }, " ");
    game.pelletsLeft -= 1;
  }
}

function makeGhost(name) {
  var spawn = GHOST_SPAWN[name];
  var pos = centerOf(spawn.col, spawn.row);
  var machine = runtime.createStateMachine({
    initial: "house",
    transitions: {
      house: ["leaving", "frightened"],
      leaving: ["scatter", "chase"],
      scatter: ["chase", "frightened", "eaten"],
      chase: ["scatter", "frightened", "eaten"],
      frightened: ["scatter", "chase", "eaten"],
      eaten: ["house"],
    },
  });
  return {
    name: name,
    x: pos.x,
    y: pos.y,
    dir: name === "blinky" ? LEFT : UP,
    prev: { x: pos.x, y: pos.y },
    target: { x: pos.x, y: pos.y },
    machine: machine,
    color: GHOST_COLORS[name],
    pass: false,
    releaseAt: name === "blinky" ? 0 : name === "pinky" ? 1.5 : name === "inky" ? 5 : 9,
    bob: 0,
  };
}

function resetActors() {
  var start = centerOf(PAC_SPAWN.col, PAC_SPAWN.row);
  game.pac = {
    x: start.x,
    y: start.y,
    dir: LEFT,
    want: LEFT,
    prev: { x: start.x, y: start.y },
    target: { x: start.x, y: start.y },
    mouth: 0,
    anim: 0,
  };
  game.ghosts = [
    makeGhost("blinky"),
    makeGhost("pinky"),
    makeGhost("inky"),
    makeGhost("clyde"),
  ];
  game.modeTimer = 0;
  game.modeIndex = 0;
  game.globalMode = "scatter";
  game.globalElapsed = 0;
  game.frightenedTime = 0;
  game.ghostChain = 0;
  game.dyingTimer = 0;
  game.fruit = null;
  game.fruitTimer = 0;
}

function startLevel() {
  buildMaze();
  resetActors();
  game.readyTimer = 2;
}

function fullReset() {
  game.score = 0;
  game.lives = 3;
  game.level = 1;
  game.extraAwarded = false;
  game.popups = [];
  game.particles = [];
  startLevel();
}

// ---------------------------------------------------------------------------
// 7. Cell-based movement (hop between tile centers).
// ---------------------------------------------------------------------------
function moveToward(entity, budget) {
  var dx = entity.target.x - entity.x;
  var dy = entity.target.y - entity.y;
  var dist = Math.abs(dx) + Math.abs(dy);
  if (dist <= budget) {
    entity.x = entity.target.x;
    entity.y = entity.target.y;
    return budget - dist;
  }
  entity.x += Math.sign(dx) * Math.min(budget, Math.abs(dx));
  entity.y += Math.sign(dy) * Math.min(budget, Math.abs(dy));
  return 0;
}

function wrapTunnel(entity) {
  var tile = tileOf(entity);
  if (tile.col < 0) {
    entity.x += COLS * TILE;
    entity.prev.x += COLS * TILE;
    entity.target.x += COLS * TILE;
  } else if (tile.col >= COLS) {
    entity.x -= COLS * TILE;
    entity.prev.x -= COLS * TILE;
    entity.target.x -= COLS * TILE;
  }
}

function updatePac(step) {
  var pac = game.pac;
  var atCenter = pac.x === pac.target.x && pac.y === pac.target.y;

  // Instant reverse allowed mid-tile.
  if ((pac.dir.x !== 0 || pac.dir.y !== 0) && sameDir(pac.want, opposite(pac.dir)) && !atCenter) {
    var swap = pac.target;
    pac.target = pac.prev;
    pac.prev = swap;
    pac.dir = pac.want;
  }
  // If stopped at a center, try to start toward the input.
  if (pac.dir.x === 0 && pac.dir.y === 0) {
    var t0 = tileOf(pac);
    if (!isWallForPac(t0.col + pac.want.x, t0.row + pac.want.y)) {
      pac.dir = pac.want;
      pac.prev = { x: pac.x, y: pac.y };
      pac.target = centerOf(t0.col + pac.dir.x, t0.row + pac.dir.y);
    }
  }

  var budget = pacSpeed() * step;
  var guard = 0;
  while (budget > 0 && guard < 6) {
    guard += 1;
    if (pac.x === pac.target.x && pac.y === pac.target.y) {
      arrivePac();
      if (pac.dir.x === 0 && pac.dir.y === 0) break;
    }
    budget = moveToward(pac, budget);
  }

  if (pac.dir.x !== 0 || pac.dir.y !== 0) {
    pac.anim += step * 10;
    pac.mouth = runtime.oscillate01(pac.anim, 1);
  } else {
    pac.mouth = 0.15;
  }
}

function arrivePac() {
  var pac = game.pac;
  wrapTunnel(pac);
  var tile = tileOf(pac);
  eatAt(tile.col, tile.row);

  var nextDir;
  if (!isWallForPac(tile.col + pac.want.x, tile.row + pac.want.y)) {
    nextDir = pac.want;
  } else if (!isWallForPac(tile.col + pac.dir.x, tile.row + pac.dir.y)) {
    nextDir = pac.dir;
  } else {
    nextDir = { x: 0, y: 0 };
  }
  pac.dir = nextDir;
  pac.prev = { x: pac.x, y: pac.y };
  if (nextDir.x === 0 && nextDir.y === 0) {
    pac.target = { x: pac.x, y: pac.y };
  } else {
    pac.target = centerOf(tile.col + nextDir.x, tile.row + nextDir.y);
  }
}

function eatAt(col, row) {
  var ch = mazeChar(col, row);
  if (ch !== "." && ch !== "o") return;
  game.maze = runtime.setTileAt(game.maze, { column: col, row: row }, " ");
  game.pelletsLeft -= 1;
  if (ch === ".") {
    addScore(10);
    sfx("pellet");
  } else {
    addScore(50);
    sfx("power");
    triggerFrightened();
  }
  maybeSpawnFruit();
}

// ---------------------------------------------------------------------------
// 8. Ghosts: modes, targets and classic AI.
// ---------------------------------------------------------------------------
function triggerFrightened() {
  game.frightenedTime = frightenedDuration();
  game.ghostChain = 0;
  game.ghosts.forEach(function (ghost) {
    var s = ghost.machine.getState();
    if (s === "scatter" || s === "chase") {
      ghost.machine.transition("frightened");
      reverseGhost(ghost);
    }
  });
}

function reverseGhost(ghost) {
  var swap = ghost.target;
  ghost.target = ghost.prev;
  ghost.prev = swap;
  ghost.dir = opposite(ghost.dir);
}

function ghostTarget(ghost) {
  var pac = game.pac;
  var pt = tileOf(pac);
  var state = ghost.machine.getState();
  if (state === "scatter" || state === "frightened") return SCATTER[ghost.name];
  if (state === "eaten") return EXIT_TILE;
  var dir = pac.dir;
  if (ghost.name === "blinky") {
    return { col: pt.col, row: pt.row };
  }
  if (ghost.name === "pinky") {
    var pc = pt.col + dir.x * 4;
    var pr = pt.row + dir.y * 4;
    if (dir.y === -1) pc -= 4;
    return { col: pc, row: pr };
  }
  if (ghost.name === "inky") {
    var bx = tileOf(game.ghosts[0]);
    var px = pt.col + dir.x * 2;
    var py = pt.row + dir.y * 2;
    if (dir.y === -1) px -= 2;
    return { col: px * 2 - bx.col, row: py * 2 - bx.row };
  }
  var dc = tileOf(ghost);
  var d = Math.hypot(dc.col - pt.col, dc.row - pt.row);
  return d > 8 ? { col: pt.col, row: pt.row } : SCATTER.clyde;
}

function updateGhost(ghost, step) {
  var state = ghost.machine.getState();

  if (state === "house") {
    houseBob(ghost, step);
    if (game.readyTimer <= 0 && game.frightenedTime <= 0 && game.globalElapsed >= ghost.releaseAt) {
      ghost.machine.transition("leaving");
    }
    return;
  }
  if (state === "leaving") {
    leaveHouse(ghost, step);
    return;
  }
  if (state === "eaten") {
    returnHome(ghost, step);
    return;
  }

  var speed = state === "frightened" ? ghostSpeed() * 0.55 : ghostSpeed();
  var budget = speed * step;
  var guard = 0;
  while (budget > 0 && guard < 6) {
    guard += 1;
    if (ghost.x === ghost.target.x && ghost.y === ghost.target.y) {
      arriveGhost(ghost);
    }
    budget = moveToward(ghost, budget);
  }
}

function houseBob(ghost, step) {
  ghost.bob += step * 3;
  var base = centerOf(GHOST_SPAWN[ghost.name].col, GHOST_SPAWN[ghost.name].row);
  ghost.x = base.x;
  ghost.y = base.y + Math.sin(ghost.bob) * 4;
}

function leaveHouse(ghost, step) {
  ghost.pass = true;
  var door = centerOf(DOOR_TILE.col, DOOR_TILE.row);
  var exit = centerOf(EXIT_TILE.col, EXIT_TILE.row);
  var budget = ghostSpeed() * step;
  if (Math.abs(ghost.x - door.x) > 1) {
    ghost.x += Math.sign(door.x - ghost.x) * Math.min(budget, Math.abs(door.x - ghost.x));
  } else {
    ghost.x = door.x;
    ghost.y += Math.sign(exit.y - ghost.y) * Math.min(budget, Math.abs(exit.y - ghost.y));
  }
  if (Math.abs(ghost.x - exit.x) < 1 && Math.abs(ghost.y - exit.y) < 1) {
    ghost.pass = false;
    ghost.x = exit.x;
    ghost.y = exit.y;
    ghost.dir = LEFT;
    ghost.prev = { x: exit.x, y: exit.y };
    ghost.target = { x: exit.x, y: exit.y };
    ghost.machine.transition(game.globalMode === "chase" ? "chase" : "scatter");
  }
}

function returnHome(ghost, step) {
  ghost.pass = true;
  var budget = ghostSpeed() * 1.9 * step;
  var guard = 0;
  while (budget > 0 && guard < 8) {
    guard += 1;
    if (ghost.x === ghost.target.x && ghost.y === ghost.target.y) {
      arriveGhost(ghost);
      if (ghost.machine.getState() === "house") break;
    }
    budget = moveToward(ghost, budget);
  }
}

function arriveGhost(ghost) {
  wrapTunnel(ghost);
  var tile = tileOf(ghost);

  if (ghost.machine.getState() === "eaten" && tile.col === EXIT_TILE.col && tile.row === EXIT_TILE.row) {
    var home = centerOf(HOUSE_CENTER.col, HOUSE_CENTER.row);
    ghost.x = home.x;
    ghost.y = home.y;
    ghost.prev = { x: home.x, y: home.y };
    ghost.target = { x: home.x, y: home.y };
    ghost.pass = false;
    ghost.bob = 0;
    ghost.machine.transition("house");
    return;
  }

  var target = ghostTarget(ghost);
  var back = opposite(ghost.dir);
  var options = DIRS.filter(function (dir) {
    if (sameDir(dir, back)) return false;
    return !isWallForGhost(tile.col + dir.x, tile.row + dir.y, ghost);
  });
  if (options.length === 0) options = [back];

  var chosen;
  if (ghost.machine.getState() === "frightened") {
    chosen = options[Math.floor(Math.random() * options.length)];
  } else {
    var best = Infinity;
    chosen = options[0];
    var goal = centerOf(target.col, target.row);
    options.forEach(function (dir) {
      var c = centerOf(tile.col + dir.x, tile.row + dir.y);
      var d = (c.x - goal.x) * (c.x - goal.x) + (c.y - goal.y) * (c.y - goal.y);
      if (d < best) {
        best = d;
        chosen = dir;
      }
    });
  }
  ghost.dir = chosen;
  ghost.prev = { x: ghost.x, y: ghost.y };
  ghost.target = centerOf(tile.col + chosen.x, tile.row + chosen.y);
}

// ---------------------------------------------------------------------------
// 9. Collisions, score, death, fruit and feedback.
// ---------------------------------------------------------------------------
function addScore(points) {
  game.score += points;
  if (game.score > game.high) game.high = game.score;
  if (!game.extraAwarded && game.score >= 10000) {
    game.extraAwarded = true;
    game.lives += 1;
  }
}

function addPopup(text, x, y) {
  game.popups.push({ text: text, x: x, y: y, life: 1 });
}

function spawnBurst(x, y) {
  var burst = runtime.createParticleBurst({ x: x, y: y }, 12, {
    speed: 90,
    speedJitter: 40,
    life: 0.6,
    size: 3,
  });
  game.particles = game.particles.concat(burst);
}

function maybeSpawnFruit() {
  var eaten = TOTAL_PELLETS - game.pelletsLeft;
  if (game.fruit === null && (eaten === 70 || eaten === 170)) {
    var pos = centerOf(HOUSE_CENTER.col, HOUSE_CENTER.row + 3);
    game.fruit = { x: pos.x, y: pos.y, points: 100 + (game.level - 1) * 100 };
    game.fruitTimer = 9;
  }
}

function handleCollisions() {
  var pac = game.pac;
  if (game.fruit !== null && Math.hypot(pac.x - game.fruit.x, pac.y - game.fruit.y) < TILE * 0.7) {
    addScore(game.fruit.points);
    addPopup(String(game.fruit.points), game.fruit.x, game.fruit.y);
    spawnBurst(game.fruit.x, game.fruit.y);
    game.fruit = null;
  }
  for (var i = 0; i < game.ghosts.length; i += 1) {
    var ghost = game.ghosts[i];
    var state = ghost.machine.getState();
    if (state === "eaten" || state === "house" || state === "leaving") continue;
    if (Math.hypot(pac.x - ghost.x, pac.y - ghost.y) < TILE * 0.7) {
      if (state === "frightened") {
        game.ghostChain += 1;
        var points = 200 * Math.pow(2, game.ghostChain - 1);
        addScore(points);
        addPopup(String(points), ghost.x, ghost.y);
        spawnBurst(ghost.x, ghost.y);
        ghost.machine.transition("eaten");
        sfx("ghost");
      } else {
        killPac();
        return;
      }
    }
  }
}

function killPac() {
  game.dyingTimer = 1.1;
  stopSiren();
  sfx("death");
}

function finishDeath() {
  game.lives -= 1;
  if (game.lives < 0) {
    manager.transition("gameover");
  } else {
    resetActors();
    game.readyTimer = 1.5;
    manager.transition("ready");
  }
}

function updateFeedback(step) {
  game.popups = game.popups.filter(function (p) {
    p.y -= step * 24;
    p.life -= step * 1.2;
    return p.life > 0;
  });
  game.particles = runtime.stepParticles(game.particles, step);
  if (game.fruit !== null) {
    game.fruitTimer -= step;
    if (game.fruitTimer <= 0) game.fruit = null;
  }
}

// ---------------------------------------------------------------------------
// 10. Main gameplay update.
// ---------------------------------------------------------------------------
function updatePlay(step) {
  game.blink += step;

  if (game.dyingTimer > 0) {
    game.dyingTimer -= step;
    updateFeedback(step);
    if (game.dyingTimer <= 0) finishDeath();
    return;
  }

  startSiren();
  game.globalElapsed += step;

  if (game.frightenedTime > 0) {
    game.frightenedTime -= step;
    if (game.frightenedTime <= 0) {
      game.ghosts.forEach(function (ghost) {
        if (ghost.machine.getState() === "frightened") {
          ghost.machine.transition(game.globalMode === "chase" ? "chase" : "scatter");
        }
      });
    }
  } else {
    var slot = MODE_SCHEDULE[game.modeIndex];
    game.modeTimer += step;
    if (game.modeTimer >= slot.dur && game.modeIndex < MODE_SCHEDULE.length - 1) {
      game.modeIndex += 1;
      game.modeTimer = 0;
      game.globalMode = MODE_SCHEDULE[game.modeIndex].mode;
      game.ghosts.forEach(function (ghost) {
        var s = ghost.machine.getState();
        if (s === "scatter" || s === "chase") {
          ghost.machine.transition(game.globalMode);
          reverseGhost(ghost);
        }
      });
    }
  }

  updatePac(step);
  game.ghosts.forEach(function (ghost) {
    updateGhost(ghost, step);
  });
  handleCollisions();
  updateFeedback(step);

  if (game.pelletsLeft <= 0) {
    game.level += 1;
    stopSiren();
    startLevel();
    manager.transition("ready");
  }
}

// ---------------------------------------------------------------------------
// 11. Render.
// ---------------------------------------------------------------------------
function drawMaze() {
  runtime.drawTileMap(game.maze, WALL_TILESET, {
    grid: grid,
    tileSize: TILE,
    origin: ORIGIN,
  });
  for (var r = 0; r < ROWS; r += 1) {
    for (var c = 0; c < COLS; c += 1) {
      var ch = game.maze[r].charAt(c);
      if (ch !== "." && ch !== "o") continue;
      var b = runtime.tileToBounds({ column: c, row: r }, { tileSize: TILE, origin: ORIGIN });
      var cx = b.x + b.width / 2;
      var cy = b.y + b.height / 2;
      ctx.fillStyle = "#ffd7a8";
      ctx.beginPath();
      if (ch === ".") {
        ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
      } else {
        var pulse = 3 + runtime.oscillate01(game.blink, 3) * 2;
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }
}

function drawFruit() {
  if (game.fruit === null) return;
  grid.drawCompiledPixelSprite(cherry, {
    x: game.fruit.x - TILE / 2,
    y: game.fruit.y - TILE / 2,
    pixelSize: 2,
  });
}

function drawPac() {
  var pac = game.pac;
  var dir = 0;
  if (sameDir(pac.dir, DOWN)) dir = Math.PI / 2;
  else if (sameDir(pac.dir, LEFT)) dir = Math.PI;
  else if (sameDir(pac.dir, UP)) dir = -Math.PI / 2;

  var mouth = pac.mouth;
  if (game.dyingTimer > 0) {
    mouth = Math.min(1, (1 - game.dyingTimer / 1.1) * 1.4);
  }
  grid.drawPacman(pac.x, pac.y, TILE * 0.62, mouth, {
    direction: dir,
    fillColor: "#ffe600",
    strokeColor: "#000000",
  });
}

function drawGhosts() {
  game.ghosts.forEach(function (ghost) {
    var state = ghost.machine.getState();
    if (state === "eaten") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ghost.x - 3, ghost.y - 2, 2.4, 0, Math.PI * 2);
      ctx.arc(ghost.x + 3, ghost.y - 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    var fill = ghost.color;
    var eye = "#ffffff";
    var pupil = "#1414c8";
    if (state === "frightened") {
      var flashing = game.frightenedTime < 2 && Math.floor(game.blink * 6) % 2 === 0;
      fill = flashing ? "#ffffff" : "#2121ff";
      pupil = "#ff0000";
    }
    grid.drawGhost({ x: ghost.x, y: ghost.y }, TILE * 0.62, {
      fillColor: fill,
      eyeColor: eye,
      pupilColor: pupil,
    });
  });
}

function drawPopups() {
  ctx.textAlign = "center";
  ctx.font = "10px 'Geist Pixel', monospace";
  game.popups.forEach(function (p) {
    ctx.fillStyle = "rgba(255,255,255," + Math.max(0, p.life) + ")";
    ctx.fillText(p.text, p.x, p.y);
  });
  ctx.textAlign = "start";
  ctx.fillStyle = "#ffd7a8";
  game.particles.forEach(function (particle) {
    ctx.globalAlpha = Math.max(0, particle.life / (particle.maxLife || 1));
    var s = particle.size || 2;
    ctx.fillRect(particle.x - s / 2, particle.y - s / 2, s, s);
  });
  ctx.globalAlpha = 1;
}

function drawHud() {
  grid.drawValueLabel("1UP", game.score, 12, 20, {
    color: "#ffffff",
    font: "14px 'Geist Pixel', monospace",
  });
  grid.drawValueLabel("HIGH", game.high, WIDTH - 168, 20, {
    color: "#ffd7a8",
    font: "14px 'Geist Pixel', monospace",
  });
  grid.drawValueLabel("LV", game.level, WIDTH - 56, 20, {
    color: "#00d43b",
    font: "14px 'Geist Pixel', monospace",
  });
  for (var i = 0; i < game.lives; i += 1) {
    grid.drawCompiledPixelSprite(lifeIcon, {
      x: 12 + i * 26,
      y: HEIGHT - HUD_BOTTOM + 6,
      pixelSize: 4,
    });
  }
  if (game.frightenedTime > 0) {
    grid.drawBarIndicator("PWR", WIDTH - 150, HEIGHT - HUD_BOTTOM + 8, 100, 12, game.frightenedTime, frightenedDuration(), {
      fillColor: "#2121ff",
      textColor: "#ffffff",
    });
  }
}

function renderScene() {
  grid.clearCanvas();
  drawMaze();
  drawFruit();
  drawGhosts();
  drawPac();
  drawPopups();
  drawHud();
}

// Initial state: the menu already shows the board behind the title.
startLevel();

// ---------------------------------------------------------------------------
// 12. Scenes (menu / ready / play / paused / gameover).
// ---------------------------------------------------------------------------
var manager = runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu: {
      draw: function () {
        grid.clearCanvas();
        drawMaze();
        grid.drawMessage("PAC-MAN", "Press Enter to play", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ffe600",
          subColor: "#ffffff",
          mainFont: "34px 'Geist Pixel', monospace",
          subFont: "14px 'Geist Pixel', monospace",
        });
      },
    },
    ready: {
      update: function (step) {
        game.readyTimer -= step;
        if (game.readyTimer <= 0) manager.transition("play");
      },
      draw: function () {
        renderScene();
        grid.drawMessage("", "READY!", { x: WIDTH / 2, y: HEIGHT / 2 + 22 }, {
          color: "#ffe600",
          subColor: "#ffe600",
          subFont: "16px 'Geist Pixel', monospace",
        });
      },
    },
    play: {
      update: function (step) {
        updatePlay(step);
      },
      draw: function () {
        renderScene();
      },
      exit: function () {
        stopSiren();
      },
    },
    paused: {
      draw: function () {
        renderScene();
        grid.drawMessage("PAUSED", "Press P to resume", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ffffff",
          subColor: "#ffd7a8",
          mainFont: "26px 'Geist Pixel', monospace",
          subFont: "13px 'Geist Pixel', monospace",
        });
      },
    },
    gameover: {
      enter: function () {
        stopSiren();
      },
      draw: function () {
        renderScene();
        grid.drawMessage("GAME OVER", "Press Enter to restart", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ff0000",
          subColor: "#ffffff",
          mainFont: "28px 'Geist Pixel', monospace",
          subFont: "13px 'Geist Pixel', monospace",
        });
      },
    },
  },
});

// ---------------------------------------------------------------------------
// 13. Input + deterministic fixed-step loop.
// ---------------------------------------------------------------------------
var keys = runtime.createKeyTracker(canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "],
});
var pausePressed = false;
var actionPressed = false;

function readInput() {
  var scene = manager.getSceneId();
  var pac = game.pac;
  if (pac !== null) {
    if (keys.isPressed("ArrowLeft") || keys.isPressed("a")) pac.want = LEFT;
    else if (keys.isPressed("ArrowRight") || keys.isPressed("d")) pac.want = RIGHT;
    else if (keys.isPressed("ArrowUp") || keys.isPressed("w")) pac.want = UP;
    else if (keys.isPressed("ArrowDown") || keys.isPressed("s")) pac.want = DOWN;
  }

  var action = keys.isPressed("Enter") || keys.isPressed(" ");
  if (action && !actionPressed) {
    if (audio !== null) audio.resume();
    if (scene === "menu") {
      fullReset();
      manager.transition("ready");
    } else if (scene === "gameover") {
      fullReset();
      manager.transition("menu");
    }
  }
  actionPressed = action;

  var pause = keys.isPressed("p") || keys.isPressed("P");
  if (pause && !pausePressed) {
    if (scene === "play") manager.transition("paused");
    else if (scene === "paused") manager.transition("play");
  }
  pausePressed = pause;
}

var loop = runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  maxUpdatesPerFrame: 5,
  update: function (step) {
    readInput();
    manager.update(step);
  },
  draw: function () {
    manager.draw(ctx);
  },
});`;
const PACMAN_GAME_JS_JA = `// Pac-Man - grid-canvas-system で作った忠実なトリビュート。
// Playground には GridCanvasSystem、createArcadeAudio、canvas、root が既にあります。
"use strict";

var runtime = GridCanvasSystem.runtime;

// ---------------------------------------------------------------------------
// 1. 迷路。'#' 壁、'.' ドット、'o' パワーエサ、' ' 空き、'-' ドア。
// ---------------------------------------------------------------------------
var RAW_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......##.......##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

var COLS = RAW_MAZE[0].length;
var ROWS = RAW_MAZE.length;
var TILE = 16;
var HUD_TOP = 48;
var HUD_BOTTOM = 32;
var ORIGIN = { x: 0, y: HUD_TOP };
var TUNNEL_ROW = 14;

var WIDTH = COLS * TILE;
var HEIGHT = HUD_TOP + ROWS * TILE + HUD_BOTTOM;

var PAC_SPAWN = { col: 13, row: 26 };
var DOOR_TILE = { col: 13, row: 12 };
var EXIT_TILE = { col: 13, row: 11 };
var HOUSE_CENTER = { col: 13, row: 14 };
var GHOST_SPAWN = {
  blinky: { col: 13, row: 11 },
  pinky: { col: 13, row: 14 },
  inky: { col: 11, row: 14 },
  clyde: { col: 16, row: 14 },
};
var SCATTER = {
  blinky: { col: COLS - 3, row: 0 },
  pinky: { col: 2, row: 0 },
  inky: { col: COLS - 1, row: ROWS - 1 },
  clyde: { col: 0, row: ROWS - 1 },
};
var GHOST_COLORS = {
  blinky: "#ff0000",
  pinky: "#ffb8ff",
  inky: "#00ffff",
  clyde: "#ffb852",
};

var UP = { x: 0, y: -1 };
var DOWN = { x: 0, y: 1 };
var LEFT = { x: -1, y: 0 };
var RIGHT = { x: 1, y: 0 };
var DIRS = [UP, LEFT, DOWN, RIGHT];

// ---------------------------------------------------------------------------
// 2. キャンバス + 一度だけコンパイルするピクセルアート素材。
// ---------------------------------------------------------------------------
var grid = new GridCanvasSystem("canvas", {
  width: WIDTH,
  height: HEIGHT,
  cellSize: TILE,
  majorStep: TILE * 100,
  backgroundColor: "#000000",
  gridColor: "transparent",
  gridLabelColor: "transparent",
});
var ctx = grid.ctx;

var fruitPalette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#ff0000",
  "2": "#00d43b",
  "3": "#ffffff",
});
var cherry = GridCanvasSystem.compilePixelSprite(
  [
    "00000020",
    "00000200",
    "00003200",
    "00113110",
    "01111110",
    "11311131",
    "11111111",
    "01111110",
  ],
  fruitPalette,
);
var lifeIconPalette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#ffe600",
});
var lifeIcon = GridCanvasSystem.compilePixelSprite(
  ["01110", "11100", "11000", "11100", "01110"],
  lifeIconPalette,
);

var WALL_TILESET = { "#": "#1414c8", "-": "#ff9cc8" };

// ---------------------------------------------------------------------------
// 3. 任意のアーケード音声（ブラウザ標準）。
// ---------------------------------------------------------------------------
var audio = null;
try {
  audio = createArcadeAudio({ masterVolume: 0.4 });
} catch (error) {
  audio = null;
}
var sirenId = null;
function sfx(name) {
  if (audio === null) return;
  if (name === "pellet") audio.playPickup({ volume: 0.25 });
  else if (name === "power") audio.playShoot();
  else if (name === "ghost") audio.playPreset("pickup", { volume: 0.6 });
  else if (name === "death") audio.playExplosion();
}
function startSiren() {
  if (audio === null || sirenId !== null) return;
  audio.playLoop("danger", { volume: 0.15 }).then(function (id) {
    sirenId = id;
  });
}
function stopSiren() {
  if (audio === null || sirenId === null) return;
  audio.stopLoop(sirenId);
  sirenId = null;
}

// ---------------------------------------------------------------------------
// 4. セル / ピクセルのヘルパー。
// ---------------------------------------------------------------------------
function centerOf(col, row) {
  return {
    x: ORIGIN.x + col * TILE + TILE / 2,
    y: ORIGIN.y + row * TILE + TILE / 2,
  };
}
function tileOf(entity) {
  return {
    col: Math.round((entity.x - ORIGIN.x - TILE / 2) / TILE),
    row: Math.round((entity.y - ORIGIN.y - TILE / 2) / TILE),
  };
}
function mazeChar(col, row) {
  if (row < 0 || row >= ROWS) return "#";
  if (col < 0 || col >= COLS) {
    return row === TUNNEL_ROW ? " " : "#";
  }
  return game.maze[row].charAt(col);
}
function isWallForPac(col, row) {
  var c = mazeChar(col, row);
  return c === "#" || c === "-";
}
function isWallForGhost(col, row, ghost) {
  var c = mazeChar(col, row);
  if (c === "#") return true;
  if (c === "-") return ghost.pass !== true;
  return false;
}
function opposite(dir) {
  return { x: -dir.x, y: -dir.y };
}
function sameDir(a, b) {
  return a.x === b.x && a.y === b.y;
}

// ---------------------------------------------------------------------------
// 5. グローバル状態。
// ---------------------------------------------------------------------------
var game = {
  maze: [],
  pelletsLeft: 0,
  score: 0,
  high: 0,
  lives: 3,
  level: 1,
  extraAwarded: false,
  pac: null,
  ghosts: [],
  modeTimer: 0,
  modeIndex: 0,
  globalMode: "scatter",
  globalElapsed: 0,
  frightenedTime: 0,
  ghostChain: 0,
  readyTimer: 0,
  dyingTimer: 0,
  popups: [],
  particles: [],
  fruit: null,
  fruitTimer: 0,
  blink: 0,
};

var MODE_SCHEDULE = [
  { mode: "scatter", dur: 7 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 7 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 },
  { mode: "chase", dur: Infinity },
];

function frightenedDuration() {
  return Math.max(1.5, 7 - (game.level - 1) * 0.5);
}
function pacSpeed() {
  return 76 + (game.level - 1) * 4;
}
function ghostSpeed() {
  return 72 + (game.level - 1) * 4;
}

var TOTAL_PELLETS = (function () {
  var total = 0;
  for (var r = 0; r < ROWS; r += 1) {
    for (var c = 0; c < COLS; c += 1) {
      var ch = RAW_MAZE[r].charAt(c);
      if (ch === "." || ch === "o") total += 1;
    }
  }
  return total;
})();

// ---------------------------------------------------------------------------
// 6. 構築 / リセット。
// ---------------------------------------------------------------------------
function buildMaze() {
  game.maze = RAW_MAZE.slice();
  game.pelletsLeft = TOTAL_PELLETS;
  // Pac は空きセルから開始する: 自分の開始タイルには決して「到着」しないので、
  // そこにドットがあると絶対に食べられず、レベルをクリアできない。
  var ch = game.maze[PAC_SPAWN.row].charAt(PAC_SPAWN.col);
  if (ch === "." || ch === "o") {
    game.maze = runtime.setTileAt(game.maze, { column: PAC_SPAWN.col, row: PAC_SPAWN.row }, " ");
    game.pelletsLeft -= 1;
  }
}

function makeGhost(name) {
  var spawn = GHOST_SPAWN[name];
  var pos = centerOf(spawn.col, spawn.row);
  var machine = runtime.createStateMachine({
    initial: "house",
    transitions: {
      house: ["leaving", "frightened"],
      leaving: ["scatter", "chase"],
      scatter: ["chase", "frightened", "eaten"],
      chase: ["scatter", "frightened", "eaten"],
      frightened: ["scatter", "chase", "eaten"],
      eaten: ["house"],
    },
  });
  return {
    name: name,
    x: pos.x,
    y: pos.y,
    dir: name === "blinky" ? LEFT : UP,
    prev: { x: pos.x, y: pos.y },
    target: { x: pos.x, y: pos.y },
    machine: machine,
    color: GHOST_COLORS[name],
    pass: false,
    releaseAt: name === "blinky" ? 0 : name === "pinky" ? 1.5 : name === "inky" ? 5 : 9,
    bob: 0,
  };
}

function resetActors() {
  var start = centerOf(PAC_SPAWN.col, PAC_SPAWN.row);
  game.pac = {
    x: start.x,
    y: start.y,
    dir: LEFT,
    want: LEFT,
    prev: { x: start.x, y: start.y },
    target: { x: start.x, y: start.y },
    mouth: 0,
    anim: 0,
  };
  game.ghosts = [
    makeGhost("blinky"),
    makeGhost("pinky"),
    makeGhost("inky"),
    makeGhost("clyde"),
  ];
  game.modeTimer = 0;
  game.modeIndex = 0;
  game.globalMode = "scatter";
  game.globalElapsed = 0;
  game.frightenedTime = 0;
  game.ghostChain = 0;
  game.dyingTimer = 0;
  game.fruit = null;
  game.fruitTimer = 0;
}

function startLevel() {
  buildMaze();
  resetActors();
  game.readyTimer = 2;
}

function fullReset() {
  game.score = 0;
  game.lives = 3;
  game.level = 1;
  game.extraAwarded = false;
  game.popups = [];
  game.particles = [];
  startLevel();
}

// ---------------------------------------------------------------------------
// 7. セル単位の移動（タイル中心から中心へホップ）。
// ---------------------------------------------------------------------------
function moveToward(entity, budget) {
  var dx = entity.target.x - entity.x;
  var dy = entity.target.y - entity.y;
  var dist = Math.abs(dx) + Math.abs(dy);
  if (dist <= budget) {
    entity.x = entity.target.x;
    entity.y = entity.target.y;
    return budget - dist;
  }
  entity.x += Math.sign(dx) * Math.min(budget, Math.abs(dx));
  entity.y += Math.sign(dy) * Math.min(budget, Math.abs(dy));
  return 0;
}

function wrapTunnel(entity) {
  var tile = tileOf(entity);
  if (tile.col < 0) {
    entity.x += COLS * TILE;
    entity.prev.x += COLS * TILE;
    entity.target.x += COLS * TILE;
  } else if (tile.col >= COLS) {
    entity.x -= COLS * TILE;
    entity.prev.x -= COLS * TILE;
    entity.target.x -= COLS * TILE;
  }
}

function updatePac(step) {
  var pac = game.pac;
  var atCenter = pac.x === pac.target.x && pac.y === pac.target.y;

  // タイルの途中でも即時反転を許可する。
  if ((pac.dir.x !== 0 || pac.dir.y !== 0) && sameDir(pac.want, opposite(pac.dir)) && !atCenter) {
    var swap = pac.target;
    pac.target = pac.prev;
    pac.prev = swap;
    pac.dir = pac.want;
  }
  // 中心で停止していたら、入力方向へ動き出そうとする。
  if (pac.dir.x === 0 && pac.dir.y === 0) {
    var t0 = tileOf(pac);
    if (!isWallForPac(t0.col + pac.want.x, t0.row + pac.want.y)) {
      pac.dir = pac.want;
      pac.prev = { x: pac.x, y: pac.y };
      pac.target = centerOf(t0.col + pac.dir.x, t0.row + pac.dir.y);
    }
  }

  var budget = pacSpeed() * step;
  var guard = 0;
  while (budget > 0 && guard < 6) {
    guard += 1;
    if (pac.x === pac.target.x && pac.y === pac.target.y) {
      arrivePac();
      if (pac.dir.x === 0 && pac.dir.y === 0) break;
    }
    budget = moveToward(pac, budget);
  }

  if (pac.dir.x !== 0 || pac.dir.y !== 0) {
    pac.anim += step * 10;
    pac.mouth = runtime.oscillate01(pac.anim, 1);
  } else {
    pac.mouth = 0.15;
  }
}

function arrivePac() {
  var pac = game.pac;
  wrapTunnel(pac);
  var tile = tileOf(pac);
  eatAt(tile.col, tile.row);

  var nextDir;
  if (!isWallForPac(tile.col + pac.want.x, tile.row + pac.want.y)) {
    nextDir = pac.want;
  } else if (!isWallForPac(tile.col + pac.dir.x, tile.row + pac.dir.y)) {
    nextDir = pac.dir;
  } else {
    nextDir = { x: 0, y: 0 };
  }
  pac.dir = nextDir;
  pac.prev = { x: pac.x, y: pac.y };
  if (nextDir.x === 0 && nextDir.y === 0) {
    pac.target = { x: pac.x, y: pac.y };
  } else {
    pac.target = centerOf(tile.col + nextDir.x, tile.row + nextDir.y);
  }
}

function eatAt(col, row) {
  var ch = mazeChar(col, row);
  if (ch !== "." && ch !== "o") return;
  game.maze = runtime.setTileAt(game.maze, { column: col, row: row }, " ");
  game.pelletsLeft -= 1;
  if (ch === ".") {
    addScore(10);
    sfx("pellet");
  } else {
    addScore(50);
    sfx("power");
    triggerFrightened();
  }
  maybeSpawnFruit();
}

// ---------------------------------------------------------------------------
// 8. ゴースト: モード、ターゲット、クラシックな AI。
// ---------------------------------------------------------------------------
function triggerFrightened() {
  game.frightenedTime = frightenedDuration();
  game.ghostChain = 0;
  game.ghosts.forEach(function (ghost) {
    var s = ghost.machine.getState();
    if (s === "scatter" || s === "chase") {
      ghost.machine.transition("frightened");
      reverseGhost(ghost);
    }
  });
}

function reverseGhost(ghost) {
  var swap = ghost.target;
  ghost.target = ghost.prev;
  ghost.prev = swap;
  ghost.dir = opposite(ghost.dir);
}

function ghostTarget(ghost) {
  var pac = game.pac;
  var pt = tileOf(pac);
  var state = ghost.machine.getState();
  if (state === "scatter" || state === "frightened") return SCATTER[ghost.name];
  if (state === "eaten") return EXIT_TILE;
  var dir = pac.dir;
  if (ghost.name === "blinky") {
    return { col: pt.col, row: pt.row };
  }
  if (ghost.name === "pinky") {
    var pc = pt.col + dir.x * 4;
    var pr = pt.row + dir.y * 4;
    if (dir.y === -1) pc -= 4;
    return { col: pc, row: pr };
  }
  if (ghost.name === "inky") {
    var bx = tileOf(game.ghosts[0]);
    var px = pt.col + dir.x * 2;
    var py = pt.row + dir.y * 2;
    if (dir.y === -1) px -= 2;
    return { col: px * 2 - bx.col, row: py * 2 - bx.row };
  }
  var dc = tileOf(ghost);
  var d = Math.hypot(dc.col - pt.col, dc.row - pt.row);
  return d > 8 ? { col: pt.col, row: pt.row } : SCATTER.clyde;
}

function updateGhost(ghost, step) {
  var state = ghost.machine.getState();

  if (state === "house") {
    houseBob(ghost, step);
    if (game.readyTimer <= 0 && game.frightenedTime <= 0 && game.globalElapsed >= ghost.releaseAt) {
      ghost.machine.transition("leaving");
    }
    return;
  }
  if (state === "leaving") {
    leaveHouse(ghost, step);
    return;
  }
  if (state === "eaten") {
    returnHome(ghost, step);
    return;
  }

  var speed = state === "frightened" ? ghostSpeed() * 0.55 : ghostSpeed();
  var budget = speed * step;
  var guard = 0;
  while (budget > 0 && guard < 6) {
    guard += 1;
    if (ghost.x === ghost.target.x && ghost.y === ghost.target.y) {
      arriveGhost(ghost);
    }
    budget = moveToward(ghost, budget);
  }
}

function houseBob(ghost, step) {
  ghost.bob += step * 3;
  var base = centerOf(GHOST_SPAWN[ghost.name].col, GHOST_SPAWN[ghost.name].row);
  ghost.x = base.x;
  ghost.y = base.y + Math.sin(ghost.bob) * 4;
}

function leaveHouse(ghost, step) {
  ghost.pass = true;
  var door = centerOf(DOOR_TILE.col, DOOR_TILE.row);
  var exit = centerOf(EXIT_TILE.col, EXIT_TILE.row);
  var budget = ghostSpeed() * step;
  if (Math.abs(ghost.x - door.x) > 1) {
    ghost.x += Math.sign(door.x - ghost.x) * Math.min(budget, Math.abs(door.x - ghost.x));
  } else {
    ghost.x = door.x;
    ghost.y += Math.sign(exit.y - ghost.y) * Math.min(budget, Math.abs(exit.y - ghost.y));
  }
  if (Math.abs(ghost.x - exit.x) < 1 && Math.abs(ghost.y - exit.y) < 1) {
    ghost.pass = false;
    ghost.x = exit.x;
    ghost.y = exit.y;
    ghost.dir = LEFT;
    ghost.prev = { x: exit.x, y: exit.y };
    ghost.target = { x: exit.x, y: exit.y };
    ghost.machine.transition(game.globalMode === "chase" ? "chase" : "scatter");
  }
}

function returnHome(ghost, step) {
  ghost.pass = true;
  var budget = ghostSpeed() * 1.9 * step;
  var guard = 0;
  while (budget > 0 && guard < 8) {
    guard += 1;
    if (ghost.x === ghost.target.x && ghost.y === ghost.target.y) {
      arriveGhost(ghost);
      if (ghost.machine.getState() === "house") break;
    }
    budget = moveToward(ghost, budget);
  }
}

function arriveGhost(ghost) {
  wrapTunnel(ghost);
  var tile = tileOf(ghost);

  if (ghost.machine.getState() === "eaten" && tile.col === EXIT_TILE.col && tile.row === EXIT_TILE.row) {
    var home = centerOf(HOUSE_CENTER.col, HOUSE_CENTER.row);
    ghost.x = home.x;
    ghost.y = home.y;
    ghost.prev = { x: home.x, y: home.y };
    ghost.target = { x: home.x, y: home.y };
    ghost.pass = false;
    ghost.bob = 0;
    ghost.machine.transition("house");
    return;
  }

  var target = ghostTarget(ghost);
  var back = opposite(ghost.dir);
  var options = DIRS.filter(function (dir) {
    if (sameDir(dir, back)) return false;
    return !isWallForGhost(tile.col + dir.x, tile.row + dir.y, ghost);
  });
  if (options.length === 0) options = [back];

  var chosen;
  if (ghost.machine.getState() === "frightened") {
    chosen = options[Math.floor(Math.random() * options.length)];
  } else {
    var best = Infinity;
    chosen = options[0];
    var goal = centerOf(target.col, target.row);
    options.forEach(function (dir) {
      var c = centerOf(tile.col + dir.x, tile.row + dir.y);
      var d = (c.x - goal.x) * (c.x - goal.x) + (c.y - goal.y) * (c.y - goal.y);
      if (d < best) {
        best = d;
        chosen = dir;
      }
    });
  }
  ghost.dir = chosen;
  ghost.prev = { x: ghost.x, y: ghost.y };
  ghost.target = centerOf(tile.col + chosen.x, tile.row + chosen.y);
}

// ---------------------------------------------------------------------------
// 9. 衝突、スコア、死亡、フルーツ、フィードバック。
// ---------------------------------------------------------------------------
function addScore(points) {
  game.score += points;
  if (game.score > game.high) game.high = game.score;
  if (!game.extraAwarded && game.score >= 10000) {
    game.extraAwarded = true;
    game.lives += 1;
  }
}

function addPopup(text, x, y) {
  game.popups.push({ text: text, x: x, y: y, life: 1 });
}

function spawnBurst(x, y) {
  var burst = runtime.createParticleBurst({ x: x, y: y }, 12, {
    speed: 90,
    speedJitter: 40,
    life: 0.6,
    size: 3,
  });
  game.particles = game.particles.concat(burst);
}

function maybeSpawnFruit() {
  var eaten = TOTAL_PELLETS - game.pelletsLeft;
  if (game.fruit === null && (eaten === 70 || eaten === 170)) {
    var pos = centerOf(HOUSE_CENTER.col, HOUSE_CENTER.row + 3);
    game.fruit = { x: pos.x, y: pos.y, points: 100 + (game.level - 1) * 100 };
    game.fruitTimer = 9;
  }
}

function handleCollisions() {
  var pac = game.pac;
  if (game.fruit !== null && Math.hypot(pac.x - game.fruit.x, pac.y - game.fruit.y) < TILE * 0.7) {
    addScore(game.fruit.points);
    addPopup(String(game.fruit.points), game.fruit.x, game.fruit.y);
    spawnBurst(game.fruit.x, game.fruit.y);
    game.fruit = null;
  }
  for (var i = 0; i < game.ghosts.length; i += 1) {
    var ghost = game.ghosts[i];
    var state = ghost.machine.getState();
    if (state === "eaten" || state === "house" || state === "leaving") continue;
    if (Math.hypot(pac.x - ghost.x, pac.y - ghost.y) < TILE * 0.7) {
      if (state === "frightened") {
        game.ghostChain += 1;
        var points = 200 * Math.pow(2, game.ghostChain - 1);
        addScore(points);
        addPopup(String(points), ghost.x, ghost.y);
        spawnBurst(ghost.x, ghost.y);
        ghost.machine.transition("eaten");
        sfx("ghost");
      } else {
        killPac();
        return;
      }
    }
  }
}

function killPac() {
  game.dyingTimer = 1.1;
  stopSiren();
  sfx("death");
}

function finishDeath() {
  game.lives -= 1;
  if (game.lives < 0) {
    manager.transition("gameover");
  } else {
    resetActors();
    game.readyTimer = 1.5;
    manager.transition("ready");
  }
}

function updateFeedback(step) {
  game.popups = game.popups.filter(function (p) {
    p.y -= step * 24;
    p.life -= step * 1.2;
    return p.life > 0;
  });
  game.particles = runtime.stepParticles(game.particles, step);
  if (game.fruit !== null) {
    game.fruitTimer -= step;
    if (game.fruitTimer <= 0) game.fruit = null;
  }
}

// ---------------------------------------------------------------------------
// 10. メインのゲームプレイ更新。
// ---------------------------------------------------------------------------
function updatePlay(step) {
  game.blink += step;

  if (game.dyingTimer > 0) {
    game.dyingTimer -= step;
    updateFeedback(step);
    if (game.dyingTimer <= 0) finishDeath();
    return;
  }

  startSiren();
  game.globalElapsed += step;

  if (game.frightenedTime > 0) {
    game.frightenedTime -= step;
    if (game.frightenedTime <= 0) {
      game.ghosts.forEach(function (ghost) {
        if (ghost.machine.getState() === "frightened") {
          ghost.machine.transition(game.globalMode === "chase" ? "chase" : "scatter");
        }
      });
    }
  } else {
    var slot = MODE_SCHEDULE[game.modeIndex];
    game.modeTimer += step;
    if (game.modeTimer >= slot.dur && game.modeIndex < MODE_SCHEDULE.length - 1) {
      game.modeIndex += 1;
      game.modeTimer = 0;
      game.globalMode = MODE_SCHEDULE[game.modeIndex].mode;
      game.ghosts.forEach(function (ghost) {
        var s = ghost.machine.getState();
        if (s === "scatter" || s === "chase") {
          ghost.machine.transition(game.globalMode);
          reverseGhost(ghost);
        }
      });
    }
  }

  updatePac(step);
  game.ghosts.forEach(function (ghost) {
    updateGhost(ghost, step);
  });
  handleCollisions();
  updateFeedback(step);

  if (game.pelletsLeft <= 0) {
    game.level += 1;
    stopSiren();
    startLevel();
    manager.transition("ready");
  }
}

// ---------------------------------------------------------------------------
// 11. 描画。
// ---------------------------------------------------------------------------
function drawMaze() {
  runtime.drawTileMap(game.maze, WALL_TILESET, {
    grid: grid,
    tileSize: TILE,
    origin: ORIGIN,
  });
  for (var r = 0; r < ROWS; r += 1) {
    for (var c = 0; c < COLS; c += 1) {
      var ch = game.maze[r].charAt(c);
      if (ch !== "." && ch !== "o") continue;
      var b = runtime.tileToBounds({ column: c, row: r }, { tileSize: TILE, origin: ORIGIN });
      var cx = b.x + b.width / 2;
      var cy = b.y + b.height / 2;
      ctx.fillStyle = "#ffd7a8";
      ctx.beginPath();
      if (ch === ".") {
        ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
      } else {
        var pulse = 3 + runtime.oscillate01(game.blink, 3) * 2;
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }
}

function drawFruit() {
  if (game.fruit === null) return;
  grid.drawCompiledPixelSprite(cherry, {
    x: game.fruit.x - TILE / 2,
    y: game.fruit.y - TILE / 2,
    pixelSize: 2,
  });
}

function drawPac() {
  var pac = game.pac;
  var dir = 0;
  if (sameDir(pac.dir, DOWN)) dir = Math.PI / 2;
  else if (sameDir(pac.dir, LEFT)) dir = Math.PI;
  else if (sameDir(pac.dir, UP)) dir = -Math.PI / 2;

  var mouth = pac.mouth;
  if (game.dyingTimer > 0) {
    mouth = Math.min(1, (1 - game.dyingTimer / 1.1) * 1.4);
  }
  grid.drawPacman(pac.x, pac.y, TILE * 0.62, mouth, {
    direction: dir,
    fillColor: "#ffe600",
    strokeColor: "#000000",
  });
}

function drawGhosts() {
  game.ghosts.forEach(function (ghost) {
    var state = ghost.machine.getState();
    if (state === "eaten") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ghost.x - 3, ghost.y - 2, 2.4, 0, Math.PI * 2);
      ctx.arc(ghost.x + 3, ghost.y - 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    var fill = ghost.color;
    var eye = "#ffffff";
    var pupil = "#1414c8";
    if (state === "frightened") {
      var flashing = game.frightenedTime < 2 && Math.floor(game.blink * 6) % 2 === 0;
      fill = flashing ? "#ffffff" : "#2121ff";
      pupil = "#ff0000";
    }
    grid.drawGhost({ x: ghost.x, y: ghost.y }, TILE * 0.62, {
      fillColor: fill,
      eyeColor: eye,
      pupilColor: pupil,
    });
  });
}

function drawPopups() {
  ctx.textAlign = "center";
  ctx.font = "10px 'Geist Pixel', monospace";
  game.popups.forEach(function (p) {
    ctx.fillStyle = "rgba(255,255,255," + Math.max(0, p.life) + ")";
    ctx.fillText(p.text, p.x, p.y);
  });
  ctx.textAlign = "start";
  ctx.fillStyle = "#ffd7a8";
  game.particles.forEach(function (particle) {
    ctx.globalAlpha = Math.max(0, particle.life / (particle.maxLife || 1));
    var s = particle.size || 2;
    ctx.fillRect(particle.x - s / 2, particle.y - s / 2, s, s);
  });
  ctx.globalAlpha = 1;
}

function drawHud() {
  grid.drawValueLabel("1UP", game.score, 12, 20, {
    color: "#ffffff",
    font: "14px 'Geist Pixel', monospace",
  });
  grid.drawValueLabel("HIGH", game.high, WIDTH - 168, 20, {
    color: "#ffd7a8",
    font: "14px 'Geist Pixel', monospace",
  });
  grid.drawValueLabel("LV", game.level, WIDTH - 56, 20, {
    color: "#00d43b",
    font: "14px 'Geist Pixel', monospace",
  });
  for (var i = 0; i < game.lives; i += 1) {
    grid.drawCompiledPixelSprite(lifeIcon, {
      x: 12 + i * 26,
      y: HEIGHT - HUD_BOTTOM + 6,
      pixelSize: 4,
    });
  }
  if (game.frightenedTime > 0) {
    grid.drawBarIndicator("PWR", WIDTH - 150, HEIGHT - HUD_BOTTOM + 8, 100, 12, game.frightenedTime, frightenedDuration(), {
      fillColor: "#2121ff",
      textColor: "#ffffff",
    });
  }
}

function renderScene() {
  grid.clearCanvas();
  drawMaze();
  drawFruit();
  drawGhosts();
  drawPac();
  drawPopups();
  drawHud();
}

// 初期状態: メニューはタイトルの背後に盤面を表示する。
startLevel();

// ---------------------------------------------------------------------------
// 12. シーン（menu / ready / play / paused / gameover）。
// ---------------------------------------------------------------------------
var manager = runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu: {
      draw: function () {
        grid.clearCanvas();
        drawMaze();
        grid.drawMessage("PAC-MAN", "エンターでスタート", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ffe600",
          subColor: "#ffffff",
          mainFont: "34px 'Geist Pixel', monospace",
          subFont: "14px 'Geist Pixel', monospace",
        });
      },
    },
    ready: {
      update: function (step) {
        game.readyTimer -= step;
        if (game.readyTimer <= 0) manager.transition("play");
      },
      draw: function () {
        renderScene();
        grid.drawMessage("", "READY!", { x: WIDTH / 2, y: HEIGHT / 2 + 22 }, {
          color: "#ffe600",
          subColor: "#ffe600",
          subFont: "16px 'Geist Pixel', monospace",
        });
      },
    },
    play: {
      update: function (step) {
        updatePlay(step);
      },
      draw: function () {
        renderScene();
      },
      exit: function () {
        stopSiren();
      },
    },
    paused: {
      draw: function () {
        renderScene();
        grid.drawMessage("ポーズ", "Pキーで再開", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ffffff",
          subColor: "#ffd7a8",
          mainFont: "26px 'Geist Pixel', monospace",
          subFont: "13px 'Geist Pixel', monospace",
        });
      },
    },
    gameover: {
      enter: function () {
        stopSiren();
      },
      draw: function () {
        renderScene();
        grid.drawMessage("GAME OVER", "エンターでリスタート", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ff0000",
          subColor: "#ffffff",
          mainFont: "28px 'Geist Pixel', monospace",
          subFont: "13px 'Geist Pixel', monospace",
        });
      },
    },
  },
});

// ---------------------------------------------------------------------------
// 13. 入力 + 決定論的な固定ステップループ。
// ---------------------------------------------------------------------------
var keys = runtime.createKeyTracker(canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "],
});
var pausePressed = false;
var actionPressed = false;

function readInput() {
  var scene = manager.getSceneId();
  var pac = game.pac;
  if (pac !== null) {
    if (keys.isPressed("ArrowLeft") || keys.isPressed("a")) pac.want = LEFT;
    else if (keys.isPressed("ArrowRight") || keys.isPressed("d")) pac.want = RIGHT;
    else if (keys.isPressed("ArrowUp") || keys.isPressed("w")) pac.want = UP;
    else if (keys.isPressed("ArrowDown") || keys.isPressed("s")) pac.want = DOWN;
  }

  var action = keys.isPressed("Enter") || keys.isPressed(" ");
  if (action && !actionPressed) {
    if (audio !== null) audio.resume();
    if (scene === "menu") {
      fullReset();
      manager.transition("ready");
    } else if (scene === "gameover") {
      fullReset();
      manager.transition("menu");
    }
  }
  actionPressed = action;

  var pause = keys.isPressed("p") || keys.isPressed("P");
  if (pause && !pausePressed) {
    if (scene === "play") manager.transition("paused");
    else if (scene === "paused") manager.transition("play");
  }
  pausePressed = pause;
}

var loop = runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  maxUpdatesPerFrame: 5,
  update: function (step) {
    readInput();
    manager.update(step);
  },
  draw: function () {
    manager.draw(ctx);
  },
});`;

const PACMAN_GAME_JS_ES = `// Pac-Man - tributo fiel construido con grid-canvas-system.
// En el Playground ya existen GridCanvasSystem, createArcadeAudio, canvas y root.
"use strict";

var runtime = GridCanvasSystem.runtime;

// ---------------------------------------------------------------------------
// 1. Laberinto. '#' pared, '.' punto, 'o' energizante, ' ' vacio, '-' puerta.
// ---------------------------------------------------------------------------
var RAW_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##### ## #####.#     ",
  "     #.##          ##.#     ",
  "     #.## ###--### ##.#     ",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "     #.## ######## ##.#     ",
  "     #.##          ##.#     ",
  "     #.## ######## ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......##.......##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

var COLS = RAW_MAZE[0].length;
var ROWS = RAW_MAZE.length;
var TILE = 16;
var HUD_TOP = 48;
var HUD_BOTTOM = 32;
var ORIGIN = { x: 0, y: HUD_TOP };
var TUNNEL_ROW = 14;

var WIDTH = COLS * TILE;
var HEIGHT = HUD_TOP + ROWS * TILE + HUD_BOTTOM;

var PAC_SPAWN = { col: 13, row: 26 };
var DOOR_TILE = { col: 13, row: 12 };
var EXIT_TILE = { col: 13, row: 11 };
var HOUSE_CENTER = { col: 13, row: 14 };
var GHOST_SPAWN = {
  blinky: { col: 13, row: 11 },
  pinky: { col: 13, row: 14 },
  inky: { col: 11, row: 14 },
  clyde: { col: 16, row: 14 },
};
var SCATTER = {
  blinky: { col: COLS - 3, row: 0 },
  pinky: { col: 2, row: 0 },
  inky: { col: COLS - 1, row: ROWS - 1 },
  clyde: { col: 0, row: ROWS - 1 },
};
var GHOST_COLORS = {
  blinky: "#ff0000",
  pinky: "#ffb8ff",
  inky: "#00ffff",
  clyde: "#ffb852",
};

var UP = { x: 0, y: -1 };
var DOWN = { x: 0, y: 1 };
var LEFT = { x: -1, y: 0 };
var RIGHT = { x: 1, y: 0 };
var DIRS = [UP, LEFT, DOWN, RIGHT];

// ---------------------------------------------------------------------------
// 2. Canvas + assets pixel art compilados una sola vez.
// ---------------------------------------------------------------------------
var grid = new GridCanvasSystem("canvas", {
  width: WIDTH,
  height: HEIGHT,
  cellSize: TILE,
  majorStep: TILE * 100,
  backgroundColor: "#000000",
  gridColor: "transparent",
  gridLabelColor: "transparent",
});
var ctx = grid.ctx;

var fruitPalette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#ff0000",
  "2": "#00d43b",
  "3": "#ffffff",
});
var cherry = GridCanvasSystem.compilePixelSprite(
  [
    "00000020",
    "00000200",
    "00003200",
    "00113110",
    "01111110",
    "11311131",
    "11111111",
    "01111110",
  ],
  fruitPalette,
);
var lifeIconPalette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#ffe600",
});
var lifeIcon = GridCanvasSystem.compilePixelSprite(
  ["01110", "11100", "11000", "11100", "01110"],
  lifeIconPalette,
);

var WALL_TILESET = { "#": "#1414c8", "-": "#ff9cc8" };

// ---------------------------------------------------------------------------
// 3. Audio arcade opcional (nativo del navegador).
// ---------------------------------------------------------------------------
var audio = null;
try {
  audio = createArcadeAudio({ masterVolume: 0.4 });
} catch (error) {
  audio = null;
}
var sirenId = null;
function sfx(name) {
  if (audio === null) return;
  if (name === "pellet") audio.playPickup({ volume: 0.25 });
  else if (name === "power") audio.playShoot();
  else if (name === "ghost") audio.playPreset("pickup", { volume: 0.6 });
  else if (name === "death") audio.playExplosion();
}
function startSiren() {
  if (audio === null || sirenId !== null) return;
  audio.playLoop("danger", { volume: 0.15 }).then(function (id) {
    sirenId = id;
  });
}
function stopSiren() {
  if (audio === null || sirenId === null) return;
  audio.stopLoop(sirenId);
  sirenId = null;
}

// ---------------------------------------------------------------------------
// 4. Helpers de celda / pixel.
// ---------------------------------------------------------------------------
function centerOf(col, row) {
  return {
    x: ORIGIN.x + col * TILE + TILE / 2,
    y: ORIGIN.y + row * TILE + TILE / 2,
  };
}
function tileOf(entity) {
  return {
    col: Math.round((entity.x - ORIGIN.x - TILE / 2) / TILE),
    row: Math.round((entity.y - ORIGIN.y - TILE / 2) / TILE),
  };
}
function mazeChar(col, row) {
  if (row < 0 || row >= ROWS) return "#";
  if (col < 0 || col >= COLS) {
    return row === TUNNEL_ROW ? " " : "#";
  }
  return game.maze[row].charAt(col);
}
function isWallForPac(col, row) {
  var c = mazeChar(col, row);
  return c === "#" || c === "-";
}
function isWallForGhost(col, row, ghost) {
  var c = mazeChar(col, row);
  if (c === "#") return true;
  if (c === "-") return ghost.pass !== true;
  return false;
}
function opposite(dir) {
  return { x: -dir.x, y: -dir.y };
}
function sameDir(a, b) {
  return a.x === b.x && a.y === b.y;
}

// ---------------------------------------------------------------------------
// 5. Estado global.
// ---------------------------------------------------------------------------
var game = {
  maze: [],
  pelletsLeft: 0,
  score: 0,
  high: 0,
  lives: 3,
  level: 1,
  extraAwarded: false,
  pac: null,
  ghosts: [],
  modeTimer: 0,
  modeIndex: 0,
  globalMode: "scatter",
  globalElapsed: 0,
  frightenedTime: 0,
  ghostChain: 0,
  readyTimer: 0,
  dyingTimer: 0,
  popups: [],
  particles: [],
  fruit: null,
  fruitTimer: 0,
  blink: 0,
};

var MODE_SCHEDULE = [
  { mode: "scatter", dur: 7 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 7 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 },
  { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 },
  { mode: "chase", dur: Infinity },
];

function frightenedDuration() {
  return Math.max(1.5, 7 - (game.level - 1) * 0.5);
}
function pacSpeed() {
  return 76 + (game.level - 1) * 4;
}
function ghostSpeed() {
  return 72 + (game.level - 1) * 4;
}

var TOTAL_PELLETS = (function () {
  var total = 0;
  for (var r = 0; r < ROWS; r += 1) {
    for (var c = 0; c < COLS; c += 1) {
      var ch = RAW_MAZE[r].charAt(c);
      if (ch === "." || ch === "o") total += 1;
    }
  }
  return total;
})();

// ---------------------------------------------------------------------------
// 6. Construccion / reinicio.
// ---------------------------------------------------------------------------
function buildMaze() {
  game.maze = RAW_MAZE.slice();
  game.pelletsLeft = TOTAL_PELLETS;
  // Pac arranca sobre una celda vacia: nunca "llega" a su tile inicial, asi que
  // un punto ahi jamas se comeria y el nivel no podria completarse.
  var ch = game.maze[PAC_SPAWN.row].charAt(PAC_SPAWN.col);
  if (ch === "." || ch === "o") {
    game.maze = runtime.setTileAt(game.maze, { column: PAC_SPAWN.col, row: PAC_SPAWN.row }, " ");
    game.pelletsLeft -= 1;
  }
}

function makeGhost(name) {
  var spawn = GHOST_SPAWN[name];
  var pos = centerOf(spawn.col, spawn.row);
  var machine = runtime.createStateMachine({
    initial: "house",
    transitions: {
      house: ["leaving", "frightened"],
      leaving: ["scatter", "chase"],
      scatter: ["chase", "frightened", "eaten"],
      chase: ["scatter", "frightened", "eaten"],
      frightened: ["scatter", "chase", "eaten"],
      eaten: ["house"],
    },
  });
  return {
    name: name,
    x: pos.x,
    y: pos.y,
    dir: name === "blinky" ? LEFT : UP,
    prev: { x: pos.x, y: pos.y },
    target: { x: pos.x, y: pos.y },
    machine: machine,
    color: GHOST_COLORS[name],
    pass: false,
    releaseAt: name === "blinky" ? 0 : name === "pinky" ? 1.5 : name === "inky" ? 5 : 9,
    bob: 0,
  };
}

function resetActors() {
  var start = centerOf(PAC_SPAWN.col, PAC_SPAWN.row);
  game.pac = {
    x: start.x,
    y: start.y,
    dir: LEFT,
    want: LEFT,
    prev: { x: start.x, y: start.y },
    target: { x: start.x, y: start.y },
    mouth: 0,
    anim: 0,
  };
  game.ghosts = [
    makeGhost("blinky"),
    makeGhost("pinky"),
    makeGhost("inky"),
    makeGhost("clyde"),
  ];
  game.modeTimer = 0;
  game.modeIndex = 0;
  game.globalMode = "scatter";
  game.globalElapsed = 0;
  game.frightenedTime = 0;
  game.ghostChain = 0;
  game.dyingTimer = 0;
  game.fruit = null;
  game.fruitTimer = 0;
}

function startLevel() {
  buildMaze();
  resetActors();
  game.readyTimer = 2;
}

function fullReset() {
  game.score = 0;
  game.lives = 3;
  game.level = 1;
  game.extraAwarded = false;
  game.popups = [];
  game.particles = [];
  startLevel();
}

// ---------------------------------------------------------------------------
// 7. Movimiento por celdas (hop entre centros de tile).
// ---------------------------------------------------------------------------
function moveToward(entity, budget) {
  var dx = entity.target.x - entity.x;
  var dy = entity.target.y - entity.y;
  var dist = Math.abs(dx) + Math.abs(dy);
  if (dist <= budget) {
    entity.x = entity.target.x;
    entity.y = entity.target.y;
    return budget - dist;
  }
  entity.x += Math.sign(dx) * Math.min(budget, Math.abs(dx));
  entity.y += Math.sign(dy) * Math.min(budget, Math.abs(dy));
  return 0;
}

function wrapTunnel(entity) {
  var tile = tileOf(entity);
  if (tile.col < 0) {
    entity.x += COLS * TILE;
    entity.prev.x += COLS * TILE;
    entity.target.x += COLS * TILE;
  } else if (tile.col >= COLS) {
    entity.x -= COLS * TILE;
    entity.prev.x -= COLS * TILE;
    entity.target.x -= COLS * TILE;
  }
}

function updatePac(step) {
  var pac = game.pac;
  var atCenter = pac.x === pac.target.x && pac.y === pac.target.y;

  // Reversa instantanea permitida a mitad de tile.
  if ((pac.dir.x !== 0 || pac.dir.y !== 0) && sameDir(pac.want, opposite(pac.dir)) && !atCenter) {
    var swap = pac.target;
    pac.target = pac.prev;
    pac.prev = swap;
    pac.dir = pac.want;
  }
  // Si esta detenido en un centro, intenta arrancar hacia el input.
  if (pac.dir.x === 0 && pac.dir.y === 0) {
    var t0 = tileOf(pac);
    if (!isWallForPac(t0.col + pac.want.x, t0.row + pac.want.y)) {
      pac.dir = pac.want;
      pac.prev = { x: pac.x, y: pac.y };
      pac.target = centerOf(t0.col + pac.dir.x, t0.row + pac.dir.y);
    }
  }

  var budget = pacSpeed() * step;
  var guard = 0;
  while (budget > 0 && guard < 6) {
    guard += 1;
    if (pac.x === pac.target.x && pac.y === pac.target.y) {
      arrivePac();
      if (pac.dir.x === 0 && pac.dir.y === 0) break;
    }
    budget = moveToward(pac, budget);
  }

  if (pac.dir.x !== 0 || pac.dir.y !== 0) {
    pac.anim += step * 10;
    pac.mouth = runtime.oscillate01(pac.anim, 1);
  } else {
    pac.mouth = 0.15;
  }
}

function arrivePac() {
  var pac = game.pac;
  wrapTunnel(pac);
  var tile = tileOf(pac);
  eatAt(tile.col, tile.row);

  var nextDir;
  if (!isWallForPac(tile.col + pac.want.x, tile.row + pac.want.y)) {
    nextDir = pac.want;
  } else if (!isWallForPac(tile.col + pac.dir.x, tile.row + pac.dir.y)) {
    nextDir = pac.dir;
  } else {
    nextDir = { x: 0, y: 0 };
  }
  pac.dir = nextDir;
  pac.prev = { x: pac.x, y: pac.y };
  if (nextDir.x === 0 && nextDir.y === 0) {
    pac.target = { x: pac.x, y: pac.y };
  } else {
    pac.target = centerOf(tile.col + nextDir.x, tile.row + nextDir.y);
  }
}

function eatAt(col, row) {
  var ch = mazeChar(col, row);
  if (ch !== "." && ch !== "o") return;
  game.maze = runtime.setTileAt(game.maze, { column: col, row: row }, " ");
  game.pelletsLeft -= 1;
  if (ch === ".") {
    addScore(10);
    sfx("pellet");
  } else {
    addScore(50);
    sfx("power");
    triggerFrightened();
  }
  maybeSpawnFruit();
}

// ---------------------------------------------------------------------------
// 8. Fantasmas: modos, objetivos e IA clasica.
// ---------------------------------------------------------------------------
function triggerFrightened() {
  game.frightenedTime = frightenedDuration();
  game.ghostChain = 0;
  game.ghosts.forEach(function (ghost) {
    var s = ghost.machine.getState();
    if (s === "scatter" || s === "chase") {
      ghost.machine.transition("frightened");
      reverseGhost(ghost);
    }
  });
}

function reverseGhost(ghost) {
  var swap = ghost.target;
  ghost.target = ghost.prev;
  ghost.prev = swap;
  ghost.dir = opposite(ghost.dir);
}

function ghostTarget(ghost) {
  var pac = game.pac;
  var pt = tileOf(pac);
  var state = ghost.machine.getState();
  if (state === "scatter" || state === "frightened") return SCATTER[ghost.name];
  if (state === "eaten") return EXIT_TILE;
  var dir = pac.dir;
  if (ghost.name === "blinky") {
    return { col: pt.col, row: pt.row };
  }
  if (ghost.name === "pinky") {
    var pc = pt.col + dir.x * 4;
    var pr = pt.row + dir.y * 4;
    if (dir.y === -1) pc -= 4;
    return { col: pc, row: pr };
  }
  if (ghost.name === "inky") {
    var bx = tileOf(game.ghosts[0]);
    var px = pt.col + dir.x * 2;
    var py = pt.row + dir.y * 2;
    if (dir.y === -1) px -= 2;
    return { col: px * 2 - bx.col, row: py * 2 - bx.row };
  }
  var dc = tileOf(ghost);
  var d = Math.hypot(dc.col - pt.col, dc.row - pt.row);
  return d > 8 ? { col: pt.col, row: pt.row } : SCATTER.clyde;
}

function updateGhost(ghost, step) {
  var state = ghost.machine.getState();

  if (state === "house") {
    houseBob(ghost, step);
    if (game.readyTimer <= 0 && game.frightenedTime <= 0 && game.globalElapsed >= ghost.releaseAt) {
      ghost.machine.transition("leaving");
    }
    return;
  }
  if (state === "leaving") {
    leaveHouse(ghost, step);
    return;
  }
  if (state === "eaten") {
    returnHome(ghost, step);
    return;
  }

  var speed = state === "frightened" ? ghostSpeed() * 0.55 : ghostSpeed();
  var budget = speed * step;
  var guard = 0;
  while (budget > 0 && guard < 6) {
    guard += 1;
    if (ghost.x === ghost.target.x && ghost.y === ghost.target.y) {
      arriveGhost(ghost);
    }
    budget = moveToward(ghost, budget);
  }
}

function houseBob(ghost, step) {
  ghost.bob += step * 3;
  var base = centerOf(GHOST_SPAWN[ghost.name].col, GHOST_SPAWN[ghost.name].row);
  ghost.x = base.x;
  ghost.y = base.y + Math.sin(ghost.bob) * 4;
}

function leaveHouse(ghost, step) {
  ghost.pass = true;
  var door = centerOf(DOOR_TILE.col, DOOR_TILE.row);
  var exit = centerOf(EXIT_TILE.col, EXIT_TILE.row);
  var budget = ghostSpeed() * step;
  if (Math.abs(ghost.x - door.x) > 1) {
    ghost.x += Math.sign(door.x - ghost.x) * Math.min(budget, Math.abs(door.x - ghost.x));
  } else {
    ghost.x = door.x;
    ghost.y += Math.sign(exit.y - ghost.y) * Math.min(budget, Math.abs(exit.y - ghost.y));
  }
  if (Math.abs(ghost.x - exit.x) < 1 && Math.abs(ghost.y - exit.y) < 1) {
    ghost.pass = false;
    ghost.x = exit.x;
    ghost.y = exit.y;
    ghost.dir = LEFT;
    ghost.prev = { x: exit.x, y: exit.y };
    ghost.target = { x: exit.x, y: exit.y };
    ghost.machine.transition(game.globalMode === "chase" ? "chase" : "scatter");
  }
}

function returnHome(ghost, step) {
  ghost.pass = true;
  var budget = ghostSpeed() * 1.9 * step;
  var guard = 0;
  while (budget > 0 && guard < 8) {
    guard += 1;
    if (ghost.x === ghost.target.x && ghost.y === ghost.target.y) {
      arriveGhost(ghost);
      if (ghost.machine.getState() === "house") break;
    }
    budget = moveToward(ghost, budget);
  }
}

function arriveGhost(ghost) {
  wrapTunnel(ghost);
  var tile = tileOf(ghost);

  if (ghost.machine.getState() === "eaten" && tile.col === EXIT_TILE.col && tile.row === EXIT_TILE.row) {
    var home = centerOf(HOUSE_CENTER.col, HOUSE_CENTER.row);
    ghost.x = home.x;
    ghost.y = home.y;
    ghost.prev = { x: home.x, y: home.y };
    ghost.target = { x: home.x, y: home.y };
    ghost.pass = false;
    ghost.bob = 0;
    ghost.machine.transition("house");
    return;
  }

  var target = ghostTarget(ghost);
  var back = opposite(ghost.dir);
  var options = DIRS.filter(function (dir) {
    if (sameDir(dir, back)) return false;
    return !isWallForGhost(tile.col + dir.x, tile.row + dir.y, ghost);
  });
  if (options.length === 0) options = [back];

  var chosen;
  if (ghost.machine.getState() === "frightened") {
    chosen = options[Math.floor(Math.random() * options.length)];
  } else {
    var best = Infinity;
    chosen = options[0];
    var goal = centerOf(target.col, target.row);
    options.forEach(function (dir) {
      var c = centerOf(tile.col + dir.x, tile.row + dir.y);
      var d = (c.x - goal.x) * (c.x - goal.x) + (c.y - goal.y) * (c.y - goal.y);
      if (d < best) {
        best = d;
        chosen = dir;
      }
    });
  }
  ghost.dir = chosen;
  ghost.prev = { x: ghost.x, y: ghost.y };
  ghost.target = centerOf(tile.col + chosen.x, tile.row + chosen.y);
}

// ---------------------------------------------------------------------------
// 9. Colisiones, score, muerte, fruta y feedback.
// ---------------------------------------------------------------------------
function addScore(points) {
  game.score += points;
  if (game.score > game.high) game.high = game.score;
  if (!game.extraAwarded && game.score >= 10000) {
    game.extraAwarded = true;
    game.lives += 1;
  }
}

function addPopup(text, x, y) {
  game.popups.push({ text: text, x: x, y: y, life: 1 });
}

function spawnBurst(x, y) {
  var burst = runtime.createParticleBurst({ x: x, y: y }, 12, {
    speed: 90,
    speedJitter: 40,
    life: 0.6,
    size: 3,
  });
  game.particles = game.particles.concat(burst);
}

function maybeSpawnFruit() {
  var eaten = TOTAL_PELLETS - game.pelletsLeft;
  if (game.fruit === null && (eaten === 70 || eaten === 170)) {
    var pos = centerOf(HOUSE_CENTER.col, HOUSE_CENTER.row + 3);
    game.fruit = { x: pos.x, y: pos.y, points: 100 + (game.level - 1) * 100 };
    game.fruitTimer = 9;
  }
}

function handleCollisions() {
  var pac = game.pac;
  if (game.fruit !== null && Math.hypot(pac.x - game.fruit.x, pac.y - game.fruit.y) < TILE * 0.7) {
    addScore(game.fruit.points);
    addPopup(String(game.fruit.points), game.fruit.x, game.fruit.y);
    spawnBurst(game.fruit.x, game.fruit.y);
    game.fruit = null;
  }
  for (var i = 0; i < game.ghosts.length; i += 1) {
    var ghost = game.ghosts[i];
    var state = ghost.machine.getState();
    if (state === "eaten" || state === "house" || state === "leaving") continue;
    if (Math.hypot(pac.x - ghost.x, pac.y - ghost.y) < TILE * 0.7) {
      if (state === "frightened") {
        game.ghostChain += 1;
        var points = 200 * Math.pow(2, game.ghostChain - 1);
        addScore(points);
        addPopup(String(points), ghost.x, ghost.y);
        spawnBurst(ghost.x, ghost.y);
        ghost.machine.transition("eaten");
        sfx("ghost");
      } else {
        killPac();
        return;
      }
    }
  }
}

function killPac() {
  game.dyingTimer = 1.1;
  stopSiren();
  sfx("death");
}

function finishDeath() {
  game.lives -= 1;
  if (game.lives < 0) {
    manager.transition("gameover");
  } else {
    resetActors();
    game.readyTimer = 1.5;
    manager.transition("ready");
  }
}

function updateFeedback(step) {
  game.popups = game.popups.filter(function (p) {
    p.y -= step * 24;
    p.life -= step * 1.2;
    return p.life > 0;
  });
  game.particles = runtime.stepParticles(game.particles, step);
  if (game.fruit !== null) {
    game.fruitTimer -= step;
    if (game.fruitTimer <= 0) game.fruit = null;
  }
}

// ---------------------------------------------------------------------------
// 10. Update principal del gameplay.
// ---------------------------------------------------------------------------
function updatePlay(step) {
  game.blink += step;

  if (game.dyingTimer > 0) {
    game.dyingTimer -= step;
    updateFeedback(step);
    if (game.dyingTimer <= 0) finishDeath();
    return;
  }

  startSiren();
  game.globalElapsed += step;

  if (game.frightenedTime > 0) {
    game.frightenedTime -= step;
    if (game.frightenedTime <= 0) {
      game.ghosts.forEach(function (ghost) {
        if (ghost.machine.getState() === "frightened") {
          ghost.machine.transition(game.globalMode === "chase" ? "chase" : "scatter");
        }
      });
    }
  } else {
    var slot = MODE_SCHEDULE[game.modeIndex];
    game.modeTimer += step;
    if (game.modeTimer >= slot.dur && game.modeIndex < MODE_SCHEDULE.length - 1) {
      game.modeIndex += 1;
      game.modeTimer = 0;
      game.globalMode = MODE_SCHEDULE[game.modeIndex].mode;
      game.ghosts.forEach(function (ghost) {
        var s = ghost.machine.getState();
        if (s === "scatter" || s === "chase") {
          ghost.machine.transition(game.globalMode);
          reverseGhost(ghost);
        }
      });
    }
  }

  updatePac(step);
  game.ghosts.forEach(function (ghost) {
    updateGhost(ghost, step);
  });
  handleCollisions();
  updateFeedback(step);

  if (game.pelletsLeft <= 0) {
    game.level += 1;
    stopSiren();
    startLevel();
    manager.transition("ready");
  }
}

// ---------------------------------------------------------------------------
// 11. Render.
// ---------------------------------------------------------------------------
function drawMaze() {
  runtime.drawTileMap(game.maze, WALL_TILESET, {
    grid: grid,
    tileSize: TILE,
    origin: ORIGIN,
  });
  for (var r = 0; r < ROWS; r += 1) {
    for (var c = 0; c < COLS; c += 1) {
      var ch = game.maze[r].charAt(c);
      if (ch !== "." && ch !== "o") continue;
      var b = runtime.tileToBounds({ column: c, row: r }, { tileSize: TILE, origin: ORIGIN });
      var cx = b.x + b.width / 2;
      var cy = b.y + b.height / 2;
      ctx.fillStyle = "#ffd7a8";
      ctx.beginPath();
      if (ch === ".") {
        ctx.arc(cx, cy, 1.6, 0, Math.PI * 2);
      } else {
        var pulse = 3 + runtime.oscillate01(game.blink, 3) * 2;
        ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  }
}

function drawFruit() {
  if (game.fruit === null) return;
  grid.drawCompiledPixelSprite(cherry, {
    x: game.fruit.x - TILE / 2,
    y: game.fruit.y - TILE / 2,
    pixelSize: 2,
  });
}

function drawPac() {
  var pac = game.pac;
  var dir = 0;
  if (sameDir(pac.dir, DOWN)) dir = Math.PI / 2;
  else if (sameDir(pac.dir, LEFT)) dir = Math.PI;
  else if (sameDir(pac.dir, UP)) dir = -Math.PI / 2;

  var mouth = pac.mouth;
  if (game.dyingTimer > 0) {
    mouth = Math.min(1, (1 - game.dyingTimer / 1.1) * 1.4);
  }
  grid.drawPacman(pac.x, pac.y, TILE * 0.62, mouth, {
    direction: dir,
    fillColor: "#ffe600",
    strokeColor: "#000000",
  });
}

function drawGhosts() {
  game.ghosts.forEach(function (ghost) {
    var state = ghost.machine.getState();
    if (state === "eaten") {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ghost.x - 3, ghost.y - 2, 2.4, 0, Math.PI * 2);
      ctx.arc(ghost.x + 3, ghost.y - 2, 2.4, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    var fill = ghost.color;
    var eye = "#ffffff";
    var pupil = "#1414c8";
    if (state === "frightened") {
      var flashing = game.frightenedTime < 2 && Math.floor(game.blink * 6) % 2 === 0;
      fill = flashing ? "#ffffff" : "#2121ff";
      pupil = "#ff0000";
    }
    grid.drawGhost({ x: ghost.x, y: ghost.y }, TILE * 0.62, {
      fillColor: fill,
      eyeColor: eye,
      pupilColor: pupil,
    });
  });
}

function drawPopups() {
  ctx.textAlign = "center";
  ctx.font = "10px 'Geist Pixel', monospace";
  game.popups.forEach(function (p) {
    ctx.fillStyle = "rgba(255,255,255," + Math.max(0, p.life) + ")";
    ctx.fillText(p.text, p.x, p.y);
  });
  ctx.textAlign = "start";
  ctx.fillStyle = "#ffd7a8";
  game.particles.forEach(function (particle) {
    ctx.globalAlpha = Math.max(0, particle.life / (particle.maxLife || 1));
    var s = particle.size || 2;
    ctx.fillRect(particle.x - s / 2, particle.y - s / 2, s, s);
  });
  ctx.globalAlpha = 1;
}

function drawHud() {
  grid.drawValueLabel("1UP", game.score, 12, 20, {
    color: "#ffffff",
    font: "14px 'Geist Pixel', monospace",
  });
  grid.drawValueLabel("HIGH", game.high, WIDTH - 168, 20, {
    color: "#ffd7a8",
    font: "14px 'Geist Pixel', monospace",
  });
  grid.drawValueLabel("LV", game.level, WIDTH - 56, 20, {
    color: "#00d43b",
    font: "14px 'Geist Pixel', monospace",
  });
  for (var i = 0; i < game.lives; i += 1) {
    grid.drawCompiledPixelSprite(lifeIcon, {
      x: 12 + i * 26,
      y: HEIGHT - HUD_BOTTOM + 6,
      pixelSize: 4,
    });
  }
  if (game.frightenedTime > 0) {
    grid.drawBarIndicator("PWR", WIDTH - 150, HEIGHT - HUD_BOTTOM + 8, 100, 12, game.frightenedTime, frightenedDuration(), {
      fillColor: "#2121ff",
      textColor: "#ffffff",
    });
  }
}

function renderScene() {
  grid.clearCanvas();
  drawMaze();
  drawFruit();
  drawGhosts();
  drawPac();
  drawPopups();
  drawHud();
}

// Estado inicial: el menu ya muestra el tablero detras del titulo.
startLevel();

// ---------------------------------------------------------------------------
// 12. Escenas (menu / ready / play / paused / gameover).
// ---------------------------------------------------------------------------
var manager = runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu: {
      draw: function () {
        grid.clearCanvas();
        drawMaze();
        grid.drawMessage("PAC-MAN", "Enter para jugar", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ffe600",
          subColor: "#ffffff",
          mainFont: "34px 'Geist Pixel', monospace",
          subFont: "14px 'Geist Pixel', monospace",
        });
      },
    },
    ready: {
      update: function (step) {
        game.readyTimer -= step;
        if (game.readyTimer <= 0) manager.transition("play");
      },
      draw: function () {
        renderScene();
        grid.drawMessage("", "READY!", { x: WIDTH / 2, y: HEIGHT / 2 + 22 }, {
          color: "#ffe600",
          subColor: "#ffe600",
          subFont: "16px 'Geist Pixel', monospace",
        });
      },
    },
    play: {
      update: function (step) {
        updatePlay(step);
      },
      draw: function () {
        renderScene();
      },
      exit: function () {
        stopSiren();
      },
    },
    paused: {
      draw: function () {
        renderScene();
        grid.drawMessage("PAUSA", "P para seguir", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ffffff",
          subColor: "#ffd7a8",
          mainFont: "26px 'Geist Pixel', monospace",
          subFont: "13px 'Geist Pixel', monospace",
        });
      },
    },
    gameover: {
      enter: function () {
        stopSiren();
      },
      draw: function () {
        renderScene();
        grid.drawMessage("GAME OVER", "Enter para reiniciar", { x: WIDTH / 2, y: HEIGHT / 2 }, {
          color: "#ff0000",
          subColor: "#ffffff",
          mainFont: "28px 'Geist Pixel', monospace",
          subFont: "13px 'Geist Pixel', monospace",
        });
      },
    },
  },
});

// ---------------------------------------------------------------------------
// 13. Input + loop determinista de paso fijo.
// ---------------------------------------------------------------------------
var keys = runtime.createKeyTracker(canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "],
});
var pausePressed = false;
var actionPressed = false;

function readInput() {
  var scene = manager.getSceneId();
  var pac = game.pac;
  if (pac !== null) {
    if (keys.isPressed("ArrowLeft") || keys.isPressed("a")) pac.want = LEFT;
    else if (keys.isPressed("ArrowRight") || keys.isPressed("d")) pac.want = RIGHT;
    else if (keys.isPressed("ArrowUp") || keys.isPressed("w")) pac.want = UP;
    else if (keys.isPressed("ArrowDown") || keys.isPressed("s")) pac.want = DOWN;
  }

  var action = keys.isPressed("Enter") || keys.isPressed(" ");
  if (action && !actionPressed) {
    if (audio !== null) audio.resume();
    if (scene === "menu") {
      fullReset();
      manager.transition("ready");
    } else if (scene === "gameover") {
      fullReset();
      manager.transition("menu");
    }
  }
  actionPressed = action;

  var pause = keys.isPressed("p") || keys.isPressed("P");
  if (pause && !pausePressed) {
    if (scene === "play") manager.transition("paused");
    else if (scene === "paused") manager.transition("play");
  }
  pausePressed = pause;
}

var loop = runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  maxUpdatesPerFrame: 5,
  update: function (step) {
    readInput();
    manager.update(step);
  },
  draw: function () {
    manager.draw(ctx);
  },
});`;

const es: PacmanTutorial = {
  audience:
    "Ideal si ya conoces lo basico del canvas y quieres un proyecto grande, fiel al arcade original, que use TODAS las piezas de la libreria en un solo juego jugable.",
  coverage: [
    "Tilemaps + colisiones",
    "Movimiento por celdas",
    "IA de 4 fantasmas",
    "Scatter / chase / frightened",
    "Score y reglas clasicas",
    "Scene manager + fixed loop",
    "Pixel Sprite v2",
    "Audio arcade",
  ],
  duration: "120 min",
  outcomes: [
    "Modelar el laberinto como un tilemap y moverte por celdas con giros exactos en cada cruce.",
    "Implementar los cuatro fantasmas con su personalidad clasica y el ciclo scatter/chase/frightened.",
    "Reproducir las reglas y el score del arcade: puntos, energizantes, cadena de fantasmas, fruta, vidas y niveles.",
    "Unir todo con un scene manager, un loop de paso fijo determinista, pixel art compilado y audio.",
  ],
  prerequisites: [
    "Haber hecho la ruta Basica o sentirte comodo con new GridCanvasSystem, clearCanvas y el loop.",
    "Entender arrays, objetos y funciones en JavaScript moderno.",
    "Ganas de leer: este es un proyecto largo y cada decision esta explicada.",
  ],
  project: {
    deliverables: [
      "Un laberinto dibujado con drawTileMap y colisiones por tiles solidos.",
      "Pac-Man con movimiento por celdas, chomp animado y tunel lateral.",
      "Blinky, Pinky, Inky y Clyde con IA de objetivo y modos scatter/chase/frightened.",
      "Score fiel (10 / 50 / 200-1600 / fruta), vidas, energizantes y progresion de nivel.",
      "Menu, READY!, pausa y game over con scene manager, loop de paso fijo y audio arcade.",
    ],
    description:
      "Vamos a construir un Pac-Man completo y fiel al original, paso a paso, sobre grid-canvas-system. No es una demo: incluye reglas, puntaje, IA de fantasmas, energizantes, fruta, vidas y niveles. Cada paso agrega una capa y explica por que existe, hasta terminar con el juego entero corriendo dentro del Playground.",
    label: "Proyecto insignia",
    title: "Pac-Man completo, de cero a experto",
  },
  summary:
    "Construye un Pac-Man fiel al arcade con reglas, score e IA de fantasmas, usando tilemaps, movimiento por celdas, scene manager, loop de paso fijo, pixel art compilado y audio: un recorrido por toda la libreria en un solo juego.",
  tagline: "El proyecto que usa toda la libreria en un juego real.",
  title: "Pac-Man: el tributo definitivo paso a paso",
  version: libraryVersion,
  steps: [
    {
      id: "vision",
      title: "Que vas a construir y las reglas del original",
      question: "¿Que hace que un Pac-Man se sienta fiel y no solo una demo?",
      minutes: "10 min",
      body: [
        "Antes de escribir codigo conviene tener claro el objetivo. No vamos a hacer un circulo que come puntos: vamos a reproducir las reglas que hacen que Pac-Man se sienta como el arcade de 1980. Eso significa un laberinto real, cuatro fantasmas con personalidades distintas, energizantes que invierten la caza, un sistema de puntaje exacto, fruta de bonus, vidas y niveles que se aceleran.",
        "Las reglas fieles que implementaremos son: cada punto vale 10 y cada energizante 50. Al comer un energizante los fantasmas entran en panico (frightened) y comerlos vale 200, 400, 800 y 1600 en cadena. La fruta da bonus. Pierdes una vida si un fantasma te toca fuera de panico; con 3 vidas iniciales y una extra a los 10.000 puntos. Cuando comes todos los puntos, subes de nivel y todo se acelera.",
        "La arquitectura tambien es fiel a como se construyen estos juegos: un scene manager gobierna el flujo (menu, READY!, juego, pausa, game over); un loop de paso fijo hace la simulacion determinista; el laberinto es un tilemap; y cada actor se mueve por celdas, girando solo en los centros de tile. Sobre eso montamos IA, score, pixel art y audio.",
      ],
      why: {
        title: "Por que paso fijo y escenas",
        text: "La IA de los fantasmas y las colisiones necesitan un ritmo estable para ser reproducibles: por eso createFixedStepLoop en vez de un loop variable. Y como el juego tiene estados muy distintos (menu, jugar, pausa, morir), un createSceneManager evita el clasico enredo de banderas booleanas dentro de un unico bucle.",
      },
      diagram: {
        title: "Las capas del juego",
        caption:
          "Cada capa se apoya en la anterior. Construiremos de abajo hacia arriba: primero el tablero, al final el flujo de escenas y el audio.",
        source: `flowchart TB
  A["createFixedStepLoop: reloj determinista"] --> B["createSceneManager: menu / juego / pausa / game over"]
  B --> C["Tilemap: laberinto + colisiones"]
  C --> D["Actores por celdas: Pac-Man y 4 fantasmas"]
  D --> E["Reglas: score, energizantes, fruta, vidas, niveles"]
  E --> F["Pixel art + HUD + audio arcade"]`,
      },
      checklist: [
        "Lee la tabla de reglas: 10, 50, 200-1600, fruta, 3 vidas, extra a 10.000, niveles que aceleran.",
        "Identifica las 6 capas del diagrama: reloj, escenas, tilemap, actores, reglas, presentacion.",
        "Abre el juego final del ultimo paso para ver a donde vamos antes de empezar.",
      ],
      milestone:
        "Tienes el mapa mental del proyecto: sabes que reglas hay que respetar y en que orden vamos a construir.",
      resources: [
        { href: "/es/docs/#quick-start", label: "Inicio rapido de la libreria" },
        {
          href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
          label: "Contrato de API publica",
        },
      ],
    },
    {
      id: "tablero",
      title: "El laberinto como tilemap",
      question: "¿Como convertimos un dibujo de texto en un tablero jugable?",
      minutes: "14 min",
      body: [
        "El laberinto es el corazon del juego, y la forma mas clara de describirlo es como texto: una lista de filas donde cada caracter es un tile. Usamos '#' para pared, '.' para punto, 'o' para energizante, ' ' para vacio y '-' para la puerta de la casa de los fantasmas. Todas las filas miden lo mismo (28 columnas), porque drawTileMap exige un mapa rectangular.",
        "Para dibujarlo pasamos ese mapa a drawTileMap junto con un tileset. El truco clave: solo la pared tiene una definicion de color. drawTileMap ignora cualquier caracter que no este en el tileset, asi que los puntos, energizantes y vacios no se pintan como tiles; los dibujaremos aparte en el proximo paso. Con origin desplazamos el laberinto hacia abajo para dejar sitio al HUD.",
        "Configuramos el canvas en negro y hacemos el color de grilla transparente para que clearCanvas nos deje un fondo limpio sin lineas. El tamano del canvas se deriva del mapa: ancho = columnas x TILE, alto = HUD superior + filas x TILE + HUD inferior.",
      ],
      why: {
        title: "Datos y dibujo, separados",
        text: "El mapa es solo texto: es facil de leer, editar y versionar. drawTileMap traduce ese texto a pixeles. Manteniendo la descripcion (el mapa) separada del render (el tileset) puedes recolorear el laberinto, generar niveles o depurar colisiones sin tocar el motor de dibujo.",
      },
      code: `const RAW_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  // ...resto del laberinto (28 filas de 28 columnas)...
  "############################",
];

const TILE = 16;
const ORIGIN = { x: 0, y: 48 };

const grid = new GridCanvasSystem("canvas", {
  width: RAW_MAZE[0].length * TILE,
  height: 48 + RAW_MAZE.length * TILE + 32,
  cellSize: TILE,
  backgroundColor: "#000000",
  gridColor: "transparent",
  gridLabelColor: "transparent",
});

// Solo "#" tiene color: drawTileMap ignora puntos, vacios y energizantes.
GridCanvasSystem.runtime.drawTileMap(RAW_MAZE, { "#": "#1414c8", "-": "#ff9cc8" }, {
  grid,
  tileSize: TILE,
  origin: ORIGIN,
});`,
      codeTitle: "Describe el laberinto y pintalo con drawTileMap",
      diagram: {
        title: "De texto a tiles",
        caption:
          "Cada caracter ocupa una celda de TILE x TILE. El tileset decide que caracteres se pintan y de que color.",
        source: `flowchart LR
  A["Filas de texto"] --> B["drawTileMap(map, tileset, opts)"]
  C["Tileset: solo la pared"] --> B
  B --> D["Paredes azules en el canvas"]
  A --> E["'.', 'o', ' ' quedan para dibujar aparte"]`,
      },
      expected: {
        text: "Ves el laberinto azul sobre fondo negro, con un hueco central (la casa de los fantasmas) y un pasillo lateral (el tunel). Aun no hay puntos: eso llega en el siguiente paso.",
      },
      checklist: [
        "Define RAW_MAZE con filas del mismo largo y verifica que sea rectangular.",
        "Crea el canvas en negro con gridColor transparente.",
        "Llama a drawTileMap con un tileset que solo defina la pared.",
      ],
      milestone:
        "El tablero existe: un tilemap real que luego dara estructura y colisiones.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
          label: "Source de tilemap",
        },
        { href: "/es/docs/#tilemaps", label: "Docs de tilemaps" },
      ],
    },
    {
      id: "puntos",
      title: "Puntos, energizantes y el contador",
      question: "¿Como dibujamos y comemos los 228 puntos sin desordenar el mapa?",
      minutes: "12 min",
      body: [
        "El laberinto trae 228 puntos y 4 energizantes. Los dibujamos recorriendo el mapa y usando tileToBounds para obtener el centro exacto de cada celda: un punto es un circulo pequeno; un energizante es un circulo mas grande que late con oscillate01 para llamar la atencion.",
        "Comer es cambiar el mapa. Como el mapa son cadenas de texto, usamos setTileAt, que devuelve un mapa nuevo con esa celda convertida en vacio. Es inmutable a proposito: siempre trabajamos con datos limpios y no mutamos cadenas a mano. Cada punto suma 10 y cada energizante 50 (ademas de activar el modo panico, que veremos mas adelante).",
        "El contador pelletsLeft arranca en 228 y baja con cada mordida. Cuando llega a cero, el nivel esta completo. Ese contador es la condicion de victoria de cada nivel.",
      ],
      why: {
        title: "setTileAt inmutable",
        text: "setTileAt no toca el array original: devuelve uno nuevo. Eso evita bugs sutiles cuando otras partes del motor leen el mapa en el mismo frame, y deja el estado del tablero facil de razonar. El costo es minimo porque comer ocurre como mucho una vez por frame.",
      },
      code: `let maze = RAW_MAZE.slice();
let pelletsLeft = 228;

function eatAt(col, row) {
  const ch = maze[row].charAt(col);
  if (ch !== "." && ch !== "o") return;
  maze = GridCanvasSystem.runtime.setTileAt(maze, { column: col, row: row }, " ");
  pelletsLeft -= 1;
  if (ch === ".") { score += 10; }
  else { score += 50; triggerFrightened(); }
}

// Dibujar cada punto en el centro exacto de su celda:
const b = GridCanvasSystem.runtime.tileToBounds(
  { column: c, row: r },
  { tileSize: TILE, origin: ORIGIN }
);
const cx = b.x + b.width / 2;
const cy = b.y + b.height / 2;
if (ch === "o") {
  const r = 3 + GridCanvasSystem.runtime.oscillate01(time, 3) * 2; // late
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}`,
      codeTitle: "Dibuja y come puntos con tileToBounds y setTileAt",
      diagram: {
        title: "El ciclo de una mordida",
        caption:
          "Leemos el caracter de la celda, sumamos score y devolvemos un mapa nuevo con esa celda vacia.",
        source: `flowchart LR
  A["Pac-Man llega a (col, row)"] --> B["maze[row].charAt(col)"]
  B --> C{"¿'.' o 'o'?"}
  C -->|punto| D["score += 10"]
  C -->|energizante| E["score += 50 + frightened"]
  D --> F["setTileAt -> mapa nuevo"]
  E --> F
  F --> G["pelletsLeft -= 1"]`,
      },
      expected: {
        text: "El laberinto se llena de puntos color crema y los cuatro energizantes laten en las esquinas. Al recorrerlo (en el juego final) los puntos desaparecen y el contador baja.",
      },
      checklist: [
        "Recorre el mapa y dibuja cada '.' y 'o' usando tileToBounds para centrarlos.",
        "Haz que el energizante lata con oscillate01.",
        "Implementa eatAt con setTileAt y actualiza score y pelletsLeft.",
      ],
      milestone:
        "El tablero ya tiene objetivo: puntos que se comen, se cuentan y valen score.",
      resources: [
        { href: "/es/docs/#pixel-sprites", label: "Docs de dibujo y helpers" },
        {
          href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
          label: "getTileAt / setTileAt / tileToBounds",
        },
      ],
    },
    {
      id: "movimiento",
      title: "Pac-Man se mueve por celdas",
      question: "¿Como logramos giros perfectos que respetan el laberinto?",
      minutes: "16 min",
      body: [
        "El movimiento clasico de Pac-Man no es libre: los actores se deslizan en pixeles pero solo pueden cambiar de direccion en el centro de un tile, y solo hacia celdas que no sean pared. Modelamos a Pac-Man como una posicion en pixeles que 'salta' de centro de tile a centro de tile: cada vez que llega a un centro, decidimos el proximo giro.",
        "La entrada usa createKeyTracker sobre grid.canvas. Guardamos la direccion deseada (want) y en cada cruce intentamos girar hacia ella; si esta bloqueada, seguimos recto; si tambien hay pared, nos detenemos. Permitimos ademas la reversa instantanea a mitad de tile, como en el original. Y el tunel lateral: al salir por un borde en la fila del tunel, aparecemos por el otro lado.",
        "Para dibujarlo usamos drawPacman, que ya soporta direction (hacia donde mira la boca) y un valor de apertura 0..1. Animamos el chomp con oscillate01 mientras Pac-Man avanza, y lo cerramos cuando esta quieto.",
      ],
      why: {
        title: "Por que moverse por celdas",
        text: "Girar solo en los centros de tile es lo que hace que Pac-Man 'encaje' en el laberinto y que la IA de los fantasmas sea predecible. Si movieras en pixeles libres tendrias que resolver colisiones continuas y la sensacion arcade se perderia.",
      },
      code: `const keys = GridCanvasSystem.runtime.createKeyTracker(grid.canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
});

// Cada frame guardamos la direccion pedida:
if (keys.isPressed("ArrowLeft")) pac.want = LEFT;
else if (keys.isPressed("ArrowUp")) pac.want = UP; // etc.

// Al llegar al centro de un tile decidimos el giro:
function arrivePac() {
  const t = tileOf(pac);
  eatAt(t.col, t.row);
  if (!isWall(t.col + pac.want.x, t.row + pac.want.y)) pac.dir = pac.want; // giro pedido
  else if (isWall(t.col + pac.dir.x, t.row + pac.dir.y)) pac.dir = STOP;   // pared: frena
  pac.target = centerOf(t.col + pac.dir.x, t.row + pac.dir.y);
}

grid.drawPacman(pac.x, pac.y, TILE * 0.62, GridCanvasSystem.runtime.oscillate01(pac.anim, 1), {
  direction: pac.facing, // 0, PI/2, PI o -PI/2 segun pac.dir
  fillColor: "#ffe600",
});`,
      codeTitle: "Movimiento por celdas con giro en el centro",
      diagram: {
        title: "Saltar de centro a centro",
        caption:
          "Entre dos centros el movimiento es recto. La decision de girar ocurre solo al llegar a un centro de tile.",
        source: `flowchart LR
  A["Avanza hacia el centro objetivo"] --> B{"¿Llego al centro?"}
  B -->|no| A
  B -->|si| C["Come el punto de esta celda"]
  C --> D{"¿want abierto?"}
  D -->|si| E["Gira hacia want"]
  D -->|no| F{"¿dir abierto?"}
  F -->|si| G["Sigue recto"]
  F -->|no| H["Se detiene"]`,
      },
      expected: {
        text: "Pac-Man recorre los pasillos con giros limpios, nunca atraviesa paredes, abre y cierra la boca al moverse y reaparece por el otro lado al entrar al tunel.",
      },
      checklist: [
        "Conecta createKeyTracker y guarda la direccion deseada cada frame.",
        "Implementa el giro solo en el centro del tile y el bloqueo por paredes.",
        "Dibuja con drawPacman usando direction y oscillate01 para el chomp.",
      ],
      milestone: "Ya controlas a Pac-Man con giros arcade exactos y tunel lateral.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createKeyTracker.ts`,
          label: "Source de createKeyTracker",
        },
        { href: "/es/docs/#input-motion", label: "Docs de input y movimiento" },
      ],
    },
    {
      id: "hud-fruta",
      title: "Score, vidas y fruta con pixel art compilado",
      question: "¿Como mostramos estado y creamos assets sin cargar imagenes?",
      minutes: "12 min",
      body: [
        "Un arcade necesita HUD. Con drawValueLabel mostramos SCORE, HIGH y nivel; con drawBarIndicator dibujamos la barra del energizante mientras dura el panico. Son helpers de texto y de barra que ya resuelven fuentes y alineacion.",
        "Las vidas y la fruta las creamos como pixel art compilado. Definimos una paleta con createPixelPalette y compilamos una matriz de caracteres con compilePixelSprite una sola vez; despues la dibujamos muchas veces con drawCompiledPixelSprite sin revalidar filas ni colores en cada frame. La cereza de bonus aparece tras comer cierta cantidad de puntos y da puntos extra.",
        "El modulo de sprites trae mas herramientas puras que valen oro para variantes: flipPixelSpriteX/Y para voltear, tintPixelSprite para recolorear un sprite compilado, y getPixelSpriteBounds / hitTestPixelSprite para medir e interactuar. No las necesitamos todas en Pac-Man, pero saber que existen te ahorra dibujar cada variante a mano.",
      ],
      why: {
        title: "Compilar una vez, dibujar mil",
        text: "compilePixelSprite convierte la matriz de texto en una lista de pixeles con color ya resuelto (y descarta los transparentes). Dentro del loop, drawCompiledPixelSprite solo pinta rectangulos: es el patron recomendado de Pixel Sprite v2 para todo lo que se repite frame a frame.",
      },
      code: `const palette = GridCanvasSystem.createPixelPalette({
  "0": "transparent", "1": "#ff0000", "2": "#00d43b", "3": "#ffffff",
});
const cherry = GridCanvasSystem.compilePixelSprite([
  "00000020", "00000200", "00003200", "00113110",
  "01111110", "11311131", "11111111", "01111110",
], palette);
const lifeIcon = GridCanvasSystem.compilePixelSprite(
  ["01110", "11100", "11000", "11100", "01110"],
  GridCanvasSystem.createPixelPalette({ "0": "transparent", "1": "#ffe600" }),
);

grid.drawValueLabel("1UP", score, 12, 20, { color: "#ffffff", font: "14px 'Geist Pixel', monospace" });
for (let i = 0; i < lives; i++) {
  grid.drawCompiledPixelSprite(lifeIcon, { x: 12 + i * 26, y: hudY, pixelSize: 4 });
}
if (frightenedTime > 0) {
  grid.drawBarIndicator("PWR", x, y, 100, 12, frightenedTime, maxTime, {
    fillColor: "#2121ff", textColor: "#ffffff",
  });
}`,
      codeTitle: "HUD con helpers y assets con Pixel Sprite v2",
      expected: {
        text: "Arriba ves SCORE, HIGH y el nivel. Abajo, un icono amarillo por cada vida. Cuando comes un energizante aparece la barra PWR y, mas tarde, una cereza en el centro del laberinto.",
      },
      checklist: [
        "Compila la cereza y el icono de vida una sola vez con compilePixelSprite.",
        "Dibuja SCORE / HIGH / nivel con drawValueLabel y las vidas con drawCompiledPixelSprite.",
        "Muestra la barra del energizante con drawBarIndicator solo cuando frightenedTime > 0.",
      ],
      milestone:
        "El juego comunica su estado: puntaje, vidas, nivel y el temporizador del energizante.",
      resources: [
        { href: "/es/docs/#pixel-sprites", label: "Docs de Pixel Sprite v2" },
        {
          href: `${repoUrl}/blob/main/src/drawing/pixelSprite.ts`,
          label: "Source de pixel sprites",
        },
      ],
    },
    {
      id: "fantasmas",
      title: "Los cuatro fantasmas y sus modos",
      question: "¿Como organizamos los estados de un fantasma sin volvernos locos?",
      minutes: "16 min",
      body: [
        "Blinky (rojo), Pinky (rosa), Inky (cyan) y Clyde (naranja) se dibujan con drawGhost, que ya trae cuerpo, ojos y pupilas configurables. Pero lo interesante no es como se ven, sino como piensan: cada fantasma vive en una maquina de estados con seis modos: house, leaving, scatter, chase, frightened y eaten.",
        "Modelamos cada modo con createStateMachine, que valida que las transiciones sean legales (por ejemplo, de 'house' solo puedes ir a 'leaving' o 'frightened'). Eso convierte un enredo de banderas en un contrato claro: si intentas una transicion invalida, la maquina la rechaza.",
        "Ademas hay un ritmo global scatter/chase que alterna cada varios segundos siguiendo el cronograma clasico del nivel 1. Cuando cambia el modo global, los fantasmas activos invierten su direccion de golpe, exactamente como en el arcade. La liberacion de la casa es escalonada: Blinky sale de inmediato, los demas con retraso.",
      ],
      why: {
        title: "Estados explicitos, bugs menos",
        text: "Un fantasma que persigue, huye, vuelve a casa como ojos y espera en la casa tiene comportamientos muy distintos. createStateMachine hace explicito que transiciones existen, asi que nunca terminas con un fantasma 'huyendo y comido a la vez'. El estado manda; el dibujo y la IA solo lo leen.",
      },
      code: `function makeGhost(name) {
  const machine = GridCanvasSystem.runtime.createStateMachine({
    initial: "house",
    transitions: {
      house: ["leaving", "frightened"],
      leaving: ["scatter", "chase"],
      scatter: ["chase", "frightened", "eaten"],
      chase: ["scatter", "frightened", "eaten"],
      frightened: ["scatter", "chase", "eaten"],
      eaten: ["house"],
    },
  });
  return { name, machine, color: GHOST_COLORS[name] /* x, y, dir... */ };
}

const MODE_SCHEDULE = [
  { mode: "scatter", dur: 7 }, { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 7 }, { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 }, { mode: "chase", dur: Infinity },
];

grid.drawGhost({ x: ghost.x, y: ghost.y }, TILE * 0.62, {
  fillColor: ghost.color, eyeColor: "#ffffff", pupilColor: "#1414c8",
});`,
      codeTitle: "Un fantasma es una maquina de estados",
      diagram: {
        title: "Ciclo scatter / chase",
        caption:
          "El modo global alterna en el tiempo. Al cambiar, los fantasmas activos invierten su direccion.",
        source: `flowchart LR
  A["scatter 7s"] --> B["chase 20s"]
  B --> C["scatter 7s"]
  C --> D["chase 20s"]
  D --> E["scatter 5s"]
  E --> F["chase (resto del nivel)"]`,
      },
      expected: {
        text: "Los cuatro fantasmas salen de la casa de forma escalonada y alternan entre dispersarse a sus esquinas (scatter) y perseguirte (chase). Cada uno con su color.",
      },
      checklist: [
        "Crea cada fantasma con su createStateMachine y sus seis modos.",
        "Define el MODE_SCHEDULE y aplica el cambio global scatter/chase con reversa.",
        "Dibuja cada fantasma con drawGhost usando su color.",
      ],
      milestone:
        "Los fantasmas existen, salen de la casa y alternan modos con reglas claras.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createStateMachine.ts`,
          label: "Source de createStateMachine",
        },
        { href: "/es/docs/#state-sprites", label: "Docs de estados y sprites" },
      ],
    },
    {
      id: "ia",
      title: "IA clasica: cada fantasma piensa distinto",
      question: "¿Por que Blinky te persigue y Clyde parece cobarde?",
      minutes: "16 min",
      body: [
        "La magia de Pac-Man esta en que los cuatro fantasmas comparten el mismo algoritmo pero eligen objetivos distintos. En cada cruce, un fantasma mira sus salidas (sin poder dar media vuelta) y elige la que lo acerca mas a su tile objetivo. Cambiando solo el objetivo, obtienes cuatro personalidades.",
        "Blinky apunta directo a tu tile: te persigue de frente. Pinky apunta 4 tiles por delante de ti para emboscarte (e incluye el famoso bug de overflow cuando miras hacia arriba). Inky combina tu posicion con la de Blinky para cerrarte por el otro lado. Clyde te persigue solo si esta lejos; si te acercas a menos de 8 tiles, huye a su esquina: por eso parece timido.",
        "En modo scatter cada fantasma va a su esquina fija. En frightened elige direcciones al azar. En eaten (comido) su objetivo es la puerta de la casa para revivir. El mismo bucle de decision sirve para todos los modos: solo cambia el objetivo.",
      ],
      why: {
        title: "Un algoritmo, cuatro mentes",
        text: "Reutilizar 'elige la salida que minimiza la distancia al objetivo' y variar solo el objetivo es una leccion de diseno: comportamiento emergente a partir de una regla simple. Es tambien lo que hace el juego justo y aprendible.",
      },
      code: `function ghostTarget(ghost) {
  const p = tileOf(pac);
  const state = ghost.machine.getState();
  if (state === "scatter" || state === "frightened") return SCATTER[ghost.name];
  if (state === "eaten") return EXIT_TILE;
  if (ghost.name === "blinky") return p;                          // persigue directo
  if (ghost.name === "pinky") {                                    // embosca 4 adelante
    return { col: p.col + pac.dir.x * 4, row: p.row + pac.dir.y * 4 };
  }
  if (ghost.name === "inky") {                                     // refleja a Blinky
    const b = tileOf(blinky);
    const pivotC = p.col + pac.dir.x * 2, pivotR = p.row + pac.dir.y * 2;
    return { col: pivotC * 2 - b.col, row: pivotR * 2 - b.row };
  }
  const d = Math.hypot(gCol - p.col, gRow - p.row);                // clyde: timido
  return d > 8 ? p : SCATTER.clyde;
}

// En cada cruce: elige la salida (sin reversa) mas cercana al objetivo.
options.forEach((dir) => {
  const dist2 = distanceToTargetSquared(tile, dir, goal);
  if (dist2 < best) { best = dist2; chosen = dir; }
});`,
      codeTitle: "El objetivo define la personalidad",
      diagram: {
        title: "Cuatro objetivos, un mismo algoritmo",
        caption:
          "Todos eligen la salida mas cercana a su objetivo. Solo cambia donde esta ese objetivo.",
        source: `flowchart TB
  P["Tile de Pac-Man"] --> B["Blinky: tu tile"]
  P --> K["Pinky: 4 tiles delante"]
  P --> I["Inky: reflejo via Blinky"]
  P --> C["Clyde: lejos persigue / cerca huye"]
  B --> G["Elegir salida que minimiza distancia"]
  K --> G
  I --> G
  C --> G`,
      },
      expected: {
        text: "Blinky te sigue pegado, Pinky intenta cortarte el paso, Inky aparece por sorpresa y Clyde se aleja cuando estas cerca. Se siente como el arcade.",
      },
      checklist: [
        "Implementa ghostTarget con el objetivo de cada personaje.",
        "En cada cruce elige la salida sin reversa mas cercana al objetivo.",
        "Usa objetivos distintos para scatter, frightened y eaten.",
      ],
      milestone:
        "Tienes IA fiel: cuatro personalidades emergen de una sola regla de decision.",
      resources: [
        {
          href: `${repoUrl}/blob/main/examples/vanilla/tilemap-scene`,
          label: "Demo de tilemap + escenas",
        },
        { href: "/es/docs/#input-motion", label: "Helpers de distancia y vectores" },
      ],
    },
    {
      id: "energizante",
      title: "El energizante: cuando la caza se invierte",
      question:
        "¿Como implementamos el panico, la cadena de puntos y el regreso a casa?",
      minutes: "16 min",
      body: [
        "Comer un energizante lo cambia todo: todos los fantasmas activos entran en frightened, invierten su direccion, se vuelven mas lentos y azules, y parpadean cuando el tiempo se acaba. Durante ese lapso, tocarlos ya no te mata: te los comes.",
        "Comer fantasmas en cadena da 200, 400, 800 y 1600 puntos, duplicando por cada uno dentro del mismo energizante. Al comer uno, pasa a estado eaten: se convierte en un par de ojos que viajan por el laberinto de vuelta a la casa, donde revive. Mostramos una barra con drawBarIndicator y un puntaje flotante en el punto del impacto.",
        "Para el feedback visual usamos particulas: createParticleBurst genera una explosion de particulas y stepParticles las integra frame a frame (con vida que decae). Es el mismo toolbox de escena que la libreria ofrece para trails y efectos, aplicado a la satisfaccion de comerse un fantasma.",
      ],
      why: {
        title: "El estado eaten cierra el ciclo",
        text: "Separar 'frightened' de 'eaten' es clave: un fantasma comido no debe poder matarte ni ser recomido, y debe ignorar el temporizador de panico para volver a casa. La maquina de estados hace esa distincion trivial y a prueba de errores.",
      },
      code: `function triggerFrightened() {
  frightenedTime = frightenedDuration(); // baja con el nivel
  ghostChain = 0;
  ghosts.forEach((g) => {
    const s = g.machine.getState();
    if (s === "scatter" || s === "chase") { g.machine.transition("frightened"); reverse(g); }
  });
}

// Colision con un fantasma azul: cadena 200, 400, 800, 1600...
ghostChain += 1;
score += 200 * Math.pow(2, ghostChain - 1);
g.machine.transition("eaten");                 // vuelve como ojos a la casa

// Explosion de particulas como feedback:
const burst = GridCanvasSystem.runtime.createParticleBurst({ x, y }, 12, { speed: 90, life: 0.6 });
particles = particles.concat(burst);
particles = GridCanvasSystem.runtime.stepParticles(particles, step);`,
      codeTitle: "Panico, cadena de puntos y regreso a casa",
      diagram: {
        title: "El ciclo del energizante",
        caption:
          "El energizante activa frightened; comer un fantasma lo manda a eaten; en casa revive y vuelve a la caza.",
        source: `flowchart LR
  A["Come energizante"] --> B["Fantasmas -> frightened + reversa"]
  B --> C{"¿Pac los toca?"}
  C -->|si| D["score x2 en cadena + eaten"]
  D --> E["Ojos vuelven a la casa"]
  E --> F["Revive -> scatter/chase"]
  B -->|se acaba el tiempo| F`,
      },
      expected: {
        text: "Al comer un energizante los fantasmas se ponen azules y huyen. Si los alcanzas, ves el puntaje flotante y una lluvia de particulas, y sus ojos regresan a la casa.",
      },
      checklist: [
        "Implementa triggerFrightened: transiciona a frightened e invierte direccion.",
        "Suma la cadena 200/400/800/1600 y pasa el fantasma a eaten.",
        "Agrega particulas con createParticleBurst y stepParticles.",
      ],
      milestone:
        "El energizante funciona: panico, cadena de puntos, ojos que vuelven y feedback jugoso.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/scene.ts`,
          label: "Source de particulas y trails",
        },
        { href: "/es/docs/#input-motion", label: "Docs de escena y feedback" },
      ],
    },
    {
      id: "vidas-niveles",
      title: "Vidas, muerte y progresion de nivel",
      question: "¿Que pasa cuando te atrapan y cuando limpias el tablero?",
      minutes: "14 min",
      body: [
        "Si un fantasma en scatter o chase te toca, pierdes una vida. Arrancamos con 3 y damos una extra al llegar a 10.000 puntos. La muerte reutiliza drawPacman de forma elegante: barremos la apertura de la boca de 0 a 1 para reproducir la animacion iconica de Pac-Man desapareciendo, y luego reiniciamos posiciones o vamos a game over.",
        "Cuando pelletsLeft llega a cero, el nivel esta superado: subimos de nivel, reconstruimos el laberinto y aceleramos. Cada nivel Pac-Man y los fantasmas van un poco mas rapido, y el tiempo de energizante se acorta: la dificultad crece de forma fiel al original.",
        "Todo esto vive en unas pocas funciones (killPac, finishDeath, startLevel) que el update principal orquesta. Mantenerlas pequenas y con una sola responsabilidad hace que el flujo de vida/muerte/nivel sea facil de seguir.",
      ],
      why: {
        title: "Reusar drawPacman para morir",
        text: "No necesitas un sprite de muerte aparte: drawPacman ya acepta una apertura de boca 0..1. Interpolando esa apertura con el tiempo obtienes la animacion clasica gratis. Es un ejemplo de exprimir un primitivo de la libreria en lugar de agregar assets.",
      },
      code: `// Colision Pac vs fantasma
if (state === "frightened") eatGhost(g);
else killPac();                                 // arranca la muerte

function killPac() { pac.dying = 1.1; stopSiren(); }

// La muerte abre la boca al maximo con drawPacman:
const mouth = Math.min(1, (1 - pac.dying / 1.1) * 1.4);
grid.drawPacman(pac.x, pac.y, TILE * 0.62, mouth, { direction: pac.facing, fillColor: "#ffe600" });

function finishDeath() {
  lives -= 1;
  if (lives < 0) manager.transition("gameover");
  else { resetActors(); manager.transition("ready"); }
}

// Nivel superado
if (pelletsLeft <= 0) { level += 1; startLevel(); manager.transition("ready"); }`,
      codeTitle: "Muerte, vidas y subida de nivel",
      expected: {
        text: "Al ser atrapado, Pac-Man reproduce su animacion de muerte y pierdes una vida. Al comer el ultimo punto, el nivel se reinicia mas rapido y con menos tiempo de energizante.",
      },
      checklist: [
        "Distingue comer fantasma (frightened) de morir (scatter/chase).",
        "Anima la muerte barriendo la apertura de drawPacman.",
        "Sube de nivel al llegar a pelletsLeft = 0 y acelera el juego.",
      ],
      milestone:
        "El juego ya tiene consecuencias: mueres, pierdes vidas, subes de nivel y ganas una vida extra.",
      resources: [
        {
          href: "/es/docs/#arcade-primitives",
          label: "Primitivas arcade (drawPacman)",
        },
        { href: `${repoUrl}/blob/main/CHANGELOG.md`, label: "Notas de version" },
      ],
    },
    {
      id: "escenas-audio",
      title: "Flujo de escenas, input global y audio",
      question: "¿Como unimos menu, juego y pausa sin un enredo de banderas?",
      minutes: "14 min",
      body: [
        "El juego tiene estados de alto nivel muy distintos: el menu, el READY! previo, el juego, la pausa y el game over. En vez de banderas dispersas, usamos createSceneManager: cada escena declara sus propios enter, update, draw y exit, y las transiciones son explicitas. La escena de juego corre la simulacion; las demas solo dibujan y esperan una tecla.",
        "El input global (Enter para empezar/reiniciar, P para pausar) tambien pasa por createKeyTracker, detectando el flanco de la tecla para no repetir la accion cada frame. Y el audio arcade (createArcadeAudio) suena aqui: la sirena en loop durante el juego, y efectos al comer puntos, energizantes o fantasmas. Como los navegadores bloquean el audio hasta un gesto del usuario, lo desbloqueamos en el primer Enter.",
        "Todo lo mueve un unico createFixedStepLoop: en update leemos input y avanzamos la escena activa con un paso fijo (1/60); en draw pintamos esa escena. Ese reloj determinista es lo que hace que la IA y las colisiones se comporten igual en cualquier maquina.",
      ],
      why: {
        title: "Escenas + reloj = orden",
        text: "createSceneManager saca la logica de 'en que pantalla estoy' fuera del bucle, y createFixedStepLoop garantiza un ritmo estable. Juntos convierten un juego con muchos estados en algo modular y testeable, en lugar de un unico bucle gigante lleno de if.",
      },
      code: `const manager = GridCanvasSystem.runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu:     { draw: drawMenu },
    ready:    { update: countdown, draw: drawReady },
    play:     { update: updatePlay, draw: renderScene, exit: stopSiren },
    paused:   { draw: drawPaused },
    gameover: { enter: stopSiren, draw: drawGameOver },
  },
});

const audio = createArcadeAudio({ masterVolume: 0.4 }); // en el Playground ya existe

GridCanvasSystem.runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  maxUpdatesPerFrame: 5,
  update: (step) => { readInput(); manager.update(step); },
  draw: () => manager.draw(ctx),
});`,
      codeTitle: "Scene manager + loop de paso fijo",
      diagram: {
        title: "El grafo de escenas",
        caption:
          "Cada flecha es una transicion explicita del scene manager. El loop de paso fijo alimenta a la escena activa.",
        source: `flowchart LR
  M["menu"] -->|Enter| R["ready"]
  R -->|cuenta 0| P["play"]
  P -->|P| PA["paused"]
  PA -->|P| P
  P -->|sin vidas| G["gameover"]
  G -->|Enter| M
  P -->|tablero limpio| R`,
      },
      callout: {
        title: "Nota de navegador",
        text: "El audio no arranca solo: los navegadores exigen un gesto del usuario. Por eso llamamos audio.resume() en el primer Enter y recien ahi suena la sirena y los efectos.",
      },
      expected: {
        text: "El menu muestra PAC-MAN; Enter arranca con READY!; P pausa y reanuda; al perder todas las vidas aparece GAME OVER y Enter vuelve al menu. La sirena suena durante el juego.",
      },
      checklist: [
        "Declara las escenas menu/ready/play/paused/gameover con createSceneManager.",
        "Detecta Enter y P por flanco con createKeyTracker y desbloquea el audio.",
        "Orquesta todo con createFixedStepLoop llamando update y draw.",
      ],
      milestone:
        "El juego tiene flujo completo: menu, partida, pausa, game over y audio, todo determinista.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createSceneManager.ts`,
          label: "Source de createSceneManager",
        },
        {
          href: `${repoUrl}/blob/main/src/runtime/createFixedStepLoop.ts`,
          label: "Source de createFixedStepLoop",
        },
      ],
    },
    {
      id: "juego-completo",
      title: "El Pac-Man completo: ejecutalo",
      question: "¿Como se ve todo junto y funcionando?",
      minutes: "20 min",
      body: [
        "Aqui esta el juego entero, listo para correr en el Playground. Reune todo lo que construimos: el laberinto como tilemap, el movimiento por celdas con tunel, los cuatro fantasmas con su IA y sus modos, el energizante con cadena de puntos y ojos que vuelven, la fruta, el HUD con pixel art, el score fiel, las vidas, los niveles que aceleran, el scene manager, el loop de paso fijo y el audio arcade.",
        "Controles: flechas o WASD para moverte, Enter para empezar y reiniciar, P para pausar. Haz clic en el canvas si el teclado no responde (para darle foco). Lee el codigo con calma: cada seccion esta numerada y comentada siguiendo el orden de este tutorial.",
        "Para llevarlo mas lejos, la libreria te deja crecer sin reescribir: cambia createArcadeAudio por los adapters de Howler y Tone (grid-canvas-system/audio) para musica real; usa createSpriteAnimator si quieres frames de muerte dibujados a mano; y aprovecha MassBody, appendTrailPoint o los helpers de colision para nuevos efectos. El nucleo pequeno y estable ya soporta todo eso.",
      ],
      why: {
        title: "De cero a experto",
        text: "Empezaste con un canvas vacio y terminaste con un arcade fiel que ejercita practicamente toda la superficie 1.0 de la libreria en un solo proyecto coherente. Esa es la meta: no memorizar metodos, sino saber combinarlos para construir algo real.",
      },
      milestone:
        "Completaste el tributo: un Pac-Man fiel, con reglas y score, construido de cero a experto con grid-canvas-system.",
      interactive: {
        description:
          "El juego completo corre aqui mismo. Muevete con las flechas o WASD, Enter para empezar, P para pausar. Abrelo en el Playground para leer y editar las mas de 900 lineas comentadas.",
        files: {
          html: PACMAN_GAME_HTML,
          javascript: PACMAN_GAME_JS_ES,
        },
        kind: "playground",
        title: "Juega el Pac-Man completo",
      },
      resources: [
        {
          href: `${repoUrl}/tree/main/examples/vanilla/tilemap-scene`,
          label: "Ejemplo tilemap + escenas",
        },
        {
          href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
          label: "Contrato de API publica",
        },
        { href: `${repoUrl}/blob/main/docs/MIGRATION.md`, label: "Guia de migracion" },
      ],
    },
  ],
};

const en: PacmanTutorial = {
  audience:
    "Perfect if you already know the canvas basics and want a big project, faithful to the original arcade, that uses EVERY piece of the library in a single playable game.",
  coverage: [
    "Tilemaps + collisions",
    "Cell-based movement",
    "4-ghost AI",
    "Scatter / chase / frightened",
    "Classic score & rules",
    "Scene manager + fixed loop",
    "Pixel Sprite v2",
    "Arcade audio",
  ],
  duration: "120 min",
  outcomes: [
    "Model the maze as a tilemap and move cell by cell with exact turns at every junction.",
    "Implement the four ghosts with their classic personalities and the scatter/chase/frightened cycle.",
    "Reproduce the arcade rules and score: pellets, energizers, ghost chain, fruit, lives and levels.",
    "Tie it all together with a scene manager, a deterministic fixed-step loop, compiled pixel art and audio.",
  ],
  prerequisites: [
    "Having done the Basic track or being comfortable with new GridCanvasSystem, clearCanvas and the loop.",
    "Understanding arrays, objects and functions in modern JavaScript.",
    "A willingness to read: this is a long project and every decision is explained.",
  ],
  project: {
    deliverables: [
      "A maze drawn with drawTileMap and collisions against solid tiles.",
      "Pac-Man with cell-based movement, animated chomp and a side tunnel.",
      "Blinky, Pinky, Inky and Clyde with targeting AI and scatter/chase/frightened modes.",
      "A faithful score (10 / 50 / 200-1600 / fruit), lives, energizers and level progression.",
      "Menu, READY!, pause and game over with a scene manager, a fixed-step loop and arcade audio.",
    ],
    description:
      "We are going to build a complete, faithful Pac-Man, step by step, on top of grid-canvas-system. This is not a demo: it includes rules, scoring, ghost AI, energizers, fruit, lives and levels. Each step adds a layer and explains why it exists, until we finish with the whole game running inside the Playground.",
    label: "Flagship project",
    title: "A complete Pac-Man, from zero to expert",
  },
  summary:
    "Build a Pac-Man faithful to the arcade, with rules, score and ghost AI, using tilemaps, cell-based movement, a scene manager, a fixed-step loop, compiled pixel art and audio: a tour of the whole library in a single game.",
  tagline: "The project that uses the whole library in a real game.",
  title: "Pac-Man: the definitive step-by-step tribute",
  version: libraryVersion,
  steps: [
    {
      id: "vision",
      title: "What you will build and the rules of the original",
      question: "What makes a Pac-Man feel faithful and not just a demo?",
      minutes: "10 min",
      body: [
        "Before writing any code it helps to be clear about the goal. We are not making a circle that eats dots: we are reproducing the rules that make Pac-Man feel like the 1980 arcade. That means a real maze, four ghosts with distinct personalities, energizers that reverse the hunt, an exact scoring system, bonus fruit, lives and levels that speed up.",
        "The faithful rules we will implement: each pellet is worth 10 and each energizer 50. Eating an energizer sends the ghosts into panic (frightened), and eating them is worth 200, 400, 800 and 1600 in a chain. Fruit gives a bonus. You lose a life if a ghost touches you outside of panic; you start with 3 lives and get an extra one at 10,000 points. When you eat every pellet you go up a level and everything speeds up.",
        "The architecture is also faithful to how these games are built: a scene manager governs the flow (menu, READY!, play, pause, game over); a fixed-step loop makes the simulation deterministic; the maze is a tilemap; and each actor moves cell by cell, turning only at tile centers. On top of that we layer AI, score, pixel art and audio.",
      ],
      why: {
        title: "Why fixed-step and scenes",
        text: "The ghost AI and the collisions need a stable rhythm to be reproducible: that's why createFixedStepLoop instead of a variable loop. And because the game has very different states (menu, play, pause, dying), a createSceneManager avoids the classic tangle of boolean flags inside a single loop.",
      },
      diagram: {
        title: "The layers of the game",
        caption:
          "Each layer builds on the previous one. We will build from the bottom up: the board first, the scene flow and audio last.",
        source: `flowchart TB
  A["createFixedStepLoop: deterministic clock"] --> B["createSceneManager: menu / play / pause / game over"]
  B --> C["Tilemap: maze + collisions"]
  C --> D["Cell-based actors: Pac-Man and 4 ghosts"]
  D --> E["Rules: score, energizers, fruit, lives, levels"]
  E --> F["Pixel art + HUD + arcade audio"]`,
      },
      checklist: [
        "Read the rules table: 10, 50, 200-1600, fruit, 3 lives, extra at 10,000, levels that speed up.",
        "Identify the 6 layers in the diagram: clock, scenes, tilemap, actors, rules, presentation.",
        "Open the final game in the last step to see where we are going before starting.",
      ],
      milestone:
        "You have the mental map of the project: you know which rules to respect and in what order we will build.",
      resources: [
        { href: "/docs/#quick-start", label: "Library quick start" },
        {
          href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
          label: "Public API contract",
        },
      ],
    },
    {
      id: "tablero",
      title: "The maze as a tilemap",
      question: "How do we turn a text drawing into a playable board?",
      minutes: "14 min",
      body: [
        "The maze is the heart of the game, and the clearest way to describe it is as text: a list of rows where each character is a tile. We use '#' for wall, '.' for pellet, 'o' for energizer, ' ' for empty and '-' for the ghost house door. Every row is the same length (28 columns), because drawTileMap requires a rectangular map.",
        "To draw it we pass that map to drawTileMap together with a tileset. The key trick: only the wall has a color definition. drawTileMap ignores any character that is not in the tileset, so pellets, energizers and empties are not painted as tiles; we will draw them separately in the next step. With origin we shift the maze down to leave room for the HUD.",
        "We set the canvas to black and make the grid color transparent so clearCanvas leaves us a clean background with no lines. The canvas size derives from the map: width = columns x TILE, height = top HUD + rows x TILE + bottom HUD.",
      ],
      why: {
        title: "Data and drawing, separated",
        text: "The map is just text: easy to read, edit and version. drawTileMap translates that text into pixels. Keeping the description (the map) separate from the render (the tileset) lets you recolor the maze, generate levels or debug collisions without touching the drawing engine.",
      },
      code: `const RAW_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  // ...rest of the maze (28 rows of 28 columns)...
  "############################",
];

const TILE = 16;
const ORIGIN = { x: 0, y: 48 };

const grid = new GridCanvasSystem("canvas", {
  width: RAW_MAZE[0].length * TILE,
  height: 48 + RAW_MAZE.length * TILE + 32,
  cellSize: TILE,
  backgroundColor: "#000000",
  gridColor: "transparent",
  gridLabelColor: "transparent",
});

// Only "#" has a color: drawTileMap ignores pellets, empties and energizers.
GridCanvasSystem.runtime.drawTileMap(RAW_MAZE, { "#": "#1414c8", "-": "#ff9cc8" }, {
  grid,
  tileSize: TILE,
  origin: ORIGIN,
});`,
      codeTitle: "Describe the maze and paint it with drawTileMap",
      diagram: {
        title: "From text to tiles",
        caption:
          "Each character takes a TILE x TILE cell. The tileset decides which characters are painted and in what color.",
        source: `flowchart LR
  A["Rows of text"] --> B["drawTileMap(map, tileset, opts)"]
  C["Tileset: wall only"] --> B
  B --> D["Blue walls on the canvas"]
  A --> E["'.', 'o', ' ' left to draw separately"]`,
      },
      expected: {
        text: "You see the blue maze on a black background, with a central hole (the ghost house) and a side corridor (the tunnel). There are no pellets yet: that comes in the next step.",
      },
      checklist: [
        "Define RAW_MAZE with rows of equal length and verify it is rectangular.",
        "Create the black canvas with a transparent gridColor.",
        "Call drawTileMap with a tileset that only defines the wall.",
      ],
      milestone:
        "The board exists: a real tilemap that will later provide structure and collisions.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
          label: "Tilemap source",
        },
        { href: "/docs/#tilemaps", label: "Tilemap docs" },
      ],
    },
    {
      id: "puntos",
      title: "Pellets, energizers and the counter",
      question: "How do we draw and eat the 228 pellets without messing up the map?",
      minutes: "12 min",
      body: [
        "The maze holds 228 pellets and 4 energizers. We draw them by walking the map and using tileToBounds to get the exact center of each cell: a pellet is a small circle; an energizer is a larger circle that pulses with oscillate01 to draw the eye.",
        "Eating is changing the map. Since the map is made of strings, we use setTileAt, which returns a new map with that cell turned into empty. It is immutable on purpose: we always work with clean data and never mutate strings by hand. Each pellet adds 10 and each energizer 50 (plus it triggers panic mode, which we will see later).",
        "The pelletsLeft counter starts at 228 and drops with each bite. When it reaches zero, the level is complete. That counter is the win condition of every level.",
      ],
      why: {
        title: "Immutable setTileAt",
        text: "setTileAt does not touch the original array: it returns a new one. That avoids subtle bugs when other parts of the engine read the map in the same frame, and keeps the board state easy to reason about. The cost is minimal because eating happens at most once per frame.",
      },
      code: `let maze = RAW_MAZE.slice();
let pelletsLeft = 228;

function eatAt(col, row) {
  const ch = maze[row].charAt(col);
  if (ch !== "." && ch !== "o") return;
  maze = GridCanvasSystem.runtime.setTileAt(maze, { column: col, row: row }, " ");
  pelletsLeft -= 1;
  if (ch === ".") { score += 10; }
  else { score += 50; triggerFrightened(); }
}

// Draw each pellet at the exact center of its cell:
const b = GridCanvasSystem.runtime.tileToBounds(
  { column: c, row: r },
  { tileSize: TILE, origin: ORIGIN }
);
const cx = b.x + b.width / 2;
const cy = b.y + b.height / 2;
if (ch === "o") {
  const r = 3 + GridCanvasSystem.runtime.oscillate01(time, 3) * 2; // pulses
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}`,
      codeTitle: "Draw and eat pellets with tileToBounds and setTileAt",
      diagram: {
        title: "The cycle of a bite",
        caption:
          "We read the cell character, add score and return a new map with that cell empty.",
        source: `flowchart LR
  A["Pac-Man reaches (col, row)"] --> B["maze[row].charAt(col)"]
  B --> C{"'.' or 'o'?"}
  C -->|pellet| D["score += 10"]
  C -->|energizer| E["score += 50 + frightened"]
  D --> F["setTileAt -> new map"]
  E --> F
  F --> G["pelletsLeft -= 1"]`,
      },
      expected: {
        text: "The maze fills with cream-colored pellets and the four energizers pulse in the corners. As you run through it (in the final game) the pellets disappear and the counter drops.",
      },
      checklist: [
        "Walk the map and draw every '.' and 'o' using tileToBounds to center them.",
        "Make the energizer pulse with oscillate01.",
        "Implement eatAt with setTileAt and update score and pelletsLeft.",
      ],
      milestone:
        "The board now has a goal: pellets that are eaten, counted and worth score.",
      resources: [
        { href: "/docs/#pixel-sprites", label: "Drawing and helper docs" },
        {
          href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
          label: "getTileAt / setTileAt / tileToBounds",
        },
      ],
    },
    {
      id: "movimiento",
      title: "Pac-Man moves cell by cell",
      question: "How do we get perfect turns that respect the maze?",
      minutes: "16 min",
      body: [
        "Classic Pac-Man movement is not free: actors slide in pixels but can only change direction at the center of a tile, and only into cells that are not walls. We model Pac-Man as a pixel position that 'hops' from tile center to tile center: every time he reaches a center, we decide the next turn.",
        "Input uses createKeyTracker over grid.canvas. We store the desired direction (want) and at every junction we try to turn toward it; if it is blocked, we keep going straight; if that is a wall too, we stop. We also allow the instant reverse mid-tile, like the original. And the side tunnel: when you exit through an edge on the tunnel row, you appear on the other side.",
        "To draw him we use drawPacman, which already supports direction (where the mouth points) and an opening value 0..1. We animate the chomp with oscillate01 while Pac-Man moves, and close it when he is still.",
      ],
      why: {
        title: "Why move by cells",
        text: "Turning only at tile centers is what makes Pac-Man 'snap' into the maze and what makes the ghost AI predictable. If you moved in free pixels you would have to solve continuous collisions and the arcade feel would be lost.",
      },
      code: `const keys = GridCanvasSystem.runtime.createKeyTracker(grid.canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
});

// Each frame we store the requested direction:
if (keys.isPressed("ArrowLeft")) pac.want = LEFT;
else if (keys.isPressed("ArrowUp")) pac.want = UP; // etc.

// When reaching a tile center we decide the turn:
function arrivePac() {
  const t = tileOf(pac);
  eatAt(t.col, t.row);
  if (!isWall(t.col + pac.want.x, t.row + pac.want.y)) pac.dir = pac.want; // requested turn
  else if (isWall(t.col + pac.dir.x, t.row + pac.dir.y)) pac.dir = STOP;   // wall: stop
  pac.target = centerOf(t.col + pac.dir.x, t.row + pac.dir.y);
}

grid.drawPacman(pac.x, pac.y, TILE * 0.62, GridCanvasSystem.runtime.oscillate01(pac.anim, 1), {
  direction: pac.facing, // 0, PI/2, PI or -PI/2 based on pac.dir
  fillColor: "#ffe600",
});`,
      codeTitle: "Cell-based movement with a turn at the center",
      diagram: {
        title: "Hop from center to center",
        caption:
          "Between two centers the movement is straight. The decision to turn happens only when reaching a tile center.",
        source: `flowchart LR
  A["Move toward the target center"] --> B{"Reached the center?"}
  B -->|no| A
  B -->|yes| C["Eat the pellet in this cell"]
  C --> D{"want open?"}
  D -->|yes| E["Turn toward want"]
  D -->|no| F{"dir open?"}
  F -->|yes| G["Keep going straight"]
  F -->|no| H["Stop"]`,
      },
      expected: {
        text: "Pac-Man runs the corridors with clean turns, never crosses walls, opens and closes his mouth while moving, and reappears on the other side when entering the tunnel.",
      },
      checklist: [
        "Connect createKeyTracker and store the desired direction each frame.",
        "Implement the turn only at the tile center and the wall blocking.",
        "Draw with drawPacman using direction and oscillate01 for the chomp.",
      ],
      milestone: "You now control Pac-Man with exact arcade turns and a side tunnel.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createKeyTracker.ts`,
          label: "createKeyTracker source",
        },
        { href: "/docs/#input-motion", label: "Input and motion docs" },
      ],
    },
    {
      id: "hud-fruta",
      title: "Score, lives and fruit with compiled pixel art",
      question: "How do we show state and create assets without loading images?",
      minutes: "12 min",
      body: [
        "An arcade needs a HUD. With drawValueLabel we show SCORE, HIGH and the level; with drawBarIndicator we draw the energizer bar while panic lasts. These are text and bar helpers that already handle fonts and alignment.",
        "Lives and fruit are created as compiled pixel art. We define a palette with createPixelPalette and compile a character matrix with compilePixelSprite once; then we draw it many times with drawCompiledPixelSprite without revalidating rows or colors every frame. The bonus cherry appears after eating a certain number of pellets and gives extra points.",
        "The sprite module ships more pure tools that are gold for variants: flipPixelSpriteX/Y to flip, tintPixelSprite to recolor a compiled sprite, and getPixelSpriteBounds / hitTestPixelSprite to measure and interact. We don't need all of them in Pac-Man, but knowing they exist saves you from drawing every variant by hand.",
      ],
      why: {
        title: "Compile once, draw a thousand times",
        text: "compilePixelSprite turns the text matrix into a list of pixels with the color already resolved (and drops the transparent ones). Inside the loop, drawCompiledPixelSprite only paints rectangles: it is the recommended Pixel Sprite v2 pattern for anything repeated frame after frame.",
      },
      code: `const palette = GridCanvasSystem.createPixelPalette({
  "0": "transparent", "1": "#ff0000", "2": "#00d43b", "3": "#ffffff",
});
const cherry = GridCanvasSystem.compilePixelSprite([
  "00000020", "00000200", "00003200", "00113110",
  "01111110", "11311131", "11111111", "01111110",
], palette);
const lifeIcon = GridCanvasSystem.compilePixelSprite(
  ["01110", "11100", "11000", "11100", "01110"],
  GridCanvasSystem.createPixelPalette({ "0": "transparent", "1": "#ffe600" }),
);

grid.drawValueLabel("1UP", score, 12, 20, { color: "#ffffff", font: "14px 'Geist Pixel', monospace" });
for (let i = 0; i < lives; i++) {
  grid.drawCompiledPixelSprite(lifeIcon, { x: 12 + i * 26, y: hudY, pixelSize: 4 });
}
if (frightenedTime > 0) {
  grid.drawBarIndicator("PWR", x, y, 100, 12, frightenedTime, maxTime, {
    fillColor: "#2121ff", textColor: "#ffffff",
  });
}`,
      codeTitle: "HUD with helpers and assets with Pixel Sprite v2",
      expected: {
        text: "At the top you see SCORE, HIGH and the level. At the bottom, a yellow icon for each life. When you eat an energizer the PWR bar appears and, later, a cherry in the center of the maze.",
      },
      checklist: [
        "Compile the cherry and the life icon once with compilePixelSprite.",
        "Draw SCORE / HIGH / level with drawValueLabel and lives with drawCompiledPixelSprite.",
        "Show the energizer bar with drawBarIndicator only when frightenedTime > 0.",
      ],
      milestone:
        "The game communicates its state: score, lives, level and the energizer timer.",
      resources: [
        { href: "/docs/#pixel-sprites", label: "Pixel Sprite v2 docs" },
        {
          href: `${repoUrl}/blob/main/src/drawing/pixelSprite.ts`,
          label: "Pixel sprite source",
        },
      ],
    },
    {
      id: "fantasmas",
      title: "The four ghosts and their modes",
      question: "How do we organize a ghost's states without going crazy?",
      minutes: "16 min",
      body: [
        "Blinky (red), Pinky (pink), Inky (cyan) and Clyde (orange) are drawn with drawGhost, which already brings a body, eyes and configurable pupils. But the interesting part is not how they look, but how they think: each ghost lives in a state machine with six modes: house, leaving, scatter, chase, frightened and eaten.",
        "We model each mode with createStateMachine, which validates that transitions are legal (for example, from 'house' you can only go to 'leaving' or 'frightened'). That turns a tangle of flags into a clear contract: if you attempt an invalid transition, the machine rejects it.",
        "There is also a global scatter/chase rhythm that alternates every few seconds following the classic level 1 schedule. When the global mode changes, the active ghosts reverse their direction at once, exactly like the arcade. The release from the house is staggered: Blinky leaves immediately, the others with a delay.",
      ],
      why: {
        title: "Explicit states, fewer bugs",
        text: "A ghost that chases, flees, returns home as eyes and waits in the house has very different behaviors. createStateMachine makes explicit which transitions exist, so you never end up with a ghost 'fleeing and eaten at the same time'. State is king; drawing and AI only read it.",
      },
      code: `function makeGhost(name) {
  const machine = GridCanvasSystem.runtime.createStateMachine({
    initial: "house",
    transitions: {
      house: ["leaving", "frightened"],
      leaving: ["scatter", "chase"],
      scatter: ["chase", "frightened", "eaten"],
      chase: ["scatter", "frightened", "eaten"],
      frightened: ["scatter", "chase", "eaten"],
      eaten: ["house"],
    },
  });
  return { name, machine, color: GHOST_COLORS[name] /* x, y, dir... */ };
}

const MODE_SCHEDULE = [
  { mode: "scatter", dur: 7 }, { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 7 }, { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 }, { mode: "chase", dur: Infinity },
];

grid.drawGhost({ x: ghost.x, y: ghost.y }, TILE * 0.62, {
  fillColor: ghost.color, eyeColor: "#ffffff", pupilColor: "#1414c8",
});`,
      codeTitle: "A ghost is a state machine",
      diagram: {
        title: "Scatter / chase cycle",
        caption:
          "The global mode alternates over time. When it changes, the active ghosts reverse their direction.",
        source: `flowchart LR
  A["scatter 7s"] --> B["chase 20s"]
  B --> C["scatter 7s"]
  C --> D["chase 20s"]
  D --> E["scatter 5s"]
  E --> F["chase (rest of the level)"]`,
      },
      expected: {
        text: "The four ghosts leave the house in a staggered way and alternate between scattering to their corners (scatter) and chasing you (chase). Each one with its color.",
      },
      checklist: [
        "Create each ghost with its createStateMachine and its six modes.",
        "Define the MODE_SCHEDULE and apply the global scatter/chase change with a reverse.",
        "Draw each ghost with drawGhost using its color.",
      ],
      milestone:
        "The ghosts exist, leave the house and alternate modes with clear rules.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createStateMachine.ts`,
          label: "createStateMachine source",
        },
        { href: "/docs/#state-sprites", label: "State and sprites docs" },
      ],
    },
    {
      id: "ia",
      title: "Classic AI: each ghost thinks differently",
      question: "Why does Blinky chase you and Clyde seem cowardly?",
      minutes: "16 min",
      body: [
        "The magic of Pac-Man is that the four ghosts share the same algorithm but pick different targets. At every junction, a ghost looks at its exits (without being able to turn back) and picks the one that gets it closest to its target tile. By changing only the target, you get four personalities.",
        "Blinky aims straight at your tile: he chases you head-on. Pinky aims 4 tiles ahead of you to ambush you (and includes the famous overflow bug when you look up). Inky combines your position with Blinky's to close you in from the other side. Clyde chases you only when he is far; if you get closer than 8 tiles, he flees to his corner: that's why he seems shy.",
        "In scatter mode each ghost goes to its fixed corner. In frightened it picks random directions. In eaten (eaten) its target is the house door to revive. The same decision loop serves every mode: only the target changes.",
      ],
      why: {
        title: "One algorithm, four minds",
        text: "Reusing 'pick the exit that minimizes the distance to the target' and only varying the target is a design lesson: emergent behavior from a simple rule. It is also what makes the game fair and learnable.",
      },
      code: `function ghostTarget(ghost) {
  const p = tileOf(pac);
  const state = ghost.machine.getState();
  if (state === "scatter" || state === "frightened") return SCATTER[ghost.name];
  if (state === "eaten") return EXIT_TILE;
  if (ghost.name === "blinky") return p;                          // chases directly
  if (ghost.name === "pinky") {                                    // ambushes 4 ahead
    return { col: p.col + pac.dir.x * 4, row: p.row + pac.dir.y * 4 };
  }
  if (ghost.name === "inky") {                                     // reflects Blinky
    const b = tileOf(blinky);
    const pivotC = p.col + pac.dir.x * 2, pivotR = p.row + pac.dir.y * 2;
    return { col: pivotC * 2 - b.col, row: pivotR * 2 - b.row };
  }
  const d = Math.hypot(gCol - p.col, gRow - p.row);                // clyde: shy
  return d > 8 ? p : SCATTER.clyde;
}

// At each junction: pick the exit (no reverse) closest to the target.
options.forEach((dir) => {
  const dist2 = distanceToTargetSquared(tile, dir, goal);
  if (dist2 < best) { best = dist2; chosen = dir; }
});`,
      codeTitle: "The target defines the personality",
      diagram: {
        title: "Four targets, one algorithm",
        caption:
          "They all pick the exit closest to their target. Only where that target is changes.",
        source: `flowchart TB
  P["Pac-Man's tile"] --> B["Blinky: your tile"]
  P --> K["Pinky: 4 tiles ahead"]
  P --> I["Inky: reflection via Blinky"]
  P --> C["Clyde: far chases / near flees"]
  B --> G["Pick the exit that minimizes distance"]
  K --> G
  I --> G
  C --> G`,
      },
      expected: {
        text: "Blinky follows you closely, Pinky tries to cut you off, Inky shows up by surprise and Clyde backs away when you are close. It feels like the arcade.",
      },
      checklist: [
        "Implement ghostTarget with each character's target.",
        "At each junction pick the no-reverse exit closest to the target.",
        "Use different targets for scatter, frightened and eaten.",
      ],
      milestone:
        "You have faithful AI: four personalities emerge from a single decision rule.",
      resources: [
        {
          href: `${repoUrl}/blob/main/examples/vanilla/tilemap-scene`,
          label: "Tilemap + scenes demo",
        },
        { href: "/docs/#input-motion", label: "Distance and vector helpers" },
      ],
    },
    {
      id: "energizante",
      title: "The energizer: when the hunt reverses",
      question: "How do we implement panic, the point chain and the trip back home?",
      minutes: "16 min",
      body: [
        "Eating an energizer changes everything: all active ghosts enter frightened, reverse their direction, become slower and blue, and blink when time is running out. During that window, touching them no longer kills you: you eat them.",
        "Eating ghosts in a chain gives 200, 400, 800 and 1600 points, doubling for each one within the same energizer. When you eat one, it becomes eaten: it turns into a pair of eyes that travel through the maze back to the house, where it revives. We show a bar with drawBarIndicator and a floating score at the point of impact.",
        "For visual feedback we use particles: createParticleBurst generates a burst of particles and stepParticles integrates them frame by frame (with decaying life). It is the same scene toolbox the library offers for trails and effects, applied to the satisfaction of eating a ghost.",
      ],
      why: {
        title: "The eaten state closes the cycle",
        text: "Separating 'frightened' from 'eaten' is key: an eaten ghost must not be able to kill you or be re-eaten, and must ignore the panic timer to return home. The state machine makes that distinction trivial and bug-proof.",
      },
      code: `function triggerFrightened() {
  frightenedTime = frightenedDuration(); // drops with the level
  ghostChain = 0;
  ghosts.forEach((g) => {
    const s = g.machine.getState();
    if (s === "scatter" || s === "chase") { g.machine.transition("frightened"); reverse(g); }
  });
}

// Collision with a blue ghost: chain 200, 400, 800, 1600...
ghostChain += 1;
score += 200 * Math.pow(2, ghostChain - 1);
g.machine.transition("eaten");                 // returns as eyes to the house

// Particle burst as feedback:
const burst = GridCanvasSystem.runtime.createParticleBurst({ x, y }, 12, { speed: 90, life: 0.6 });
particles = particles.concat(burst);
particles = GridCanvasSystem.runtime.stepParticles(particles, step);`,
      codeTitle: "Panic, point chain and the trip home",
      diagram: {
        title: "The energizer cycle",
        caption:
          "The energizer triggers frightened; eating a ghost sends it to eaten; at home it revives and returns to the hunt.",
        source: `flowchart LR
  A["Eat energizer"] --> B["Ghosts -> frightened + reverse"]
  B --> C{"Pac touches them?"}
  C -->|yes| D["score x2 chained + eaten"]
  D --> E["Eyes return to the house"]
  E --> F["Revive -> scatter/chase"]
  B -->|time runs out| F`,
      },
      expected: {
        text: "When you eat an energizer the ghosts turn blue and flee. If you catch them, you see the floating score and a shower of particles, and their eyes return to the house.",
      },
      checklist: [
        "Implement triggerFrightened: transition to frightened and reverse direction.",
        "Add the 200/400/800/1600 chain and move the ghost to eaten.",
        "Add particles with createParticleBurst and stepParticles.",
      ],
      milestone:
        "The energizer works: panic, point chain, returning eyes and juicy feedback.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/scene.ts`,
          label: "Particles and trails source",
        },
        { href: "/docs/#input-motion", label: "Scene and feedback docs" },
      ],
    },
    {
      id: "vidas-niveles",
      title: "Lives, death and level progression",
      question: "What happens when you get caught and when you clear the board?",
      minutes: "14 min",
      body: [
        "If a ghost in scatter or chase touches you, you lose a life. We start with 3 and grant an extra one at 10,000 points. Death elegantly reuses drawPacman: we sweep the mouth opening from 0 to 1 to reproduce Pac-Man's iconic vanishing animation, and then we reset positions or go to game over.",
        "When pelletsLeft reaches zero, the level is cleared: we go up a level, rebuild the maze and speed up. Each level Pac-Man and the ghosts go a bit faster, and the energizer time shortens: the difficulty grows faithfully to the original.",
        "All of this lives in a few functions (killPac, finishDeath, startLevel) that the main update orchestrates. Keeping them small and single-purpose makes the life/death/level flow easy to follow.",
      ],
      why: {
        title: "Reuse drawPacman to die",
        text: "You don't need a separate death sprite: drawPacman already accepts a mouth opening 0..1. By interpolating that opening over time you get the classic animation for free. It is an example of squeezing a library primitive instead of adding assets.",
      },
      code: `// Collision Pac vs ghost
if (state === "frightened") eatGhost(g);
else killPac();                                 // starts the death

function killPac() { pac.dying = 1.1; stopSiren(); }

// Death opens the mouth to the max with drawPacman:
const mouth = Math.min(1, (1 - pac.dying / 1.1) * 1.4);
grid.drawPacman(pac.x, pac.y, TILE * 0.62, mouth, { direction: pac.facing, fillColor: "#ffe600" });

function finishDeath() {
  lives -= 1;
  if (lives < 0) manager.transition("gameover");
  else { resetActors(); manager.transition("ready"); }
}

// Level cleared
if (pelletsLeft <= 0) { level += 1; startLevel(); manager.transition("ready"); }`,
      codeTitle: "Death, lives and level up",
      expected: {
        text: "When caught, Pac-Man plays his death animation and you lose a life. When you eat the last pellet, the level restarts faster and with less energizer time.",
      },
      checklist: [
        "Distinguish eating a ghost (frightened) from dying (scatter/chase).",
        "Animate death by sweeping the drawPacman opening.",
        "Go up a level when pelletsLeft = 0 and speed up the game.",
      ],
      milestone:
        "The game now has consequences: you die, lose lives, level up and earn an extra life.",
      resources: [
        { href: "/docs/#arcade-primitives", label: "Arcade primitives (drawPacman)" },
        { href: `${repoUrl}/blob/main/CHANGELOG.md`, label: "Release notes" },
      ],
    },
    {
      id: "escenas-audio",
      title: "Scene flow, global input and audio",
      question: "How do we join menu, play and pause without a tangle of flags?",
      minutes: "14 min",
      body: [
        "The game has very different high-level states: the menu, the pre-game READY!, the play, the pause and the game over. Instead of scattered flags, we use createSceneManager: each scene declares its own enter, update, draw and exit, and transitions are explicit. The play scene runs the simulation; the others just draw and wait for a key.",
        "The global input (Enter to start/restart, P to pause) also goes through createKeyTracker, detecting the key edge so the action does not repeat every frame. And the arcade audio (createArcadeAudio) plays here: the siren looping during play, and effects when eating pellets, energizers or ghosts. Because browsers block audio until a user gesture, we unlock it on the first Enter.",
        "It is all driven by a single createFixedStepLoop: in update we read input and advance the active scene with a fixed step (1/60); in draw we paint that scene. That deterministic clock is what makes the AI and collisions behave the same on any machine.",
      ],
      why: {
        title: "Scenes + clock = order",
        text: "createSceneManager takes the 'which screen am I on' logic out of the loop, and createFixedStepLoop guarantees a stable rhythm. Together they turn a game with many states into something modular and testable, instead of one giant loop full of ifs.",
      },
      code: `const manager = GridCanvasSystem.runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu:     { draw: drawMenu },
    ready:    { update: countdown, draw: drawReady },
    play:     { update: updatePlay, draw: renderScene, exit: stopSiren },
    paused:   { draw: drawPaused },
    gameover: { enter: stopSiren, draw: drawGameOver },
  },
});

const audio = createArcadeAudio({ masterVolume: 0.4 }); // already exists in the Playground

GridCanvasSystem.runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  maxUpdatesPerFrame: 5,
  update: (step) => { readInput(); manager.update(step); },
  draw: () => manager.draw(ctx),
});`,
      codeTitle: "Scene manager + fixed-step loop",
      diagram: {
        title: "The scene graph",
        caption:
          "Each arrow is an explicit scene manager transition. The fixed-step loop feeds the active scene.",
        source: `flowchart LR
  M["menu"] -->|Enter| R["ready"]
  R -->|count 0| P["play"]
  P -->|P| PA["paused"]
  PA -->|P| P
  P -->|no lives| G["gameover"]
  G -->|Enter| M
  P -->|board cleared| R`,
      },
      callout: {
        title: "Browser note",
        text: "Audio does not start on its own: browsers require a user gesture. That's why we call audio.resume() on the first Enter and only then the siren and effects play.",
      },
      expected: {
        text: "The menu shows PAC-MAN; Enter starts with READY!; P pauses and resumes; when you lose all lives GAME OVER appears and Enter returns to the menu. The siren plays during the game.",
      },
      checklist: [
        "Declare the menu/ready/play/paused/gameover scenes with createSceneManager.",
        "Detect Enter and P on the edge with createKeyTracker and unlock the audio.",
        "Orchestrate everything with createFixedStepLoop calling update and draw.",
      ],
      milestone:
        "The game has a complete flow: menu, play, pause, game over and audio, all deterministic.",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createSceneManager.ts`,
          label: "createSceneManager source",
        },
        {
          href: `${repoUrl}/blob/main/src/runtime/createFixedStepLoop.ts`,
          label: "createFixedStepLoop source",
        },
      ],
    },
    {
      id: "juego-completo",
      title: "The complete Pac-Man: run it",
      question: "How does it all look, running together?",
      minutes: "20 min",
      body: [
        "Here is the whole game, ready to run in the Playground. It brings together everything we built: the maze as a tilemap, cell-based movement with a tunnel, the four ghosts with their AI and modes, the energizer with a point chain and returning eyes, the fruit, the HUD with pixel art, the faithful score, the lives, the levels that speed up, the scene manager, the fixed-step loop and the arcade audio.",
        "Controls: arrows or WASD to move, Enter to start and restart, P to pause. Click the canvas if the keyboard does not respond (to give it focus). Read the code calmly: each section is numbered and commented following the order of this tutorial.",
        "To take it further, the library lets you grow without rewriting: swap createArcadeAudio for the Howler and Tone adapters (grid-canvas-system/audio) for real music; use createSpriteAnimator if you want hand-drawn death frames; and take advantage of MassBody, appendTrailPoint or the collision helpers for new effects. The small, stable core already supports all of that.",
      ],
      why: {
        title: "From zero to expert",
        text: "You started with an empty canvas and ended with a faithful arcade that exercises practically the entire 1.0 surface of the library in a single coherent project. That is the goal: not to memorize methods, but to know how to combine them to build something real.",
      },
      milestone:
        "You completed the tribute: a faithful Pac-Man, with rules and score, built from zero to expert with grid-canvas-system.",
      interactive: {
        description:
          "The complete game runs right here. Move with the arrows or WASD, Enter to start, P to pause. Open it in the Playground to read and edit the 900+ commented lines.",
        files: {
          html: PACMAN_GAME_HTML,
          javascript: PACMAN_GAME_JS_EN,
        },
        kind: "playground",
        title: "Play the complete Pac-Man",
      },
      resources: [
        {
          href: `${repoUrl}/tree/main/examples/vanilla/tilemap-scene`,
          label: "Tilemap + scenes example",
        },
        {
          href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
          label: "Public API contract",
        },
        { href: `${repoUrl}/blob/main/docs/MIGRATION.md`, label: "Migration guide" },
      ],
    },
  ],
};

const ja: PacmanTutorial = {
  audience:
    "キャンバスの基礎を知っていて、原作アーケードに忠実で、ライブラリのすべての機能を1つの遊べるゲームで使う大きなプロジェクトが欲しい人に最適。",
  coverage: [
    "タイルマップ + 衝突",
    "セル単位の移動",
    "4体のゴーストAI",
    "スキャッター / チェイス / フライト",
    "クラシックなスコアとルール",
    "シーンマネージャ + 固定ループ",
    "Pixel Sprite v2",
    "アーケード音声",
  ],
  duration: "120分",
  outcomes: [
    "迷路をタイルマップとしてモデル化し、各分岐で正確に曲がりながらセル単位で移動する。",
    "4体のゴーストをクラシックな性格とスキャッター/チェイス/フライトのサイクルで実装する。",
    "アーケードのルールとスコアを再現する: ドット、パワーエサ、ゴーストの連鎖、フルーツ、残機、レベル。",
    "シーンマネージャ、決定論的な固定ステップループ、コンパイル済みピクセルアート、音声で全体をまとめる。",
  ],
  prerequisites: [
    "Basic トラックを終えているか、new GridCanvasSystem・clearCanvas・ループに慣れていること。",
    "モダンな JavaScript の配列・オブジェクト・関数を理解していること。",
    "読む意欲: これは長いプロジェクトで、あらゆる判断を解説します。",
  ],
  project: {
    deliverables: [
      "drawTileMap で描いた迷路と、ソリッドタイルへの衝突。",
      "セル単位の移動・アニメするチョンプ・横トンネルを持つパックマン。",
      "ターゲティングAIとスキャッター/チェイス/フライトを持つ Blinky・Pinky・Inky・Clyde。",
      "忠実なスコア（10 / 50 / 200-1600 / フルーツ）、残機、パワーエサ、レベル進行。",
      "シーンマネージャ・固定ステップループ・アーケード音声によるメニュー・READY!・ポーズ・ゲームオーバー。",
    ],
    description:
      "grid-canvas-system の上に、原作に忠実な完全なパックマンをステップごとに作ります。これはデモではありません。ルール、スコア、ゴーストAI、パワーエサ、フルーツ、残機、レベルを含みます。各ステップで1つの層を足し、なぜそれが必要かを説明し、最後に Playground の中でゲーム全体が動くところまで到達します。",
    label: "フラッグシップ・プロジェクト",
    title: "完全なパックマン、ゼロからエキスパートまで",
  },
  summary:
    "タイルマップ、セル単位の移動、シーンマネージャ、固定ステップループ、コンパイル済みピクセルアート、音声を使って、ルール・スコア・ゴーストAIを備えたアーケードに忠実なパックマンを作る。1つのゲームでライブラリ全体を巡る旅。",
  tagline: "ライブラリ全体を実際のゲームで使うプロジェクト。",
  title: "パックマン: 決定版ステップバイステップ・トリビュート",
  version: libraryVersion,
  steps: [
    {
      id: "vision",
      title: "何を作るか、そして原作のルール",
      question: "忠実なパックマンと、ただのデモを分けるものは何か？",
      minutes: "10分",
      body: [
        "コードを書く前に、目標をはっきりさせておくと役立ちます。ドットを食べる円を作るのではありません。1980年のアーケードのように感じられるルールを再現します。つまり、本物の迷路、性格の異なる4体のゴースト、狩りを逆転させるパワーエサ、正確なスコアシステム、ボーナスフルーツ、残機、そして加速するレベルです。",
        "実装する忠実なルール: 各ドットは10点、各パワーエサは50点。パワーエサを食べるとゴーストはパニック（フライト）に入り、食べると連鎖で200・400・800・1600点。フルーツはボーナス。パニック以外でゴーストに触れると残機を失います。残機は3から始まり、10,000点で1つ増えます。すべてのドットを食べるとレベルが上がり、すべてが加速します。",
        "アーキテクチャも、この種のゲームの作り方に忠実です。シーンマネージャがフロー（メニュー、READY!、プレイ、ポーズ、ゲームオーバー）を統括し、固定ステップループがシミュレーションを決定論的にし、迷路はタイルマップで、各アクターはタイル中心でのみ曲がりながらセル単位で動きます。その上にAI、スコア、ピクセルアート、音声を重ねます。",
      ],
      why: {
        title: "なぜ固定ステップとシーンか",
        text: "ゴーストAIと衝突は再現可能であるために安定したリズムが必要です。だから可変ループではなく createFixedStepLoop を使います。そしてゲームには非常に異なる状態（メニュー、プレイ、ポーズ、死亡）があるので、createSceneManager が1つのループ内のブール値フラグの絡まりを防ぎます。",
      },
      diagram: {
        title: "ゲームの層",
        caption:
          "各層は前の層の上に成り立ちます。下から上へ作ります。最初に盤面、最後にシーンフローと音声。",
        source: `flowchart TB
  A["createFixedStepLoop: 決定論的な時計"] --> B["createSceneManager: メニュー / プレイ / ポーズ / ゲームオーバー"]
  B --> C["タイルマップ: 迷路 + 衝突"]
  C --> D["セル単位のアクター: パックマンと4体のゴースト"]
  D --> E["ルール: スコア、パワーエサ、フルーツ、残機、レベル"]
  E --> F["ピクセルアート + HUD + アーケード音声"]`,
      },
      checklist: [
        "ルール表を読む: 10、50、200-1600、フルーツ、残機3、10,000点で追加、加速するレベル。",
        "図の6つの層を見分ける: 時計、シーン、タイルマップ、アクター、ルール、表示。",
        "始める前に最後のステップの完成ゲームを開き、どこへ向かうか確認する。",
      ],
      milestone:
        "プロジェクトの見取り図が手に入りました。どのルールを守るか、どの順で作るかがわかります。",
      resources: [
        { href: "/docs/#quick-start", label: "ライブラリのクイックスタート" },
        {
          href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
          label: "公開APIコントラクト",
        },
      ],
    },
    {
      id: "tablero",
      title: "タイルマップとしての迷路",
      question: "テキストの絵を、どうやって遊べる盤面に変えるか？",
      minutes: "14分",
      body: [
        "迷路はゲームの心臓であり、それを表す最も明快な方法はテキストです。各文字が1タイルである行のリストです。'#' は壁、'.' はドット、'o' はパワーエサ、' ' は空き、'-' はゴーストハウスのドア。drawTileMap は長方形のマップを要求するので、すべての行は同じ長さ（28列）です。",
        "描くには、そのマップをタイルセットとともに drawTileMap に渡します。重要なコツ: 色の定義を持つのは壁だけです。drawTileMap はタイルセットにない文字を無視するので、ドット・パワーエサ・空きはタイルとして描かれません。それらは次のステップで別に描きます。origin で迷路を下にずらして HUD の場所を空けます。",
        "キャンバスを黒にし、グリッド色を透明にして、clearCanvas が線のないきれいな背景を残すようにします。キャンバスのサイズはマップから導きます: 幅 = 列数 x TILE、高さ = 上部HUD + 行数 x TILE + 下部HUD。",
      ],
      why: {
        title: "データと描画を分ける",
        text: "マップはただのテキストで、読みやすく、編集しやすく、バージョン管理しやすい。drawTileMap がそのテキストをピクセルに変換します。記述（マップ）を描画（タイルセット）から分けておくと、描画エンジンに触れずに迷路の色替え、レベル生成、衝突のデバッグができます。",
      },
      code: `const RAW_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  // ...迷路の残り（28列 x 28行）...
  "############################",
];

const TILE = 16;
const ORIGIN = { x: 0, y: 48 };

const grid = new GridCanvasSystem("canvas", {
  width: RAW_MAZE[0].length * TILE,
  height: 48 + RAW_MAZE.length * TILE + 32,
  cellSize: TILE,
  backgroundColor: "#000000",
  gridColor: "transparent",
  gridLabelColor: "transparent",
});

// "#" だけが色を持つ: drawTileMap はドット・空き・パワーエサを無視する。
GridCanvasSystem.runtime.drawTileMap(RAW_MAZE, { "#": "#1414c8", "-": "#ff9cc8" }, {
  grid,
  tileSize: TILE,
  origin: ORIGIN,
});`,
      codeTitle: "迷路を記述し、drawTileMap で描く",
      diagram: {
        title: "テキストからタイルへ",
        caption:
          "各文字は TILE x TILE のセルを占めます。タイルセットが、どの文字をどの色で描くかを決めます。",
        source: `flowchart LR
  A["テキストの行"] --> B["drawTileMap(map, tileset, opts)"]
  C["タイルセット: 壁のみ"] --> B
  B --> D["キャンバス上の青い壁"]
  A --> E["'.', 'o', ' ' は別に描く"]`,
      },
      expected: {
        text: "黒い背景の上に青い迷路が見え、中央に穴（ゴーストハウス）と横の通路（トンネル）があります。まだドットはありません。次のステップで描きます。",
      },
      checklist: [
        "同じ長さの行で RAW_MAZE を定義し、長方形であることを確認する。",
        "gridColor を透明にした黒いキャンバスを作る。",
        "壁だけを定義したタイルセットで drawTileMap を呼ぶ。",
      ],
      milestone: "盤面ができました。あとで構造と衝突をもたらす本物のタイルマップです。",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
          label: "タイルマップのソース",
        },
        { href: "/docs/#tilemaps", label: "タイルマップのドキュメント" },
      ],
    },
    {
      id: "puntos",
      title: "ドット、パワーエサ、そしてカウンター",
      question: "マップを崩さずに、どうやって228個のドットを描いて食べるか？",
      minutes: "12分",
      body: [
        "迷路には228個のドットと4個のパワーエサがあります。マップを走査し、tileToBounds で各セルの正確な中心を得て描きます。ドットは小さな円、パワーエサは注意を引くために oscillate01 で脈打つ大きめの円です。",
        "食べるとはマップを変えることです。マップは文字列なので setTileAt を使います。これはそのセルを空きに変えた新しいマップを返します。意図的にイミュータブルで、常にきれいなデータを扱い、文字列を手で書き換えません。各ドットは10点、各パワーエサは50点を加えます（さらにパニックモードを起動します。後述）。",
        "pelletsLeft カウンターは228から始まり、一口ごとに減ります。ゼロになるとレベルクリアです。このカウンターが各レベルの勝利条件です。",
      ],
      why: {
        title: "イミュータブルな setTileAt",
        text: "setTileAt は元の配列に触れず、新しい配列を返します。同じフレームでエンジンの別の部分がマップを読むときの微妙なバグを防ぎ、盤面の状態を考えやすく保ちます。食べるのは最大でも1フレームに1回なのでコストは最小です。",
      },
      code: `let maze = RAW_MAZE.slice();
let pelletsLeft = 228;

function eatAt(col, row) {
  const ch = maze[row].charAt(col);
  if (ch !== "." && ch !== "o") return;
  maze = GridCanvasSystem.runtime.setTileAt(maze, { column: col, row: row }, " ");
  pelletsLeft -= 1;
  if (ch === ".") { score += 10; }
  else { score += 50; triggerFrightened(); }
}

// 各ドットをセルの正確な中心に描く:
const b = GridCanvasSystem.runtime.tileToBounds(
  { column: c, row: r },
  { tileSize: TILE, origin: ORIGIN }
);
const cx = b.x + b.width / 2;
const cy = b.y + b.height / 2;
if (ch === "o") {
  const r = 3 + GridCanvasSystem.runtime.oscillate01(time, 3) * 2; // 脈打つ
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}`,
      codeTitle: "tileToBounds と setTileAt でドットを描いて食べる",
      diagram: {
        title: "一口のサイクル",
        caption:
          "セルの文字を読み、スコアを加え、そのセルを空きにした新しいマップを返します。",
        source: `flowchart LR
  A["パックマンが (col, row) に到達"] --> B["maze[row].charAt(col)"]
  B --> C{"'.' か 'o' か？"}
  C -->|ドット| D["score += 10"]
  C -->|パワーエサ| E["score += 50 + フライト"]
  D --> F["setTileAt -> 新しいマップ"]
  E --> F
  F --> G["pelletsLeft -= 1"]`,
      },
      expected: {
        text: "迷路がクリーム色のドットで埋まり、4つのパワーエサが隅で脈打ちます。（完成ゲームで）走り抜けるとドットが消え、カウンターが減ります。",
      },
      checklist: [
        "マップを走査し、tileToBounds で中心に合わせて各 '.' と 'o' を描く。",
        "パワーエサを oscillate01 で脈打たせる。",
        "setTileAt で eatAt を実装し、score と pelletsLeft を更新する。",
      ],
      milestone: "盤面に目的ができました。食べられ、数えられ、スコアになるドットです。",
      resources: [
        { href: "/docs/#pixel-sprites", label: "描画とヘルパーのドキュメント" },
        {
          href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
          label: "getTileAt / setTileAt / tileToBounds",
        },
      ],
    },
    {
      id: "movimiento",
      title: "パックマンはセル単位で動く",
      question: "迷路を尊重する完璧な曲がりを、どう実現するか？",
      minutes: "16分",
      body: [
        "クラシックなパックマンの移動は自由ではありません。アクターはピクセル単位でスライドしますが、方向を変えられるのはタイルの中心だけで、しかも壁でないセルへだけです。パックマンをタイル中心からタイル中心へ「ホップ」するピクセル位置としてモデル化します。中心に着くたびに次の曲がりを決めます。",
        "入力は grid.canvas 上の createKeyTracker を使います。希望する方向（want）を保存し、各分岐でそこへ曲がろうとします。塞がっていれば直進し、そこも壁なら停止します。原作のようにタイル途中での即時反転も許可します。そして横トンネル: トンネル行の端から出ると反対側から現れます。",
        "描くには drawPacman を使います。これは direction（口が向く方向）と 0..1 の開き具合を既にサポートしています。パックマンが動いている間は oscillate01 でチョンプをアニメし、止まっていれば閉じます。",
      ],
      why: {
        title: "なぜセル単位で動くか",
        text: "タイル中心でのみ曲がることが、パックマンを迷路に「はめ込み」、ゴーストAIを予測可能にします。自由なピクセルで動かすと連続衝突を解く必要があり、アーケードらしさが失われます。",
      },
      code: `const keys = GridCanvasSystem.runtime.createKeyTracker(grid.canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
});

// 毎フレーム、要求された方向を保存する:
if (keys.isPressed("ArrowLeft")) pac.want = LEFT;
else if (keys.isPressed("ArrowUp")) pac.want = UP; // など

// タイル中心に着いたら曲がりを決める:
function arrivePac() {
  const t = tileOf(pac);
  eatAt(t.col, t.row);
  if (!isWall(t.col + pac.want.x, t.row + pac.want.y)) pac.dir = pac.want; // 要求された曲がり
  else if (isWall(t.col + pac.dir.x, t.row + pac.dir.y)) pac.dir = STOP;   // 壁: 停止
  pac.target = centerOf(t.col + pac.dir.x, t.row + pac.dir.y);
}

grid.drawPacman(pac.x, pac.y, TILE * 0.62, GridCanvasSystem.runtime.oscillate01(pac.anim, 1), {
  direction: pac.facing, // pac.dir に応じて 0, PI/2, PI, -PI/2
  fillColor: "#ffe600",
});`,
      codeTitle: "中心で曲がるセル単位の移動",
      diagram: {
        title: "中心から中心へホップ",
        caption:
          "2つの中心の間は直進です。曲がる判断はタイル中心に着いたときだけ行います。",
        source: `flowchart LR
  A["目標の中心へ進む"] --> B{"中心に着いた？"}
  B -->|いいえ| A
  B -->|はい| C["このセルのドットを食べる"]
  C --> D{"want は空いている？"}
  D -->|はい| E["want の方へ曲がる"]
  D -->|いいえ| F{"dir は空いている？"}
  F -->|はい| G["そのまま直進"]
  F -->|いいえ| H["停止"]`,
      },
      expected: {
        text: "パックマンは通路をきれいな曲がりで走り、決して壁を通り抜けず、動くと口を開閉し、トンネルに入ると反対側から現れます。",
      },
      checklist: [
        "createKeyTracker をつなぎ、毎フレーム希望方向を保存する。",
        "タイル中心でのみ曲がる処理と壁ブロックを実装する。",
        "direction と oscillate01 を使い drawPacman で描く。",
      ],
      milestone: "正確なアーケードの曲がりと横トンネルでパックマンを操作できます。",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createKeyTracker.ts`,
          label: "createKeyTracker のソース",
        },
        { href: "/docs/#input-motion", label: "入力と移動のドキュメント" },
      ],
    },
    {
      id: "hud-fruta",
      title: "コンパイル済みピクセルアートでスコア・残機・フルーツ",
      question: "画像を読み込まずに、状態表示と素材をどう作るか？",
      minutes: "12分",
      body: [
        "アーケードには HUD が要ります。drawValueLabel で SCORE・HIGH・レベルを表示し、drawBarIndicator でパニック中のパワーエサのバーを描きます。これらはフォントや揃えを既に処理するテキスト・バーのヘルパーです。",
        "残機とフルーツはコンパイル済みピクセルアートとして作ります。createPixelPalette でパレットを定義し、compilePixelSprite で文字の行列を一度だけコンパイルします。その後、毎フレーム行や色を再検証せずに drawCompiledPixelSprite で何度も描きます。ボーナスのチェリーは一定数のドットを食べると現れ、追加点を与えます。",
        "スプライトモジュールには、バリエーションに便利な純粋なツールがもっとあります。反転の flipPixelSpriteX/Y、コンパイル済みスプライトを塗り替える tintPixelSprite、計測と当たり判定の getPixelSpriteBounds / hitTestPixelSprite です。パックマンで全部は使いませんが、存在を知っていれば各バリエーションを手描きせずに済みます。",
      ],
      why: {
        title: "一度コンパイルして何千回描く",
        text: "compilePixelSprite は文字行列を、色が解決済みのピクセルのリストに変えます（透明は捨てます）。ループ内では drawCompiledPixelSprite は四角形を塗るだけ。毎フレーム繰り返すものすべてに推奨される Pixel Sprite v2 のパターンです。",
      },
      code: `const palette = GridCanvasSystem.createPixelPalette({
  "0": "transparent", "1": "#ff0000", "2": "#00d43b", "3": "#ffffff",
});
const cherry = GridCanvasSystem.compilePixelSprite([
  "00000020", "00000200", "00003200", "00113110",
  "01111110", "11311131", "11111111", "01111110",
], palette);
const lifeIcon = GridCanvasSystem.compilePixelSprite(
  ["01110", "11100", "11000", "11100", "01110"],
  GridCanvasSystem.createPixelPalette({ "0": "transparent", "1": "#ffe600" }),
);

grid.drawValueLabel("1UP", score, 12, 20, { color: "#ffffff", font: "14px 'Geist Pixel', monospace" });
for (let i = 0; i < lives; i++) {
  grid.drawCompiledPixelSprite(lifeIcon, { x: 12 + i * 26, y: hudY, pixelSize: 4 });
}
if (frightenedTime > 0) {
  grid.drawBarIndicator("PWR", x, y, 100, 12, frightenedTime, maxTime, {
    fillColor: "#2121ff", textColor: "#ffffff",
  });
}`,
      codeTitle: "ヘルパーによる HUD と Pixel Sprite v2 の素材",
      expected: {
        text: "上部に SCORE・HIGH・レベルが見えます。下部には残機ごとに黄色いアイコン。パワーエサを食べると PWR バーが現れ、その後、迷路の中央にチェリーが出ます。",
      },
      checklist: [
        "compilePixelSprite でチェリーと残機アイコンを一度だけコンパイルする。",
        "drawValueLabel で SCORE / HIGH / レベル、drawCompiledPixelSprite で残機を描く。",
        "frightenedTime > 0 のときだけ drawBarIndicator でパワーエサのバーを表示する。",
      ],
      milestone: "ゲームが状態を伝えます: スコア、残機、レベル、パワーエサのタイマー。",
      resources: [
        { href: "/docs/#pixel-sprites", label: "Pixel Sprite v2 のドキュメント" },
        {
          href: `${repoUrl}/blob/main/src/drawing/pixelSprite.ts`,
          label: "ピクセルスプライトのソース",
        },
      ],
    },
    {
      id: "fantasmas",
      title: "4体のゴーストとそのモード",
      question: "ゴーストの状態を、混乱せずにどう整理するか？",
      minutes: "16分",
      body: [
        "Blinky（赤）、Pinky（ピンク）、Inky（水色）、Clyde（オレンジ）は drawGhost で描きます。これは既に胴体・目・設定可能な瞳を備えています。しかし面白いのは見た目ではなく考え方です。各ゴーストは house・leaving・scatter・chase・frightened・eaten の6モードを持つステートマシンに生きています。",
        "各モードを createStateMachine でモデル化します。これは遷移が正当かを検証します（例: 'house' からは 'leaving' か 'frightened' にしか行けない）。フラグの絡まりを明確な契約に変え、無効な遷移を試みるとマシンが拒否します。",
        "さらに、クラシックなレベル1のスケジュールに従って数秒ごとに切り替わるグローバルな scatter/chase のリズムがあります。グローバルモードが変わると、アクティブなゴーストは原作のように一斉に方向を反転します。ハウスからの解放は段階的で、Blinky はすぐ出て、他は遅れて出ます。",
      ],
      why: {
        title: "状態を明示すればバグは減る",
        text: "追いかけ、逃げ、目だけで家に戻り、家で待つゴーストは、非常に異なる振る舞いをします。createStateMachine はどの遷移が存在するかを明示するので、「逃げながら食べられている」ような状態には決してなりません。状態が主役で、描画とAIはそれを読むだけです。",
      },
      code: `function makeGhost(name) {
  const machine = GridCanvasSystem.runtime.createStateMachine({
    initial: "house",
    transitions: {
      house: ["leaving", "frightened"],
      leaving: ["scatter", "chase"],
      scatter: ["chase", "frightened", "eaten"],
      chase: ["scatter", "frightened", "eaten"],
      frightened: ["scatter", "chase", "eaten"],
      eaten: ["house"],
    },
  });
  return { name, machine, color: GHOST_COLORS[name] /* x, y, dir... */ };
}

const MODE_SCHEDULE = [
  { mode: "scatter", dur: 7 }, { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 7 }, { mode: "chase", dur: 20 },
  { mode: "scatter", dur: 5 }, { mode: "chase", dur: Infinity },
];

grid.drawGhost({ x: ghost.x, y: ghost.y }, TILE * 0.62, {
  fillColor: ghost.color, eyeColor: "#ffffff", pupilColor: "#1414c8",
});`,
      codeTitle: "ゴーストはステートマシン",
      diagram: {
        title: "scatter / chase のサイクル",
        caption:
          "グローバルモードは時間とともに交替します。切り替わると、アクティブなゴーストは方向を反転します。",
        source: `flowchart LR
  A["scatter 7秒"] --> B["chase 20秒"]
  B --> C["scatter 7秒"]
  C --> D["chase 20秒"]
  D --> E["scatter 5秒"]
  E --> F["chase（レベルの残り）"]`,
      },
      expected: {
        text: "4体のゴーストは段階的にハウスを出て、自分の隅に散る（scatter）のと、あなたを追う（chase）のを交互に行います。それぞれの色で。",
      },
      checklist: [
        "各ゴーストを createStateMachine と6モードで作る。",
        "MODE_SCHEDULE を定義し、反転付きのグローバル scatter/chase 切替を適用する。",
        "各ゴーストを drawGhost でその色で描く。",
      ],
      milestone: "ゴーストが存在し、ハウスを出て、明確なルールでモードを交替します。",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createStateMachine.ts`,
          label: "createStateMachine のソース",
        },
        { href: "/docs/#state-sprites", label: "状態とスプライトのドキュメント" },
      ],
    },
    {
      id: "ia",
      title: "クラシックAI: 各ゴーストは違う考え方をする",
      question: "なぜ Blinky は追ってきて、Clyde は臆病に見えるのか？",
      minutes: "16分",
      body: [
        "パックマンの魔法は、4体のゴーストが同じアルゴリズムを共有しながら異なるターゲットを選ぶことにあります。各分岐で、ゴーストは出口を見て（引き返せません）、ターゲットのタイルに最も近づく出口を選びます。ターゲットを変えるだけで、4つの性格が生まれます。",
        "Blinky はあなたのタイルを直接狙い、正面から追います。Pinky は待ち伏せのためにあなたの4タイル先を狙います（上を向いたときの有名なオーバーフローのバグも含みます）。Inky はあなたの位置と Blinky の位置を組み合わせ、反対側から挟みます。Clyde は遠いときだけ追い、8タイルより近づくと自分の隅へ逃げます。だから臆病に見えます。",
        "scatter モードでは各ゴーストは固定の隅へ行きます。frightened ではランダムな方向を選びます。eaten（食べられた）ではターゲットは復活のためのハウスのドアです。同じ判断ループがすべてのモードに使えます。変わるのはターゲットだけです。",
      ],
      why: {
        title: "1つのアルゴリズム、4つの心",
        text: "「ターゲットへの距離を最小化する出口を選ぶ」を再利用し、ターゲットだけを変えるのは設計の教訓です。単純なルールから生まれる創発的な振る舞い。そしてそれがゲームを公平で学べるものにします。",
      },
      code: `function ghostTarget(ghost) {
  const p = tileOf(pac);
  const state = ghost.machine.getState();
  if (state === "scatter" || state === "frightened") return SCATTER[ghost.name];
  if (state === "eaten") return EXIT_TILE;
  if (ghost.name === "blinky") return p;                          // 直接追う
  if (ghost.name === "pinky") {                                    // 4タイル先で待ち伏せ
    return { col: p.col + pac.dir.x * 4, row: p.row + pac.dir.y * 4 };
  }
  if (ghost.name === "inky") {                                     // Blinky を反射
    const b = tileOf(blinky);
    const pivotC = p.col + pac.dir.x * 2, pivotR = p.row + pac.dir.y * 2;
    return { col: pivotC * 2 - b.col, row: pivotR * 2 - b.row };
  }
  const d = Math.hypot(gCol - p.col, gRow - p.row);                // clyde: 臆病
  return d > 8 ? p : SCATTER.clyde;
}

// 各分岐: ターゲットに最も近い出口（反転なし）を選ぶ。
options.forEach((dir) => {
  const dist2 = distanceToTargetSquared(tile, dir, goal);
  if (dist2 < best) { best = dist2; chosen = dir; }
});`,
      codeTitle: "ターゲットが性格を決める",
      diagram: {
        title: "4つのターゲット、1つのアルゴリズム",
        caption:
          "全員がターゲットに最も近い出口を選びます。変わるのはそのターゲットの位置だけです。",
        source: `flowchart TB
  P["パックマンのタイル"] --> B["Blinky: あなたのタイル"]
  P --> K["Pinky: 4タイル先"]
  P --> I["Inky: Blinky 経由の反射"]
  P --> C["Clyde: 遠いと追い / 近いと逃げ"]
  B --> G["距離を最小化する出口を選ぶ"]
  K --> G
  I --> G
  C --> G`,
      },
      expected: {
        text: "Blinky はぴったり追い、Pinky は先回りしようとし、Inky は不意に現れ、Clyde は近いと下がります。アーケードのように感じます。",
      },
      checklist: [
        "各キャラのターゲットで ghostTarget を実装する。",
        "各分岐でターゲットに最も近い反転なしの出口を選ぶ。",
        "scatter・frightened・eaten で異なるターゲットを使う。",
      ],
      milestone: "忠実なAIができました。1つの判断ルールから4つの性格が現れます。",
      resources: [
        {
          href: `${repoUrl}/blob/main/examples/vanilla/tilemap-scene`,
          label: "タイルマップ + シーンのデモ",
        },
        { href: "/docs/#input-motion", label: "距離とベクトルのヘルパー" },
      ],
    },
    {
      id: "energizante",
      title: "パワーエサ: 狩りが逆転するとき",
      question: "パニック、点数の連鎖、家への帰還をどう実装するか？",
      minutes: "16分",
      body: [
        "パワーエサを食べるとすべてが変わります。アクティブなゴーストは全員 frightened に入り、方向を反転し、遅く青くなり、時間切れが近づくと点滅します。その間、触れても死なず、逆に食べられます。",
        "連鎖でゴーストを食べると 200・400・800・1600 点で、同じパワーエサ内で1体ごとに倍になります。1体食べると eaten になり、迷路を通ってハウスへ戻る一対の目になり、そこで復活します。drawBarIndicator でバーを、衝突点に浮かぶスコアを表示します。",
        "視覚フィードバックにはパーティクルを使います。createParticleBurst がパーティクルの噴出を生成し、stepParticles がフレームごとに（寿命を減らしながら）積分します。ライブラリがトレイルやエフェクト用に提供する同じシーンのツールを、ゴーストを食べる爽快さに適用します。",
      ],
      why: {
        title: "eaten 状態がサイクルを閉じる",
        text: "'frightened' と 'eaten' を分けるのが鍵です。食べられたゴーストはあなたを殺せず、再び食べられてもいけません。そして家へ戻るためにパニックのタイマーを無視する必要があります。ステートマシンがその区別を簡単でバグに強いものにします。",
      },
      code: `function triggerFrightened() {
  frightenedTime = frightenedDuration(); // レベルとともに減る
  ghostChain = 0;
  ghosts.forEach((g) => {
    const s = g.machine.getState();
    if (s === "scatter" || s === "chase") { g.machine.transition("frightened"); reverse(g); }
  });
}

// 青いゴーストとの衝突: 連鎖 200, 400, 800, 1600...
ghostChain += 1;
score += 200 * Math.pow(2, ghostChain - 1);
g.machine.transition("eaten");                 // 目になってハウスへ戻る

// フィードバックとしてのパーティクル噴出:
const burst = GridCanvasSystem.runtime.createParticleBurst({ x, y }, 12, { speed: 90, life: 0.6 });
particles = particles.concat(burst);
particles = GridCanvasSystem.runtime.stepParticles(particles, step);`,
      codeTitle: "パニック、点数の連鎖、家への帰還",
      diagram: {
        title: "パワーエサのサイクル",
        caption:
          "パワーエサが frightened を起動し、ゴーストを食べると eaten になり、家で復活して再び狩りに戻ります。",
        source: `flowchart LR
  A["パワーエサを食べる"] --> B["ゴースト -> frightened + 反転"]
  B --> C{"Pac が触れる？"}
  C -->|はい| D["score x2 連鎖 + eaten"]
  D --> E["目がハウスへ戻る"]
  E --> F["復活 -> scatter/chase"]
  B -->|時間切れ| F`,
      },
      expected: {
        text: "パワーエサを食べるとゴーストは青くなって逃げます。捕まえると浮かぶスコアとパーティクルの雨が見え、目がハウスへ戻ります。",
      },
      checklist: [
        "triggerFrightened を実装する: frightened に遷移し、方向を反転する。",
        "200/400/800/1600 の連鎖を加算し、ゴーストを eaten にする。",
        "createParticleBurst と stepParticles でパーティクルを追加する。",
      ],
      milestone:
        "パワーエサが機能します: パニック、点数の連鎖、戻る目、そして爽快なフィードバック。",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/scene.ts`,
          label: "パーティクルとトレイルのソース",
        },
        { href: "/docs/#input-motion", label: "シーンとフィードバックのドキュメント" },
      ],
    },
    {
      id: "vidas-niveles",
      title: "残機、死亡、レベル進行",
      question: "捕まったとき、そして盤面をクリアしたとき、何が起きるか？",
      minutes: "14分",
      body: [
        "scatter か chase のゴーストに触れると残機を失います。3から始まり、10,000点で1つ増えます。死亡は drawPacman を巧みに再利用します。口の開きを0から1へ振り、パックマンが消える象徴的なアニメを再現し、その後、位置をリセットするかゲームオーバーへ行きます。",
        "pelletsLeft がゼロになるとレベルクリアです。レベルを上げ、迷路を作り直し、加速します。レベルごとにパックマンとゴーストは少し速くなり、パワーエサの時間は短くなります。難易度は原作に忠実に上がります。",
        "これらはすべて、メインの更新が統括するいくつかの関数（killPac、finishDeath、startLevel）にあります。小さく単一責務に保つことで、残機/死亡/レベルのフローが追いやすくなります。",
      ],
      why: {
        title: "死亡に drawPacman を再利用",
        text: "別の死亡スプライトは要りません。drawPacman は既に 0..1 の口の開きを受け取ります。その開きを時間で補間すれば、クラシックなアニメが無料で手に入ります。素材を足す代わりにライブラリのプリミティブを絞り出す例です。",
      },
      code: `// Pac 対 ゴーストの衝突
if (state === "frightened") eatGhost(g);
else killPac();                                 // 死亡を開始

function killPac() { pac.dying = 1.1; stopSiren(); }

// 死亡は drawPacman で口を最大まで開く:
const mouth = Math.min(1, (1 - pac.dying / 1.1) * 1.4);
grid.drawPacman(pac.x, pac.y, TILE * 0.62, mouth, { direction: pac.facing, fillColor: "#ffe600" });

function finishDeath() {
  lives -= 1;
  if (lives < 0) manager.transition("gameover");
  else { resetActors(); manager.transition("ready"); }
}

// レベルクリア
if (pelletsLeft <= 0) { level += 1; startLevel(); manager.transition("ready"); }`,
      codeTitle: "死亡、残機、レベルアップ",
      expected: {
        text: "捕まると、パックマンは死亡アニメを再生し、残機を失います。最後のドットを食べると、レベルはより速く、パワーエサ時間はより短く再開します。",
      },
      checklist: [
        "ゴーストを食べる（frightened）のと死ぬ（scatter/chase）のを区別する。",
        "drawPacman の開きを振って死亡をアニメする。",
        "pelletsLeft = 0 でレベルを上げ、ゲームを加速する。",
      ],
      milestone:
        "ゲームに結果が生まれました: 死に、残機を失い、レベルが上がり、追加の残機を得ます。",
      resources: [
        {
          href: "/docs/#arcade-primitives",
          label: "アーケードのプリミティブ（drawPacman）",
        },
        { href: `${repoUrl}/blob/main/CHANGELOG.md`, label: "リリースノート" },
      ],
    },
    {
      id: "escenas-audio",
      title: "シーンのフロー、グローバル入力、音声",
      question: "フラグの絡まりなしに、メニュー・プレイ・ポーズをどうつなぐか？",
      minutes: "14分",
      body: [
        "ゲームには非常に異なる高レベルの状態があります: メニュー、開始前の READY!、プレイ、ポーズ、ゲームオーバー。散らばったフラグの代わりに createSceneManager を使います。各シーンが自分の enter・update・draw・exit を宣言し、遷移は明示的です。プレイシーンがシミュレーションを走らせ、他は描いてキー入力を待つだけです。",
        "グローバル入力（開始/再開の Enter、ポーズの P）も createKeyTracker を通し、キーのエッジを検出して毎フレーム動作が繰り返されないようにします。そしてアーケード音声（createArcadeAudio）はここで鳴ります。プレイ中はサイレンをループし、ドット・パワーエサ・ゴーストを食べると効果音が鳴ります。ブラウザはユーザー操作まで音声をブロックするので、最初の Enter で解除します。",
        "すべては1つの createFixedStepLoop が駆動します。update では入力を読み、固定ステップ（1/60）でアクティブなシーンを進め、draw ではそのシーンを描きます。その決定論的な時計が、AIと衝突をどのマシンでも同じ振る舞いにします。",
      ],
      why: {
        title: "シーン + 時計 = 秩序",
        text: "createSceneManager は「今どの画面にいるか」のロジックをループの外に出し、createFixedStepLoop は安定したリズムを保証します。両者が、if だらけの巨大なループの代わりに、多くの状態を持つゲームをモジュール化しテスト可能にします。",
      },
      code: `const manager = GridCanvasSystem.runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu:     { draw: drawMenu },
    ready:    { update: countdown, draw: drawReady },
    play:     { update: updatePlay, draw: renderScene, exit: stopSiren },
    paused:   { draw: drawPaused },
    gameover: { enter: stopSiren, draw: drawGameOver },
  },
});

const audio = createArcadeAudio({ masterVolume: 0.4 }); // Playground には既にある

GridCanvasSystem.runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  maxUpdatesPerFrame: 5,
  update: (step) => { readInput(); manager.update(step); },
  draw: () => manager.draw(ctx),
});`,
      codeTitle: "シーンマネージャ + 固定ステップループ",
      diagram: {
        title: "シーングラフ",
        caption:
          "各矢印はシーンマネージャの明示的な遷移です。固定ステップループがアクティブなシーンに供給します。",
        source: `flowchart LR
  M["menu"] -->|Enter| R["ready"]
  R -->|カウント0| P["play"]
  P -->|P| PA["paused"]
  PA -->|P| P
  P -->|残機なし| G["gameover"]
  G -->|Enter| M
  P -->|盤面クリア| R`,
      },
      callout: {
        title: "ブラウザの注意",
        text: "音声は自動では始まりません。ブラウザはユーザー操作を要求します。だから最初の Enter で audio.resume() を呼び、そこで初めてサイレンと効果音が鳴ります。",
      },
      expected: {
        text: "メニューは PAC-MAN を表示し、Enter で READY! から始まり、P で一時停止・再開し、残機がなくなると GAME OVER が現れ、Enter でメニューに戻ります。プレイ中はサイレンが鳴ります。",
      },
      checklist: [
        "createSceneManager で menu/ready/play/paused/gameover シーンを宣言する。",
        "createKeyTracker で Enter と P をエッジ検出し、音声を解除する。",
        "createFixedStepLoop で update と draw を呼び、全体を統括する。",
      ],
      milestone:
        "ゲームに完全なフローができました: メニュー、プレイ、ポーズ、ゲームオーバー、音声、すべて決定論的。",
      resources: [
        {
          href: `${repoUrl}/blob/main/src/runtime/createSceneManager.ts`,
          label: "createSceneManager のソース",
        },
        {
          href: `${repoUrl}/blob/main/src/runtime/createFixedStepLoop.ts`,
          label: "createFixedStepLoop のソース",
        },
      ],
    },
    {
      id: "juego-completo",
      title: "完全なパックマン: 実行しよう",
      question: "すべてが一緒に動くと、どう見えるか？",
      minutes: "20分",
      body: [
        "これがゲーム全体で、Playground で実行できます。作ったものすべてを集約します: タイルマップとしての迷路、トンネル付きのセル単位の移動、AIとモードを持つ4体のゴースト、点数の連鎖と戻る目を持つパワーエサ、フルーツ、ピクセルアートの HUD、忠実なスコア、残機、加速するレベル、シーンマネージャ、固定ステップループ、アーケード音声。",
        "操作: 移動は矢印か WASD、開始と再開は Enter、ポーズは P。キーボードが反応しなければキャンバスをクリックしてください（フォーカスを与えるため）。落ち着いてコードを読んでください。各セクションはこのチュートリアルの順に番号付けされ、コメントされています。",
        "さらに先へ進むには、ライブラリは書き直しなしで成長させられます: 本物の音楽には createArcadeAudio を Howler と Tone のアダプター（grid-canvas-system/audio）に替え、手描きの死亡フレームが欲しければ createSpriteAnimator を使い、新しいエフェクトには MassBody・appendTrailPoint・衝突ヘルパーを活用します。小さく安定したコアが、それらすべてを既に支えます。",
      ],
      why: {
        title: "ゼロからエキスパートへ",
        text: "空のキャンバスから始めて、ライブラリの 1.0 の表面のほぼ全体を1つの一貫したプロジェクトで動かす忠実なアーケードにたどり着きました。それが目標です。メソッドを暗記するのではなく、それらを組み合わせて本物を作れるようになることです。",
      },
      milestone:
        "トリビュートを完成させました: ルールとスコアを備えた忠実なパックマンを、grid-canvas-system でゼロからエキスパートまで作りました。",
      interactive: {
        description:
          "完全なゲームがここで動きます。移動は矢印か WASD、開始は Enter、ポーズは P。Playground で開くと、コメント付きの900行超を読んで編集できます。",
        files: {
          html: PACMAN_GAME_HTML,
          javascript: PACMAN_GAME_JS_JA,
        },
        kind: "playground",
        title: "完全なパックマンで遊ぶ",
      },
      resources: [
        {
          href: `${repoUrl}/tree/main/examples/vanilla/tilemap-scene`,
          label: "タイルマップ + シーンの例",
        },
        {
          href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
          label: "公開APIコントラクト",
        },
        { href: `${repoUrl}/blob/main/docs/MIGRATION.md`, label: "移行ガイド" },
      ],
    },
  ],
};

export const pacmanTutorialByLocale: Record<PacmanTutorialLocale, PacmanTutorial> = {
  en,
  es,
  ja,
};

export const pacmanTutorialEs = es;
