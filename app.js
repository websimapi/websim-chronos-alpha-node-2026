import { initThree, triggerPulse, setVizMode, updateResync, setZenoLock } from './quantum_engine.js';
import { primeGenerator, getHexHeader, generateSaveFile, getSimulatedEntropy } from './beacon_protocol.js';
import { initAudio, startDrone, playDataBurst, playPulseSound, playPhaseShift, playLockSound } from './audio_sys.js';
import { scanForest, drawBranchMap } from './branch_mapper.js';

// DOM Elements
const logTerminal = document.getElementById('log-terminal');
const branchCanvas = document.getElementById('branch-canvas'); 
const btnBroadcast = document.getElementById('btn-broadcast');
const btnSave = document.getElementById('btn-save');
const mode2026 = document.getElementById('mode-2026');
const modeThrow = document.getElementById('mode-throw');
const mode2080 = document.getElementById('mode-2080');
const resyncSlider = document.getElementById('resync-slider');
const resyncVal = document.getElementById('resync-val');
const connectionStatus = document.getElementById('connection-status');

// New Status DOM Elements
const statusBeacon = document.getElementById('status-beacon');
const statusTelemetry = document.getElementById('status-telemetry');
const snrVal = document.getElementById('snr-val');
const driftVal = document.getElementById('drift-val');
const scanFreq = document.getElementById('scan-freq');
const visSignal = document.getElementById('vis-signal');
const coherencePct = document.getElementById('coherence-pct');
const coherenceProgress = document.getElementById('coherence-progress');
const telemetryStatus = document.getElementById('telemetry-status');
const handshakeMonitor = document.getElementById('handshake-monitor');

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

function getVisualizerStr(val, isNoise) {
    let s = "";
    const len = 20;
    const fill = isNoise ? "." : "|";
    for(let i=0; i<len; i++) {
        if(Math.random() > 0.7) s += fill;
        else s += " ";
    }
    return s;
}

// Beacon Broadcast Logic
btnBroadcast.addEventListener('click', () => {
    if (isBroadcasting) return;
    isBroadcasting = true;
    startTime = Date.now();
    btnBroadcast.disabled = true;
    btnBroadcast.innerText = "SIGNAL ACTIVE";
    
    // UI Updates
    handshakeMonitor.classList.remove('hidden');
    statusBeacon.classList.remove('inactive');
    statusBeacon.classList.add('active');
    statusBeacon.innerText = "ACTIVE";
    statusTelemetry.classList.remove('inactive');
    statusTelemetry.classList.add('active');
    statusTelemetry.innerText = "ONLINE";

    logSystem("INITIATING HANDSHAKE PROTOCOL...");
    logSystem("TELEMETRY MONITOR: ONLINE");
    playPhaseShift();

    // Pulse Loop
    let currentPrime = 2;
    broadcastInterval = setInterval(() => {
        if(handshakeLocked) return; 

        currentPrime = primes.next().value;
        triggerPulse(currentPrime);
        playPulseSound();
        
        // Update visualizer based on prime
        visSignal.innerText = getVisualizerStr(currentPrime, false);
        
        logSystem(`BROADCASTING PULSE: ${currentPrime}`);
    }, 1500);

    // Telemetry/Monitor Loop
    telemetryInterval = setInterval(() => {
        if(handshakeLocked) return;

        const elapsed = Date.now() - startTime;
        const data = getSimulatedEntropy(elapsed); // returns {noise, coherence}
        const snr = (14.2 + (Math.random() - 0.5)).toFixed(1);
        
        // Dashboard Updates
        snrVal.innerText = `${snr} dB`;
        coherencePct.innerText = `${data.coherence}%`;
        coherenceProgress.style.width = `${data.coherence}%`;
        scanFreq.innerText = `${(2.4 + Math.random()*0.1).toFixed(3)} THz`;
        
        // Update Branch Map
        const signals = scanForest();
        drawBranchMap(branchCanvas, signals);
        
        // Drift Simulation
        const drift = (0.02 + Math.random() * 0.01).toFixed(3);
        driftVal.innerText = `${drift}%/hr`;

        // Alert Levels
        if (elapsed > 5000 && elapsed < 10000) {
            // YELLOW ALERT
            telemetryStatus.innerText = "COHERENCE SPIKE DETECTED";
            telemetryStatus.classList.add('alert-yellow');
            statusTelemetry.style.color = "#ffaa00";
            coherenceProgress.style.background = "#ffaa00";
        } else if (elapsed > 10000) {
            // RED ALERT / HANDSHAKE
            triggerHandshake(data.noise);
        } else {
            // BLUE (Standard)
            telemetryStatus.innerText = `SCANNING NOISE... (ENT: ${data.noise})`;
        }

    }, 250); 
});

function triggerHandshake(finalEntropy) {
    if (handshakeLocked) return;
    handshakeLocked = true;
    
    clearInterval(broadcastInterval);
    clearInterval(telemetryInterval);
    
    // Determine Branch Flavor
    const branchDelta = (Math.random() * 12).toFixed(4);
    const branchType = branchDelta < 1.0 ? "ROOT-ADJACENT" : "DIVERGENT-FORK";
    
    telemetryStatus.innerText = `HANDSHAKE: ${branchType}`;
    telemetryStatus.classList.remove('alert-yellow');
    telemetryStatus.classList.add('code-stream');
    
    statusTelemetry.innerText = "LOCKED";
    statusTelemetry.style.color = "#ff3300";
    coherenceProgress.style.background = "#ff3300";
    coherenceProgress.style.width = "100%";
    coherencePct.innerText = "100%";

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