// Sound notification utility using Web Audio API
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = "sine", volume = 0.3) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported, fail silently
  }
}

export function playOrderReady() {
  playTone(523, 0.15, "sine", 0.3);
  setTimeout(() => playTone(659, 0.15, "sine", 0.3), 150);
  setTimeout(() => playTone(784, 0.2, "sine", 0.3), 300);
}

export function playOrderPlaced() {
  playTone(440, 0.1, "sine", 0.2);
  setTimeout(() => playTone(554, 0.15, "sine", 0.2), 100);
}

export function playOrderCancelled() {
  playTone(330, 0.15, "sawtooth", 0.15);
  setTimeout(() => playTone(262, 0.2, "sawtooth", 0.15), 150);
}

export function playNotification() {
  playTone(880, 0.08, "sine", 0.2);
  setTimeout(() => playTone(1100, 0.1, "sine", 0.2), 80);
}

export function playError() {
  playTone(200, 0.2, "square", 0.1);
}
