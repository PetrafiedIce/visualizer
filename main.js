"use strict";

// Minimal sound via WebAudio (no binary assets needed)
class Beeper {
  constructor() {
    this.audioContext = null;
    this.isMuted = false;
  }
  ensureContext() {
    if (!this.audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.audioContext = new Ctx();
    }
  }
  setMuted(muted) { this.isMuted = muted; }
  async beep(frequency = 880, durationMs = 80, type = "sine", gain = 0.03) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioContext) return;
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const g = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    g.gain.value = gain;
    oscillator.connect(g);
    g.connect(ctx.destination);
    oscillator.start();
    await new Promise(r => setTimeout(r, durationMs));
    oscillator.stop();
    oscillator.disconnect();
    g.disconnect();
  }
}

const beeper = new Beeper();

// Haptics
function vibrate(durationMs) {
  const enabled = document.getElementById("toggle-haptics")?.checked ?? true;
  if (!enabled) return;
  if (navigator.vibrate) navigator.vibrate(durationMs);
}

// Utility: Random helpers
function getRandomInt(minInclusive, maxInclusive) {
  return Math.floor(Math.random() * (maxInclusive - minInclusive + 1)) + minInclusive;
}
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

// Color palette generator (HSL-based) with an odd one out
function generateRoundColors(gridSize, level, colorblindMode) {
  const total = gridSize * gridSize;
  // Base HSL palette
  let hue;
  if (colorblindMode) {
    const safeHues = [15, 45, 195, 225, 285];
    hue = safeHues[getRandomInt(0, safeHues.length - 1)];
  } else {
    hue = Math.random() * 360;
  }
  const saturation = getRandomInt(60, 75);
  const lightness = getRandomInt(45, 60);

  // Difference shrinks as level increases
  const difficultyFactor = clamp(level / 12, 0.1, 1.2);
  const lightnessDelta = clamp(22 - level * 1.4, 4, 22);
  const hueDelta = clamp(40 - level * 2.2, 3, 40);

  const oddIsLighter = Math.random() > 0.5;
  const oddHueShift = (Math.random() > 0.5 ? 1 : -1) * hueDelta * (0.2 + Math.random() * 0.6) * (1.1 - 0.5 * difficultyFactor);
  const oddLightnessShift = (oddIsLighter ? 1 : -1) * lightnessDelta * (0.5 + Math.random() * 0.6) * (1.2 - 0.5 * difficultyFactor);

  const baseColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
  const oddColor = `hsl(${(hue + oddHueShift + 360) % 360} ${saturation}% ${clamp(lightness + oddLightnessShift, 22, 82)}%)`;

  const oddIndex = getRandomInt(0, total - 1);
  const colors = Array.from({ length: total }, (_, i) => i === oddIndex ? oddColor : baseColor);

  return { colors, oddIndex };
}

