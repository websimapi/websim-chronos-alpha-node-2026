import { initThree, triggerPulse, setVizMode, updateResync, setZenoLock } from './quantum_engine.js';
import { primeGenerator, getHexHeader, generateSaveFile, getSimulatedEntropy } from './beacon_protocol.js';
import { initAudio, startDrone, playDataBurst, playPulseSound, playPhaseShift, playLockSound } from './audio_sys.js';

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
const telemetryModule = document.getElementById('telemetry-module');
const entropyVal = document.getElementById('entropy-val');
const branchVal = document.getElementById('branch-val');
const telemetryStatus = document.getElementById('telemetry-status');

let isBroadcasting = false;
let broadcastInterval;
let telemetryInterval;
let startTime;
let handshakeLocked = false;
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
    startTime = Date.now();
    btnBroadcast.disabled = true;
    btnBroadcast.innerText = "SIGNAL ACTIVE";
    
    // UI Updates
    telemetryModule.classList.remove('hidden');
    logSystem("INITIATING HANDSHAKE PROTOCOL...");
    logSystem("TELEMETRY MONITOR: ONLINE");
    hexDisplay.innerText = getHexHeader();
    playPhaseShift();

    // Pulse Loop
    broadcastInterval = setInterval(() => {
        if(handshakeLocked) return; 

        const p = primes.next().value;
        primeDisplay.innerText = `PRIME_SHIFT: ${p} | GATE: Rz(π/${p})`;
        triggerPulse(p);
        playPulseSound();
        logSystem(`BROADCASTING PULSE: ${p}`);
    }, 1500);

    // Telemetry/Monitor Loop
    telemetryInterval = setInterval(() => {
        if(handshakeLocked) return;

        const elapsed = Date.now() - startTime;
        const entropy = getSimulatedEntropy(elapsed);
        
        entropyVal.innerText = `${entropy} (VARIANCE)`;
        
        if (elapsed > 5000 && elapsed < 10000) {
            telemetryStatus.innerText = "COHERENCE SPIKE DETECTED";
            telemetryStatus.classList.add('alert-text');
            // Simulate calculating branch deviation
            const drift = (Math.random() * 5).toFixed(2);
            branchVal.innerText = `CALC Δ ${drift}...`;
        } else if (elapsed > 10000) {
            // Handshake Trigger
            triggerHandshake(entropy);
        }

    }, 500);
});

function triggerHandshake(finalEntropy) {
    if (handshakeLocked) return;
    handshakeLocked = true;
    
    clearInterval(broadcastInterval);
    clearInterval(telemetryInterval);
    
    // Determine Branch Flavor
    const branchDelta = (Math.random() * 12).toFixed(4);
    const branchType = branchDelta < 1.0 ? "ROOT-ADJACENT" : "DIVERGENT-FORK";
    
    entropyVal.innerText = `${finalEntropy} (LOCKED)`;
    branchVal.innerText = `Δ ${branchDelta} (${branchType})`;
    
    telemetryStatus.innerText = `HANDSHAKE: ${branchType}`;
    telemetryStatus.classList.remove('alert-text');
    telemetryStatus.classList.add('code-stream');
    
    logSystem("!!! CRITICAL: RETROCAUSAL SIGNAL DETECTED !!!");
    logSystem(`TIMELINE ORIGIN: ${branchType} (DELTA: ${branchDelta})`);
    logSystem("FUTURE NODE IDENTIFIED. PROTOCOL: FIFO_RECOVERY.");
    
    playLockSound();
    
    // Zeno Lock Visuals
    setZenoLock(true);
    logSystem("ZENO EFFECT ENGAGED: QUANTUM STATE FROZEN.");
    
    // Auto Archive
    setTimeout(() => {
        logSystem("AUTO-TRIGGER: ARCHIVING BIOMETRICS...");
        executeArchive();
    }, 1500);
}

function executeArchive() {
    playDataBurst();
    const fileContent = generateSaveFile();
    
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
    
    logSystem("ARCHIVE COMPLETE. USER LOCKED INTO FIFO STACK.");
    connectionStatus.innerText = "UPLINK: PENDING (QUEUED)";
    connectionStatus.className = "online";
}

// Manual Save (kept for backup, but mainly automated now)
btnSave.addEventListener('click', () => {
    executeArchive();
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