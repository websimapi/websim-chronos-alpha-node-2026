import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls;
let particles, particleSystem;
let tunnel, tunnelMesh;
let clock;

// 2026 Colors
const COLOR_2026 = new THREE.Color(0x00ffcc);
// 2080 Colors
const COLOR_2080 = new THREE.Color(0xff3300);

let currentState = '2026'; // 2026, THROW, 2080

export function initThree(container) {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    clock = new THREE.Clock();

    createQuantumField();
    createTunnel();
    
    window.addEventListener('resize', onWindowResize);
    animate();
}

function createQuantumField() {
    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const r = 10 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Start blue (2026)
        colors[i * 3] = COLOR_2026.r;
        colors[i * 3 + 1] = COLOR_2026.g;
        colors[i * 3 + 2] = COLOR_2026.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function createTunnel() {
    const geometry = new THREE.CylinderGeometry(5, 5, 100, 32, 20, true);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    tunnelMesh = new THREE.Mesh(geometry, material);
    tunnelMesh.rotation.x = Math.PI / 2;
    tunnelMesh.visible = false;
    scene.add(tunnelMesh);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Logic to visualize the "Beacon Pulse"
export function triggerPulse(prime) {
    if (!particleSystem) return;
    
    // Scale slightly based on prime
    const scale = 1 + (prime % 10) * 0.05;
    
    // Quick tween-like expansion
    // In a real app we'd use a tween library, here we just jank it for simplicity
    const originalScale = particleSystem.scale.x;
    particleSystem.scale.setScalar(originalScale * 1.1);
    
    setTimeout(() => {
        if(particleSystem) particleSystem.scale.setScalar(1);
    }, 100);
}

// Change visualization mode
export function setVizMode(mode) {
    currentState = mode;
    
    if (mode === '2026') {
        tunnelMesh.visible = false;
        particleSystem.visible = true;
        controls.autoRotateSpeed = 0.5;
        animateColor(COLOR_2026);
    } else if (mode === 'THROW') {
        tunnelMesh.visible = true;
        tunnelMesh.material.opacity = 0.3;
        particleSystem.visible = true; // Keep field for context
        controls.autoRotateSpeed = 5.0; // Fast spin
    } else if (mode === '2080') {
        tunnelMesh.visible = false;
        particleSystem.visible = true;
        controls.autoRotateSpeed = 0.2; // Slower, heavier
        animateColor(COLOR_2080);
    }
}

// Blend colors of particles
function animateColor(targetColor) {
    const colors = particleSystem.geometry.attributes.color.array;
    for(let i=0; i<colors.length; i+=3) {
        // Instant for now to keep it simple, or we could interpolate over frames
        colors[i] = targetColor.r;
        colors[i+1] = targetColor.g;
        colors[i+2] = targetColor.b;
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
}

export function updateResync(value) {
    // 0 = 2080 (Red), 100 = 2026 (Blue)
    // Interpolate colors based on slider
    const ratio = value / 100;
    const r = THREE.MathUtils.lerp(COLOR_2080.r, COLOR_2026.r, ratio);
    const g = THREE.MathUtils.lerp(COLOR_2080.g, COLOR_2026.g, ratio);
    const b = THREE.MathUtils.lerp(COLOR_2080.b, COLOR_2026.b, ratio);
    
    const colors = particleSystem.geometry.attributes.color.array;
    for(let i=0; i<colors.length; i+=3) {
        colors[i] = r;
        colors[i+1] = g;
        colors[i+2] = b;
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
}

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    if (particleSystem) {
        particleSystem.rotation.y += 0.001;
        // Pulse breathing
        if (currentState !== 'THROW') {
            const scale = 1 + Math.sin(time) * 0.02;
            particleSystem.scale.setScalar(scale);
        }
    }

    if (currentState === 'THROW' && tunnelMesh) {
        // Tunnel effect
        tunnelMesh.rotation.z -= 0.05;
        // Jitter camera
        camera.position.x += (Math.random() - 0.5) * 0.1;
        camera.position.y += (Math.random() - 0.5) * 0.1;
        // Snap back slowly
        camera.position.x *= 0.9;
        camera.position.y *= 0.9;
    }

    controls.update();
    renderer.render(scene, camera);
}