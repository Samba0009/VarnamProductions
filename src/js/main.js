/* Varnam Productions - Main Logic & Interactivity */
import { initNetflixExperience } from './netflix.js';

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. Custom Cinematic Cursor Tracking ---
  const initCustomCursor = () => {
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('custom-cursor-follower');
    
    if (!cursor || !follower) return;
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let hasMoved = false;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (!hasMoved) {
        hasMoved = true;
        // Instantly position elements under the pointer on first movement
        followerX = mouseX;
        followerY = mouseY;
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;
        
        cursor.classList.add('visible');
        follower.classList.add('visible');
      }
      
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });
    
    // Follower lag animation loop using requestAnimationFrame
    const animateFollower = () => {
      if (hasMoved) {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;
      }
      requestAnimationFrame(animateFollower);
    };
    animateFollower();
    
    // Smooth hover effect hooks on all interactive selectors
    const hoverTargets = document.querySelectorAll('.cursor-hover, a, button, select, input, textarea, [role="button"]');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('custom-cursor-active');
        follower.classList.add('custom-cursor-follower-active');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('custom-cursor-active');
        follower.classList.remove('custom-cursor-follower-active');
      });
    });
  };
  
  initCustomCursor();

  // --- 2. Ambient Audio Manager (Web Audio API Cinematic Drone Synth with Real-Time Golden Visualizer & Dynamic Soundscapes) ---
  const audioControl = document.getElementById('audio-control');
  const visualizerCanvas = document.getElementById('audio-visualizer');
  let audioCtx = null;
  let droneOsc = null;
  let lfoOsc = null;
  let chordOsc1 = null;
  let chordOsc2 = null;
  let chordGain = null;
  let filterNode = null;
  let gainNode = null;
  let analyser = null;
  let visualizerCtx = null;
  let visualizerAnimationId = null;
  let isAudioPlaying = false;
  let activeSection = 'hero';

  const initCinematicDrone = () => {
    // Initialize standard Audio Context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    
    // Create AnalyserNode
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    if (visualizerCanvas) {
      visualizerCtx = visualizerCanvas.getContext('2d');
    }
    
    // Create Low-frequency Drone oscillator
    droneOsc = audioCtx.createOscillator();
    droneOsc.type = 'triangle'; 
    droneOsc.frequency.setValueAtTime(55, audioCtx.currentTime); // Deep A1 Note

    // Create LFO to gently modulate frequency for rich motion
    lfoOsc = audioCtx.createOscillator();
    lfoOsc.type = 'sine';
    lfoOsc.frequency.setValueAtTime(0.25, audioCtx.currentTime); // Very slow swell

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(1.5, audioCtx.currentTime); // Pitch fluctuation depth

    // Create chord oscillators for beautiful secondary sweeps
    chordOsc1 = audioCtx.createOscillator();
    chordOsc1.type = 'sine';
    chordOsc1.frequency.setValueAtTime(110, audioCtx.currentTime); // A2
    
    chordOsc2 = audioCtx.createOscillator();
    chordOsc2.type = 'sine';
    chordOsc2.frequency.setValueAtTime(165, audioCtx.currentTime); // E3

    chordGain = audioCtx.createGain();
    chordGain.gain.setValueAtTime(0.0, audioCtx.currentTime); // Muted by default

    // Create Low Pass Filter to keep it warm, dark, and atmospheric
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(180, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(3, audioCtx.currentTime);

    // Main volume gain node
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime); // Start silent

    // Connections
    lfoOsc.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency); // Modulate pitch
    
    droneOsc.connect(filterNode);
    
    chordOsc1.connect(chordGain);
    chordOsc2.connect(chordGain);
    chordGain.connect(filterNode);
    
    filterNode.connect(gainNode);
    gainNode.connect(analyser); // Analyze the signal
    analyser.connect(audioCtx.destination);

    // Start oscillators
    droneOsc.start();
    lfoOsc.start();
    chordOsc1.start();
    chordOsc2.start();
  };

  const drawVisualizer = () => {
    if (!isAudioPlaying || !analyser || !visualizerCtx || !visualizerCanvas) return;
    
    visualizerAnimationId = requestAnimationFrame(drawVisualizer);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    
    // Auto-adjust canvas internal dimensions to display size
    const width = visualizerCanvas.width = visualizerCanvas.clientWidth;
    const height = visualizerCanvas.height = visualizerCanvas.clientHeight;
    
    visualizerCtx.clearRect(0, 0, width, height);
    
    // Draw beautiful smooth golden wave
    visualizerCtx.lineWidth = 2.0;
    visualizerCtx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    visualizerCtx.shadowBlur = 6;
    visualizerCtx.shadowColor = 'rgba(212, 175, 55, 0.8)';
    
    visualizerCtx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      
      if (i === 0) {
        visualizerCtx.moveTo(x, y);
      } else {
        visualizerCtx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    visualizerCtx.lineTo(width, height / 2);
    visualizerCtx.stroke();
  };

  const fadeChordVol = (targetVal, duration) => {
    if (!chordGain || !audioCtx) return;
    const now = audioCtx.currentTime;
    chordGain.gain.cancelScheduledValues(now);
    chordGain.gain.setValueAtTime(chordGain.gain.value, now);
    chordGain.gain.linearRampToValueAtTime(targetVal, now + duration);
  };

  const updateCinematicSoundscape = (sectionId) => {
    if (!audioCtx || audioCtx.state === 'suspended' || !isAudioPlaying) return;
    if (activeSection === sectionId) return;
    activeSection = sectionId;
    
    const now = audioCtx.currentTime;
    
    // Reset parameter swells smoothly to prevent clicks
    if (filterNode) {
      filterNode.frequency.cancelScheduledValues(now);
      filterNode.Q.cancelScheduledValues(now);
    }
    if (droneOsc) {
      droneOsc.frequency.cancelScheduledValues(now);
    }
    if (chordOsc1 && chordOsc2) {
      chordOsc1.frequency.cancelScheduledValues(now);
      chordOsc2.frequency.cancelScheduledValues(now);
    }
    
    // Transition synthesizer mapping based on active scrolled section
    switch (sectionId) {
      case 'hero':
        // Warm deep triangle drone
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        filterNode.frequency.linearRampToValueAtTime(180, now + 1.5);
        filterNode.Q.linearRampToValueAtTime(3, now + 1.5);
        fadeChordVol(0, 1.5);
        break;
        
      case 'portfolio':
        // Client Videos section: Sub-bass cinematic rumble and cleaner filter spacing
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        filterNode.frequency.linearRampToValueAtTime(240, now + 1.5);
        filterNode.Q.linearRampToValueAtTime(1.5, now + 1.5);
        fadeChordVol(0, 1.5);
        break;
        
      case 'pipeline':
        // Production Pipeline: Resonant filter with slow rhythmic ticking feel
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        filterNode.frequency.linearRampToValueAtTime(140, now + 1.5);
        filterNode.Q.linearRampToValueAtTime(7, now + 1.5); // Tight feedback Q
        fadeChordVol(0, 1.5);
        break;
        
      case 'philosophy':
        // Creative Manifesto: Swell beautiful holy golden triad chord (A2 + E3)
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        filterNode.frequency.linearRampToValueAtTime(320, now + 2.0); // Open filter
        filterNode.Q.linearRampToValueAtTime(2, now + 2.0);
        
        if (chordOsc1 && chordOsc2) {
          chordOsc1.frequency.setValueAtTime(110, now); // A2
          chordOsc2.frequency.setValueAtTime(165, now); // E3
          fadeChordVol(0.08, 2.0); // Harmonize nicely
        }
        break;
        
      case 'team':
      case 'news':
        // Roster & Press: Warm drone
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        filterNode.frequency.linearRampToValueAtTime(200, now + 1.5);
        filterNode.Q.linearRampToValueAtTime(2, now + 1.5);
        fadeChordVol(0, 1.5);
        break;
        
      case 'contact':
        // Contact: Sweeping low filter swell for a high-end transmission signature
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.0);
        filterNode.frequency.setValueAtTime(120, now);
        filterNode.frequency.linearRampToValueAtTime(300, now + 2.5); // Filter sweep
        filterNode.Q.linearRampToValueAtTime(5, now + 2.0);
        fadeChordVol(0, 1.5);
        break;
        
      default:
        // Default warm rumbling tone
        droneOsc.frequency.linearRampToValueAtTime(55, now + 1.5);
        filterNode.frequency.linearRampToValueAtTime(180, now + 1.5);
        fadeChordVol(0, 1.5);
    }
  };

  const startAudioDrone = () => {
    if (!audioCtx) initCinematicDrone();
    
    // Resume context if suspended (browser security autoplays rules)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Sweet fade-in to prevent harsh clipping clicks
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2.0); // 2 second swell
    isAudioPlaying = true;
    
    audioControl.classList.add('playing');
    audioControl.querySelector('.audio-label').textContent = 'SOUND ON';
    
    // Trigger Visualizer Loop
    drawVisualizer();
  };

  const stopAudioDrone = () => {
    if (gainNode) {
      // Sweet fade-out
      gainNode.gain.setValueAtTime(gainNode.gain.value, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    }
    isAudioPlaying = false;
    
    audioControl.classList.remove('playing');
    audioControl.querySelector('.audio-label').textContent = 'SOUND OFF';
    
    // Cancel Visualizer animation
    if (visualizerAnimationId) {
      cancelAnimationFrame(visualizerAnimationId);
      visualizerAnimationId = null;
    }
  };

  if (audioControl) {
    audioControl.addEventListener('click', () => {
      if (isAudioPlaying) {
        stopAudioDrone();
      } else {
        startAudioDrone();
      }
    });
  }

  // --- 3. Hero Atmospheric 3D Particles Canvas (Three.js) ---
  const canvas = document.getElementById('dust-canvas');
  if (canvas) {
    let scene, camera, renderer, particleSystem;
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    const initThree = () => {
      // 1. Scene & Camera setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, canvas.parentElement.offsetWidth / canvas.parentElement.offsetHeight, 0.1, 100);
      camera.position.z = 30;
      
      // 2. WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });
      renderer.setSize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // 3. Particle Geometry
      const particleCount = 1800;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        // Form particles in an organic 3D double spiral / vortex structure
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 25 + 2; 
        const y = (Math.random() - 0.5) * 15; // Vertical dispersion
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      // 4. Particle Material with glowing canvas-based texture
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16;
      pCanvas.height = 16;
      const pCtx = pCanvas.getContext('2d');
      const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.8)'); /* Royal Gold */
      grad.addColorStop(1, 'rgba(7, 7, 9, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 16, 16);
      
      const texture = new THREE.CanvasTexture(pCanvas);
      
      const material = new THREE.PointsMaterial({
        size: 0.45,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: 0xffd700 /* Glowing gold particles */
      });
      
      // 5. Point System
      particleSystem = new THREE.Points(geometry, material);
      scene.add(particleSystem);
      
      // Mouse interaction tracking
      document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX) * 0.04;
        mouseY = (e.clientY - windowHalfY) * 0.04;
      });
    };
    
    initThree();
    
    // Animate Loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      const posAttr = particleSystem.geometry.attributes.position;
      
      // Orbit & pulse animation
      for (let i = 0; i < posAttr.count; i++) {
        let x = posAttr.getX(i);
        let y = posAttr.getY(i);
        let z = posAttr.getZ(i);
        
        // Slowly rotate around vertical Y-axis
        const theta = 0.002;
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        
        const newX = x * cosTheta - z * sinTheta;
        const newZ = x * sinTheta + z * cosTheta;
        
        // Add subtle wave oscillation to Y
        const wave = Math.sin(elapsedTime * 0.5 + x * 0.1) * 0.015;
        
        posAttr.setX(i, newX);
        posAttr.setY(i, y + wave);
        posAttr.setZ(i, newZ);
      }
      
      posAttr.needsUpdate = true;
      
      // Interpolate target camera position for premium mouse-parallax lag effect
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      
      camera.position.x = targetX;
      camera.position.y = -targetY;
      camera.lookAt(scene.position);
      
      // Subtle rotation of the whole system
      particleSystem.rotation.y = elapsedTime * 0.015;
      particleSystem.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Resize Listener
    window.addEventListener('resize', () => {
      const width = canvas.parentElement.offsetWidth;
      const height = canvas.parentElement.offsetHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    });
  }

  // --- 3b. Interactive 3D Phone Reel Visualization (Three.js) ---
  const initPhone3D = () => {
    const phoneCanvas = document.getElementById('phone-3d-canvas');
    if (!phoneCanvas) return;
    
    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Robust size calculations with strict mobile fallbacks
    const getContainerSize = () => {
      const parent = phoneCanvas.parentElement;
      let w = parent ? parent.clientWidth : 0;
      let h = parent ? parent.clientHeight : 0;
      
      if (w === 0 && parent) {
        const rect = parent.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
      }
      
      return {
        width: w || 320,
        height: h || 320
      };
    };
    
    const initialSize = getContainerSize();
    const camera = new THREE.PerspectiveCamera(45, initialSize.width / initialSize.height, 0.1, 100);
    camera.position.set(0, 0, 10);
    
    const renderer = new THREE.WebGLRenderer({
      canvas: phoneCanvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(initialSize.width, initialSize.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    
    const pointLight = new THREE.PointLight(0xd4af37, 2, 10); // Glowing gold light
    pointLight.position.set(-3, -3, 3);
    scene.add(pointLight);
    
    // 3. Dynamic 2D Canvas Screen Texture
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 256;
    screenCanvas.height = 512;
    const sCtx = screenCanvas.getContext('2d');
    
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    
    // Draw phone screen loop
    const updateScreenTexture = (time) => {
      sCtx.clearRect(0, 0, 256, 512);
      
      // A. Premium Gradient Background (Looping waves)
      const grad = sCtx.createLinearGradient(0, 0, 0, 512);
      const waveShift = Math.sin(time * 0.0025) * 40;
      grad.addColorStop(0, '#060b18'); // Deep navy
      grad.addColorStop(0.5, '#0c1326');
      grad.addColorStop(1, '#1b0e22'); // Warm touch
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 512);
      
      // B. Looping glowing vertical waves (Mocking vertical content video playing)
      sCtx.save();
      sCtx.beginPath();
      const waveRadius = 75 + Math.sin(time * 0.002) * 15;
      const waveY = 220 + Math.cos(time * 0.001) * 30;
      const gradientRadial = sCtx.createRadialGradient(128, waveY, 5, 128, waveY, waveRadius);
      gradientRadial.addColorStop(0, 'rgba(212, 175, 55, 0.45)'); // Glowing gold center
      gradientRadial.addColorStop(0.7, 'rgba(229, 9, 20, 0.15)'); // Crimson transition
      gradientRadial.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = gradientRadial;
      sCtx.arc(128, waveY, waveRadius, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.restore();
      
      // C. Reel Overlay UI: User Profile Icon
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      sCtx.beginPath();
      sCtx.arc(28, 430, 14, 0, Math.PI * 2); // Avatar Circle
      sCtx.fill();
      
      sCtx.fillStyle = '#d4af37';
      sCtx.beginPath();
      sCtx.arc(28, 430, 8, 0, Math.PI * 2); // Avatar Center Gold
      sCtx.fill();
      
      // D. User Name and Caption text
      sCtx.font = 'bold 12px sans-serif';
      sCtx.fillStyle = '#ffffff';
      sCtx.fillText('@varnam.prod', 48, 426);
      
      sCtx.font = '9px sans-serif';
      sCtx.fillStyle = '#a1a1aa';
      sCtx.fillText('Reels in 10 Minutes... ⚡', 48, 440);
      
      // E. Right column interaction buttons (Like, Comment, Share)
      // Like (Heart icon representation)
      sCtx.fillStyle = '#e50914'; // Crimson Like
      sCtx.beginPath();
      sCtx.arc(228, 220, 10, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.font = 'bold 8px sans-serif';
      sCtx.fillStyle = '#ffffff';
      sCtx.fillText('12.4K', 216, 238);
      
      // Comment
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      sCtx.beginPath();
      sCtx.arc(228, 270, 10, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.font = 'bold 8px sans-serif';
      sCtx.fillStyle = '#ffffff';
      sCtx.fillText('428', 220, 288);
      
      // Share
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      sCtx.beginPath();
      sCtx.arc(228, 320, 10, 0, Math.PI * 2);
      sCtx.fill();
      sCtx.fillText('1.2K', 218, 338);
      
      // F. Running Progress bar at bottom
      const progressWidth = ((time * 0.015) % 210) + 14;
      sCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      sCtx.fillRect(16, 480, 224, 4);
      sCtx.fillStyle = '#d4af37'; // Gold progress bar!
      sCtx.fillRect(16, 480, progressWidth, 4);
      
      // Tell Three.js screen texture needs update
      screenTexture.needsUpdate = true;
    };
    
    // 4. Create 3D Smartphone Mesh Group
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);
    
    // A. Main metal chassis
    const bodyGeo = new THREE.BoxGeometry(2.35, 4.7, 0.16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x070c18, // Deep Royal Navy
      metalness: 0.9,
      roughness: 0.15
    });
    const phoneChassis = new THREE.Mesh(bodyGeo, bodyMat);
    phoneGroup.add(phoneChassis);
    
    // B. Inner Phone Screen Mesh
    const screenGeo = new THREE.BoxGeometry(2.23, 4.58, 0.02);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture
    });
    const phoneScreen = new THREE.Mesh(screenGeo, screenMat);
    phoneScreen.position.z = 0.081; // Lay exactly on the front of the body
    phoneGroup.add(phoneScreen);
    
    // C. Phone Bezel Border (Glass shine overlay)
    const bezelGeo = new THREE.BoxGeometry(2.27, 4.62, 0.01);
    const bezelMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const phoneBezel = new THREE.Mesh(bezelGeo, bezelMat);
    phoneBezel.position.z = 0.086;
    phoneGroup.add(phoneBezel);
    
    // D. Dynamic Island / Camera Notch Pill
    const notchGeo = new THREE.BoxGeometry(0.65, 0.16, 0.01);
    const notchMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const phoneNotch = new THREE.Mesh(notchGeo, notchMat);
    phoneNotch.position.set(0, 2.1, 0.088);
    phoneGroup.add(phoneNotch);
    
    // 5. Mouse Interactive Tilting
    let targetXRot = 0.1, targetYRot = -0.3;
    let currentXRot = 0.1, currentYRot = -0.3;
    
    document.addEventListener('mousemove', (e) => {
      // Calculate normalized mouse positions (-0.5 to 0.5)
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;
      
      // Target tilting angles
      targetYRot = mouseX * 0.7;
      targetXRot = mouseY * 0.7;
    });
    
    // 6. Animation Loop
    const animatePhone = (timestamp) => {
      requestAnimationFrame(animatePhone);
      
      // Update screen dynamic content
      updateScreenTexture(timestamp);
      
      // Smooth interpolation (lerp) for the phone mouse-parallax tilt
      currentXRot += (targetXRot - currentXRot) * 0.08;
      currentYRot += (targetYRot - currentYRot) * 0.08;
      
      phoneGroup.rotation.x = currentXRot;
      phoneGroup.rotation.y = currentYRot;
      
      // Soft sinusoidal floating hover motion
      phoneGroup.position.y = Math.sin(timestamp * 0.0012) * 0.16;
      
      // Subtle auto spin so it shows off the metalness on borders
      phoneGroup.rotation.z = Math.sin(timestamp * 0.0006) * 0.04;
      
      renderer.render(scene, camera);
    };
    
    animatePhone(0);
    
    // 7. Resize Event with robust sizing fallbacks
    const handleResize = () => {
      if (!phoneCanvas) return;
      const size = getContainerSize();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force deferred layout passes to guarantee canvas scaling matches completed reflows
    setTimeout(handleResize, 100);
    setTimeout(handleResize, 500);
  };

  // Trigger Phone 3D rendering
  initPhone3D();

  // --- 4. Sticky Header State & Active Links on Scroll ---
  const header = document.getElementById('main-header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    // Add scrolled class for glass background swap
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Active Navigation Highlighting on scroll index
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    if (currentSectionId) {
      updateCinematicSoundscape(currentSectionId);
    }
    
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // --- 5. Mobile Menu Drawer Navigation ---
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuToggle && mobileMenuDrawer) {
    const toggleMenu = () => {
      mobileMenuToggle.classList.toggle('active');
      mobileMenuDrawer.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    };

    mobileMenuToggle.addEventListener('click', toggleMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active');
        mobileMenuDrawer.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // --- 6. Scroll Trigger Fade Up Animations (Intersection Observer) ---
  const fadeUpElements = document.querySelectorAll('.fade-up');
  
  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once animated, no need to watch again
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element hits viewport
    });
    
    fadeUpElements.forEach((el) => fadeObserver.observe(el));
  } else {
    // Fallback: instantly show if observer is not supported
    fadeUpElements.forEach((el) => el.classList.add('visible'));
  }

  // --- 7. Immersive Video Showreel Modal Handler ---
  const playShowreelBtn = document.getElementById('play-showreel-btn');
  const videoModal = document.getElementById('video-modal');
  const videoModalClose = document.getElementById('video-modal-close');
  const videoModalBackdrop = document.getElementById('video-modal-backdrop');
  const showreelVideo = document.getElementById('showreel-video');
  const posterOverlay = document.getElementById('video-poster-overlay');

  if (videoModal && showreelVideo) {
    
    const openShowreel = () => {
      videoModal.classList.add('active');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      
      // Auto-trigger cinematic hum if not already playing
      if (!isAudioPlaying) {
        startAudioDrone();
      }
    };

    const closeShowreel = () => {
      videoModal.classList.remove('active');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      
      // Pause and reset video
      showreelVideo.pause();
      showreelVideo.currentTime = 0;
      posterOverlay.classList.remove('fade-out');
    };

    if (playShowreelBtn) playShowreelBtn.addEventListener('click', openShowreel);
    if (videoModalClose) videoModalClose.addEventListener('click', closeShowreel);
    if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeShowreel);

    // Escape Key trigger to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeShowreel();
      }
    });

    // Poster overlay click triggers video play
    if (posterOverlay) {
      posterOverlay.addEventListener('click', () => {
        posterOverlay.classList.add('fade-out');
        showreelVideo.muted = false;
        
        // Swell play
        showreelVideo.play().catch(err => {
          console.log("Auto-play blocked by browser. Playing muted first.", err);
          showreelVideo.muted = true;
          showreelVideo.play();
        });
      });
    }
  }

  // --- 8. Dynamic Portfolio Grid Filter System ---
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioGrid = document.getElementById('portfolio-grid');
  
  if (portfolioGrid) {
    const cards = portfolioGrid.querySelectorAll('.portfolio-card');
    
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Toggle Active Class
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterVal = btn.getAttribute('data-filter');
        
        // Fluid transition animations
        cards.forEach((card) => {
          const category = card.getAttribute('data-category');
          
          if (filterVal === 'all' || category === filterVal) {
            card.classList.remove('hide');
            // Re-fade in nicely
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px) scale(0.98)';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0) scale(1)';
              card.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            }, 30);
          } else {
            card.classList.add('hide');
          }
        });
      });
    });
  }

  // --- 9. Lightbox Project details Modal ---
  const projectModal = document.getElementById('project-modal');
  const projectModalClose = document.getElementById('project-modal-close');
  const projectModalBackdrop = document.getElementById('project-modal-backdrop');
  
  const mTitle = document.getElementById('project-modal-title');
  const mGenre = document.getElementById('project-modal-genre');
  const mDesc = document.getElementById('project-modal-desc');
  const mDirector = document.getElementById('project-modal-director');
  const mYear = document.getElementById('project-modal-year');
  const mStatus = document.getElementById('project-modal-status');
  const mImg = document.getElementById('project-modal-img');

  // Pre-configured projects data mapping for the lightbox details
  const projectsData = {
    'NEBULA VR BRANDING': {
      genre: 'BRAND REEL / TECH',
      desc: 'A high-concept launch campaign for Nebula Tech\'s next-generation VR headset. Blending virtual CGI environments with fluid, high-speed camera transitions to showcase extreme depth of field and state-of-the-art optical clarity. Designed for hyper-impact vertical screens.',
      director: 'Nebula Tech',
      year: '2025',
      status: 'Active Campaign',
      img: '/images/nebula_drift.png'
    },
    'SHADOW APPAREL REEL': {
      genre: 'VERTICAL REEL / SOCIAL',
      desc: 'A high-contrast, moody urban vertical fashion campaign for Shadow Apparel. Shot entirely under dark neon elements with slow-motion fluid captures to highlight details of premium techwear, backed by an immersive sub-bass soundtrack.',
      director: 'Shadow Apparel',
      year: '2026',
      status: 'Trending Online',
      img: '/images/shadow_monarch.png'
    },
    'MONSOON RESORT TRAILER': {
      genre: 'PROMOTIONAL / TRAVEL',
      desc: 'An organic and evocative branding cinematic essay exploring rain-slicked luxury retreats for Monsoon Resorts in Kerala. Utilizing dynamic HDR sensors, gimbal stabilizers, and atmospheric field audio to present a prestigious, slow-motion travel getaway experience.',
      director: 'Monsoon Resorts',
      year: '2026',
      status: 'Campaign Active',
      img: '/images/echoes_monsoon.png'
    },
    'LUMOS EV BRANDING': {
      genre: 'COMMERCIAL / ADVANCED VISUALS',
      desc: 'A futuristic commercial for Lumos Automotive. Features high-speed robotic arm sweeps and complex virtual production backdrops inside Unreal Engine 5.4, seamlessly blending the contours of a premium EV with real-time digital light ribbons.',
      director: 'Lumos Automotive',
      year: '2026',
      status: 'Broadcast Active',
      img: '/images/project_lumos.png'
    },
    'APEX RUNTIME CAMPAIGN': {
      genre: 'BRAND FILM / ACTIVEWEAR',
      desc: 'An acrobatic, continuous single-take micro-commercial for APEX sportswear. Shot with custom mechanical steady-cams to follow athletes through intensive parkour movements, highlighting garment stretch and dynamic durability.',
      director: 'APEX Sportswear',
      year: '2025',
      status: '15M+ Views Active',
      img: '/images/chrono_trigger.png'
    },
    'VELVET COUTURE SHORT': {
      genre: 'COMMERCIAL / HIGH FASHION',
      desc: 'A breathtakingly beautiful visual showcase celebrating Velvet Couture\'s autumn fabric release. Captures the dynamics of silk and flowing structures moving in hyper slow-motion under golden-hour warm gradient light sweeps.',
      director: 'Velvet Couture',
      year: '2026',
      status: 'Campaign Active',
      img: '/images/ethereal.png'
    }
  };

  if (projectModal) {
    const discoverButtons = document.querySelectorAll('.card-action-btn, .portfolio-card');
    
    discoverButtons.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid duplicate triggering if clicking child buttons
        
        // Find title of card to match database
        const card = trigger.closest('.portfolio-card');
        const titleEl = card.querySelector('.card-title');
        const title = titleEl ? titleEl.textContent.trim() : '';
        
        const data = projectsData[title];
        
        if (data) {
          // Fill Modal info dynamically
          mTitle.textContent = title;
          mGenre.textContent = data.genre;
          mDesc.textContent = data.desc;
          mDirector.textContent = data.director;
          mYear.textContent = data.year;
          mStatus.textContent = data.status;
          mImg.src = data.img;
          mImg.alt = `${title} Film Details Visual`;

          // Activate Modal
          projectModal.classList.add('active');
          projectModal.setAttribute('aria-hidden', 'false');
          document.body.classList.add('no-scroll');
        }
      });
    });

    const closeProjectModal = () => {
      projectModal.classList.remove('active');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };

    if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
    if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeProjectModal);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        closeProjectModal();
      }
    });
  }

  // --- 10. Production Pipeline Timeline Scroll Progress Bar ---
  const pipelineSection = document.getElementById('pipeline');
  const progressFill = document.getElementById('timeline-progress-fill');
  const timelineSteps = document.querySelectorAll('.timeline-step');
  
  if (pipelineSection && progressFill) {
    window.addEventListener('scroll', () => {
      const rect = pipelineSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of pipeline section is scrolled past viewport
      const totalHeight = rect.height;
      const scrolledPast = viewportHeight - rect.top;
      
      if (scrolledPast > 0 && rect.top < viewportHeight) {
        let percent = (scrolledPast / (totalHeight + viewportHeight)) * 100;
        // Clamp bounds
        percent = Math.min(Math.max(percent, 5), 100);
        progressFill.style.height = `${percent}%`;
        
        // Calculate milestones active highlights
        timelineSteps.forEach((step, index) => {
          const stepRect = step.getBoundingClientRect();
          if (stepRect.top < viewportHeight * 0.7) {
            step.classList.add('active');
          } else {
            // Keep at least step 1 active
            if (index > 0) step.classList.remove('active');
          }
        });
      }
    });
  }

  // --- 11. Glassmorphic Form custom submission & High-fidelity validations ---
  const form = document.getElementById('cinematic-contact-form');
  const toast = document.getElementById('toast-notification');
  const submitBtn = document.getElementById('form-submit-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Form Inputs
      const name = document.getElementById('form-name');
      const email = document.getElementById('form-email');
      const inquiry = document.getElementById('form-inquiry-type');
      const message = document.getElementById('form-message');
      
      let isValid = true;
      
      // 1. Validation Name
      if (!name.value.trim()) {
        name.classList.add('invalid');
        isValid = false;
      } else {
        name.classList.remove('invalid');
      }
      
      // 2. Validation Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) {
        email.classList.add('invalid');
        isValid = false;
      } else {
        email.classList.remove('invalid');
      }
      
      // 3. Validation Inquiry Selection
      if (!inquiry.value) {
        inquiry.classList.add('invalid');
        isValid = false;
      } else {
        inquiry.classList.remove('invalid');
      }
      
      // 4. Validation Message
      if (!message.value.trim()) {
        message.classList.add('invalid');
        isValid = false;
      } else {
        message.classList.remove('invalid');
      }
      
      // Submit Action Trigger
      if (isValid) {
        // Change button state to "transmitting"
        const originalText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = 'TRANSMITTING SIGNAL...';
        submitBtn.disabled = true;
        
        // Mock network delay (1.5 seconds)
        setTimeout(() => {
          // Success! Show premium Toast Notification
          if (toast) {
            toast.classList.add('active');
            
            // Auto dismiss toast after 5 seconds
            setTimeout(() => {
              toast.classList.remove('active');
            }, 5000);
          }
          
          // Reset form fields
          form.reset();
          submitBtn.querySelector('span').textContent = originalText;
          submitBtn.disabled = false;
        }, 1500);
      }
    });
    
    // Auto-remove invalid border when user starts correcting inputs
    const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          input.classList.remove('invalid');
        }
      });
      if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => {
          if (input.value) {
            input.classList.remove('invalid');
          }
        });
      }
    });
  }

  // --- 11b. Interactive Pipeline Tech Specs Toggle ---
  const specsToggles = document.querySelectorAll('.step-specs-toggle');
  specsToggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering timeline node clicks
      
      const details = toggle.nextElementSibling;
      const isOpen = toggle.classList.contains('active');
      
      toggle.classList.toggle('active');
      if (details) {
        details.classList.toggle('active');
      }
      
      toggle.setAttribute('aria-expanded', !isOpen);
      
      const label = toggle.querySelector('span:first-child');
      if (label) {
        label.textContent = isOpen ? 'View Phase Tools' : 'Hide Phase Tools';
      }
    });
  });

  // --- 12. Netflix Premium Experience Orchestrator ---
  initNetflixExperience();

});
