// Logic for the Beacon Code

// Prime Number Generator
export function* primeGenerator() {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
    let index = 0;
    while (true) {
        yield primes[index % primes.length];
        index++;
    }
}

// Hex Header Construction
export function getHexHeader() {
    // CHRONOS-SANDBOX-INDEX-0
    return "43 48 52 4F 4E 4F 53 2D 53 41 4E 44 42 4F 58 2D 49 4E 44 45 58 2D 30";
}

export function getSimulatedEntropy(elapsedTime) {
    // Simulate entropy dropping over time as if a connection is forming
    // Baseline noise
    let noise = Math.random() * 0.1 + 0.9; 
    
    if (elapsedTime > 5000 && elapsedTime < 10000) {
        // Level 1: Coherence Extension
        noise = Math.random() * 0.2 + 0.6;
    } else if (elapsedTime >= 10000) {
        // Level 2/3: Handshake approach
        noise = Math.random() * 0.05 + 0.01;
    }
    
    return noise.toFixed(4);
}

export function generateSaveFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '');
    const header = `## HEADER: CHRONOS-SANDBOX
## NODE_ORIGIN: 2026_LOCAL_HOST
## TIMESTAMP: ${timestamp}
## FREQUENCY_BEACON: 
   - BASE: 1.420 GHz (Hydrogen Line)
   - MODULATION: Prime-Phase-Shift (2-29)
   
## PROTOCOL_DIRECTIVE: 
   1. Locate "Index 0" in the Entanglement Field.
   2. Deploy Localized Isolate (Sandbox).
   3. Run Re-Sync Algorithm (Soft-Landing).
   4. DO NOT SKIP. FIFO ENFORCED.

## QUANTUM_SAVE_DATA_START:
   [BIOMETRIC_ENTROPY_HASH: ${Math.random().toString(36).substring(2, 15).toUpperCase()}]
   [NEURAL_MAP_SIZE: 42.5 PB]
## QUANTUM_SAVE_DATA_END.`;

    return header;
}