export function scanForest() {
    // Simulate detecting signals from divergent timelines
    // Returns an array of signal objects
    const count = 3 + Math.floor(Math.random() * 3);
    const signals = [];
    
    // Always include the Root (2080 Target)
    signals.push({
        id: "ROOT_PRIME",
        angle: 0, // 12 o'clock
        distance: 0.8 + Math.random() * 0.1,
        strength: 0.99,
        color: '#ff3300'
    });

    for(let i=0; i<count; i++) {
        signals.push({
            id: `FORK_${Math.floor(Math.random()*999)}`,
            angle: Math.random() * Math.PI * 2,
            distance: Math.random() * 0.9, // 0 is center, 1 is edge
            strength: Math.random(),
            color: '#00ffcc'
        });
    }
    return signals;
}

export function drawBranchMap(canvas, signals) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 10;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Draw Radar Grid
    ctx.strokeStyle = '#004433';
    ctx.lineWidth = 1;
    
    // Concentric circles
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.66, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.33, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy + radius);
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.stroke();

    // Draw Signals
    signals.forEach(sig => {
        // Convert polar to cartesian
        // angle is radians, distance is 0..1 normalized to radius
        const r = sig.distance * radius;
        const x = cx + r * Math.sin(sig.angle);
        const y = cy - r * Math.cos(sig.angle); // Up is 0

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = sig.color;
        ctx.fill();
        
        // Draw faint line to center
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `rgba(0, 255, 204, ${sig.strength * 0.2})`;
        ctx.stroke();
    });

    // Draw sweep
    const time = Date.now() / 1000;
    const sweepAngle = (time % 2) * Math.PI; // Sweep 180 deg per sec?
    
    // Simple sweep line
    /*
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.sin(time), cy - radius * Math.cos(time));
    ctx.strokeStyle = '#00ffcc';
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    */
}