// Confetti
function spawnConfetti(x, y) {
  let layer = document.getElementById("confetti-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "confetti-layer";
    document.body.appendChild(layer);
  }
  const pieceCount = 30;
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("div");
    const size = getRandomInt(6, 10);
    piece.style.position = "fixed";
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * (0.6 + Math.random() * 1)}px`;
    piece.style.background = `hsl(${Math.random() * 360} 80% 60%)`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = `${Math.random() > 0.6 ? 4 : 999}px`;
    piece.style.willChange = "transform, opacity";
    piece.style.opacity = "1";
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "3";
    piece.style.transition = `transform 900ms ease-out, opacity 900ms ease-out`;
    layer.appendChild(piece);
    requestAnimationFrame(() => {
      const dx = (Math.random() - 0.5) * 180;
      const dy = 220 + Math.random() * 160;
      const rot = (Math.random() - 0.5) * 540;
      piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      piece.style.opacity = "0";
      setTimeout(() => piece.remove(), 900);
    });
  }
}

// Toasts
let toastTimeout;
function showToast(message, ms = 1500) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove("show"), ms);
}

// Game State
const state = {
  running: false,
  gridSize: 3,
  level: 1,
  score: 0,
  best: 0,
  timeLeftMs: 60000,
  tickInterval: null,
  oddIndex: -1,
  colorblindMode: false,
};

// DOM refs
const gridEl = document.getElementById("grid");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const timeEl = document.getElementById("time");
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");
const btnPause = document.getElementById("btn-pause");
const btnMute = document.getElementById("btn-mute");
const btnSettings = document.getElementById("btn-settings");
const overlay = document.getElementById("overlay");
const overlayStart = document.getElementById("overlay-start");
const colorblindToggle = document.getElementById("toggle-colorblind");

function loadBestScore() {
  const saved = localStorage.getItem("odd.best");
  state.best = saved ? parseInt(saved, 10) : 0;
  bestEl.textContent = String(state.best);
}
function saveBestScore() {
  if (state.score > state.best) {
    state.best = state.score;
    bestEl.textContent = String(state.best);
    localStorage.setItem("odd.best", String(state.best));
  }
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  timeEl.textContent = (state.timeLeftMs / 1000).toFixed(1);
}

function computeGridSize(level) {
  if (level < 4) return 3;
  if (level < 8) return 4;
  if (level < 13) return 5;
  if (level < 20) return 6;
  if (level < 28) return 7;
  return 8;
}

function buildGrid() {
  gridEl.replaceChildren();
  gridEl.style.gridTemplateColumns = `repeat(${state.gridSize}, 1fr)`;
  const { colors, oddIndex } = generateRoundColors(state.gridSize, state.level, state.colorblindMode);
  state.oddIndex = oddIndex;
  const total = state.gridSize * state.gridSize;
  for (let i = 0; i < total; i++) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.setAttribute("role", "gridcell");
    tile.setAttribute("aria-label", i === oddIndex ? "Odd tile" : "Tile");
    tile.style.background = colors[i];
    tile.addEventListener("click", () => handleTileClick(i, tile));
    gridEl.appendChild(tile);
  }
}

async function handleTileClick(index, tileEl) {
  if (!state.running) return;
  if (index === state.oddIndex) {
    state.score += 1;
    beeper.beep(1175, 70, "square", 0.03);
    vibrate(15);
    const rect = tileEl.getBoundingClientRect();
    spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

    state.level += 1;
    state.gridSize = computeGridSize(state.level);
    state.timeLeftMs = clamp(state.timeLeftMs + 1200, 0, 120000);
    updateHud();
    buildGrid();
  } else {
    beeper.beep(240, 90, "sawtooth", 0.025);
    vibrate(40);
    state.timeLeftMs = clamp(state.timeLeftMs - 2200, 0, 120000);
    updateHud();
    gridEl.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 120, iterations: 1 });
  }
}

function startTimer() {
  stopTimer();
  const start = performance.now();
  let last = start;
  state.tickInterval = setInterval(() => {
    const now = performance.now();
    const delta = now - last;
    last = now;
    if (!state.running) return;
    state.timeLeftMs -= delta;
    if (state.timeLeftMs <= 0) {
      state.timeLeftMs = 0;
      updateHud();
      endGame();
      return;
    }
    updateHud();
  }, 100);
}
function stopTimer() {
  if (state.tickInterval) {
    clearInterval(state.tickInterval);
    state.tickInterval = null;
  }
}

function startGame() {
  state.running = true;
  state.level = 1;
  state.score = 0;
  state.gridSize = computeGridSize(state.level);
  state.timeLeftMs = 60000;
  updateHud();
  buildGrid();
  startTimer();
  btnStart.disabled = true;
  btnRestart.disabled = false;
  btnPause.disabled = false;
}

function restartGame() {
  stopTimer();
  startGame();
  showToast("Restarted");
}

function pauseGame() {
  state.running = false;
  btnPause.textContent = "Resume";
  showToast("Paused");
}

function resumeGame() {
  state.running = true;
  btnPause.textContent = "Pause";
  showToast("Resumed");
}

function endGame() {
  stopTimer();
  state.running = false;
  saveBestScore();
  btnStart.disabled = false;
  btnRestart.disabled = true;
  btnPause.disabled = true;
  btnPause.textContent = "Pause";
  overlay.classList.remove("hidden");
  showToast(`Final score: ${state.score}`);
}

function toggleMute() {
  const muted = btnMute.dataset.muted === "true";
  if (muted) {
    btnMute.dataset.muted = "false";
    btnMute.textContent = "🔊";
    beeper.setMuted(false);
    showToast("Sound on");
  } else {
    btnMute.dataset.muted = "true";
    btnMute.textContent = "🔇";
    beeper.setMuted(true);
    showToast("Sound off");
  }
}

// UI wiring
btnStart.addEventListener("click", () => { overlay.classList.add("hidden"); startGame(); });
btnRestart.addEventListener("click", restartGame);
btnPause.addEventListener("click", () => { state.running ? pauseGame() : resumeGame(); });
btnMute.addEventListener("click", toggleMute);
btnSettings.addEventListener("click", () => document.getElementById("settings-dialog").showModal());
overlayStart.addEventListener("click", () => { overlay.classList.add("hidden"); startGame(); });

// Settings
colorblindToggle.addEventListener("change", (e) => {
  state.colorblindMode = e.target.checked;
  if (state.running) buildGrid();
});

// Double-tap to pause/resume
let lastTap = 0;
document.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTap < 300) {
    if (state.running) pauseGame(); else resumeGame();
  }
  lastTap = now;
}, { passive: true });

// Keyboard for desktop testing
window.addEventListener("keydown", (e) => {
  if (e.key === " ") { e.preventDefault(); state.running ? pauseGame() : resumeGame(); }
  if (e.key === "r") restartGame();
});

// Persisted best score
loadBestScore();
updateHud();

// PWA: Service worker registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {/* noop */});
  });
}