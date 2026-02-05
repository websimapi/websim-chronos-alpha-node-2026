// WebAudio Context for generating sci-fi interface sounds

let audioCtx;
let masterGain;

export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.3; // Prevent ear blasting
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Simple beep for UI interactions
export function playBeep(freq = 800, type = 'sine', duration = 0.1) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// Low drone for the "Field"
let droneOsc;
export function startDrone() {
    if (!audioCtx) return;
    if (droneOsc) return;

    droneOsc = audioCtx.createOscillator();
    const droneGain = audioCtx.createGain();
    
    droneOsc.type = 'sawtooth';
    droneOsc.frequency.setValueAtTime(50, audioCtx.currentTime);
    
    // Lowpass filter to make it a deep hum
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 120;
    
    droneGain.gain.value = 0.15;
    
    droneOsc.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(masterGain);
    
    droneOsc.start();
}

// Data stream sound
export function playDataBurst() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.1);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(now + 0.1);
}

export function playPulseSound() {
    playBeep(440, 'sine', 0.3);
    playBeep(880, 'sine', 0.1);
}

export function playPhaseShift() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 1.0);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.0);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(now + 1.0);
}

export function playLockSound() {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Impact sound for Zeno Lock
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(masterGain);
    
    osc.start();
    osc.stop(now + 0.3);
    
    // High pitch lock confirm
    playBeep(2000, 'sine', 0.1);
}