import { initThree, triggerPulse, setVizMode, updateResync } from './quantum_engine.js';
import { primeGenerator, getHexHeader, generateSaveFile } from './beacon_protocol.js';
import { initAudio, startDrone, playDataBurst, playPulseSound, playPhaseShift } from './audio_sys.js';

// DOM Elements
const logTerminal = document.getElementById('log-terminal');
const primeDisplay = document.getElementById('prime-sequence');
const hexDisplay = document.getElementById('hex-header');
const btnBroadcast = document.getElementById('btn-broadcast');
const btnSave = document.getElementById('btn-save');
const mode2026 = document.getElementById('mode-2026');
const modeThrow = document.getElementById('mode-throw');
const mode2080 = document.getElementById('mode-2080');
const resyncSlider = document.getElementById('resync-slider');
const resyncVal = document.getElementById('resync-val');
const connectionStatus = document.getElementById('connection-status');

let isBroadcasting = false;
let broadcastInterval;
const primes = primeGenerator();

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initThree(document.getElementById('canvas-container'));
    logSystem("INITIALIZING CHRONOS-ALPHA CORE...");
    logSystem("QUANTUM FIELD STABILIZED.");
});

// Helper for Logging
function logSystem(msg) {
    const div = document.createElement('div');
    div.className = 'log-line';
    div.innerText = `> ${msg}`;
    logTerminal.appendChild(div);
    // Keep scrolling to bottom
    logTerminal.scrollTop = logTerminal.scrollHeight;
}

// User Interaction
document.body.addEventListener('click', () => {
    // Initialize Audio on first interaction
    initAudio();
    startDrone();
}, { once: true });

// Beacon Broadcast Logic
btnBroadcast.addEventListener('click', () => {
    if (isBroadcasting) return;
    isBroadcasting = true;
    btnBroadcast.disabled = true;
    btnBroadcast.innerText = "BROADCASTING...";
    
    logSystem("INITIATING HANDSHAKE PROTOCOL...");
    hexDisplay.innerText = getHexHeader();
    playPhaseShift();

    broadcastInterval = setInterval(() => {
        const p = primes.next().value;
        primeDisplay.innerText = `PRIME_SHIFT: ${p} | GATE: Rz(π/${p})`;
        triggerPulse(p);
        playPulseSound();
        logSystem(`BROADCASTING PULSE: ${p}`);
        
        // Random chance to detect "echo"
        if (Math.random() > 0.95) {
            logSystem("ANOMALY DETECTED IN RETURN SIGNAL...");
        }
    }, 1500);
});

// Save File Generation
btnSave.addEventListener('click', () => {
    playDataBurst();
    logSystem("SCANNING BIOMETRIC SIGNATURE...");
    
    setTimeout(() => {
        const fileContent = generateSaveFile();
        console.log(fileContent);
        
        // Create download
        const blob = new Blob([fileContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CHRONOS_INDEX_0.qsave';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        logSystem("ARCHIVE COMPLETE. FILE SAVED LOCAL.");
        logSystem("FIFO PROTOCOL TAGGED: TRUE");
    }, 1000);
});

// Mode Switching
mode2026.addEventListener('click', () => {
    setMode('2026');
});

modeThrow.addEventListener('click', () => {
    if(!isBroadcasting) {
        logSystem("ERROR: CANNOT THROW WITHOUT ACTIVE BEACON.");
        return;
    }
    setMode('THROW');
});

mode2080.addEventListener('click', () => {
    setMode('2080');
});

function setMode(mode) {
    // Update UI
    [mode2026, modeThrow, mode2080].forEach(b => b.classList.remove('active'));
    
    if (mode === '2026') {
        mode2026.classList.add('active');
        setVizMode('2026');
        resyncSlider.disabled = true;
        logSystem("PHASE LOCKED: 2026 LOCAL TIME.");
        connectionStatus.innerText = "UPLINK: SEARCHING...";
        connectionStatus.className = "offline";
    } else if (mode === 'THROW') {
        modeThrow.classList.add('active');
        setVizMode('THROW');
        playPhaseShift();
        logSystem("INITIATING QUANTUM TUNNELING...");
        logSystem("CONVERTING MATTER TO WAVEFORM...");
        
        setTimeout(() => {
            logSystem("TARGET ACQUIRED: NODE 2080.");
            mode2080.disabled = false;
            // Auto switch to 2080 catch after 3s
            setTimeout(() => setMode('2080'), 3000);
        }, 3000);
    } else if (mode === '2080') {
        mode2080.classList.add('active');
        setVizMode('2080');
        resyncSlider.disabled = false;
        resyncSlider.value = 0;
        updateResync(0);
        resyncVal.innerText = "0";
        logSystem("ARRIVAL: NODE 2080.");
        logSystem("WARNING: THERMAL DECOHERENCE RISK HIGH.");
        connectionStatus.innerText = "UPLINK: ESTABLISHED (FUTURE)";
        connectionStatus.className = "online";
    }
}

// Resync Slider
resyncSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    resyncVal.innerText = val;
    updateResync(val);
    if (val > 99) {
        logSystem("RE-SYNC COMPLETE. WELCOME TO 2080.");
    }
});