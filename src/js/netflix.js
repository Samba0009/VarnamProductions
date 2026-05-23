/* Varnam Productions - Netflix-Style Controller Script */

// --- 1. High-Fidelity Synthesized "Tudum" Audio Engine ---
class TudumSynth {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (this.audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
  }

  play() {
    this.init();
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    // A. Main Volume Gain Node
    const mainGain = this.audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.001, now);
    mainGain.gain.linearRampToValueAtTime(0.8, now + 0.05);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5); // Warm slow release

    // B. Low-Pass Filter to keep bass notes warm, dark, and heavy
    const lowpass = this.audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(160, now);
    lowpass.frequency.linearRampToValueAtTime(80, now + 1.2); // Sweeps lower

    // C. Analog Waveshaper Distortion for harmonic grit
    const distortion = this.audioCtx.createWaveShaper();
    distortion.curve = this.makeDistortionCurve(15);

    // --- SOUND 1: The "Tu" (First impact at t = 0) ---
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(62, now); // Deep B1/C2 boundary
    
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    osc1.connect(gain1);
    gain1.connect(lowpass);

    // --- SOUND 2: The "-dum" (Second heavy impact at t = 0.12s) ---
    const osc2 = this.audioCtx.createOscillator();
    const osc2Sub = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(55, now + 0.12); // Heavy A1 note
    
    osc2Sub.type = 'triangle';
    osc2Sub.frequency.setValueAtTime(110, now + 0.12); // Octave overtone for punch
    
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.001, now + 0.11);
    gain2.gain.linearRampToValueAtTime(0.85, now + 0.15); // Instant hard impact
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    
    osc2.connect(gain2);
    osc2Sub.connect(gain2);
    gain2.connect(distortion);
    distortion.connect(lowpass);

    // --- SOUND 3: Airy Atmospheric Tail (Reverb Room effect at t = 0.2s) ---
    // Bypass the lowpass filter for the tail so it stays bright and spacious
    const tailGain = this.audioCtx.createGain();
    tailGain.gain.setValueAtTime(0.001, now);
    tailGain.gain.setValueAtTime(0.001, now + 0.18);
    tailGain.gain.linearRampToValueAtTime(0.18, now + 0.5); // Slower attack
    tailGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

    const f1 = this.audioCtx.createOscillator();
    const f2 = this.audioCtx.createOscillator();
    const f3 = this.audioCtx.createOscillator();

    f1.type = 'sine';
    f1.frequency.setValueAtTime(220, now + 0.18); // A3
    
    f2.type = 'sine';
    f2.frequency.setValueAtTime(330, now + 0.2);  // E4 (Fifth)
    
    f3.type = 'sine';
    f3.frequency.setValueAtTime(440, now + 0.22); // A4 (Octave)

    f1.connect(tailGain);
    f2.connect(tailGain);
    f3.connect(tailGain);
    tailGain.connect(mainGain);

    // D. Connect nodes and start oscillators
    lowpass.connect(mainGain);
    mainGain.connect(this.audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);

    osc2.start(now + 0.12);
    osc2.stop(now + 2.0);
    
    osc2Sub.start(now + 0.12);
    osc2Sub.stop(now + 2.0);

    f1.start(now + 0.18);
    f1.stop(now + 2.5);
    
    f2.start(now + 0.2);
    f2.stop(now + 2.5);
    
    f3.start(now + 0.22);
    f3.stop(now + 2.5);
  }

  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

// --- 2. Netflix Starting Screen & Dashboard Manager ---
export const initNetflixExperience = () => {
  const synth = new TudumSynth();

  // DOM Selections
  const gateScreen = document.getElementById('netflix-gate-screen');
  const gateBtn = document.getElementById('gate-btn');
  const splashScreen = document.getElementById('netflix-splash-screen');
  const profileScreen = document.getElementById('netflix-profile-screen');
  const profileCards = document.querySelectorAll('.profile-card');
  const activeProfileIcon = document.getElementById('active-profile-icon');
  const activeProfileName = document.getElementById('active-profile-name');
  const switchProfilesBtn = document.getElementById('switch-profiles-btn');
  const signoutBtn = document.getElementById('signout-btn');
  
  // Custom dashboard containers to slide in
  const mainHeader = document.getElementById('main-header');
  const heroSection = document.getElementById('hero');

  // Avatars Mapping
  const avatars = {
    'Rohan (Director)': { class: 'avatar-rohan', text: 'R' },
    'Elena (Thriller)': { class: 'avatar-elena', text: 'E' },
    'Vikram (VFX)': { class: 'avatar-vikram', text: 'V' },
    'Guest Fan': { class: 'avatar-guest', text: 'G' }
  };

  // Helper to load dashboard visual entry
  const revealDashboard = () => {
    document.body.classList.remove('no-scroll');
    mainHeader.style.opacity = '1';
    mainHeader.style.transform = 'translateY(0)';
    heroSection.style.opacity = '1';
    heroSection.style.transform = 'translateY(0)';
    
    // Auto trigger particle and visual flows in background
    setTimeout(() => {
      mainHeader.style.transition = 'background-color 0.5s ease';
    }, 100);
  };

  const selectProfile = (name, delay = 1000) => {
    localStorage.setItem('varnam_profile', name);
    
    // Update navbar avatar dynamically
    const profileInfo = avatars[name];
    if (profileInfo && activeProfileIcon) {
      // Clear class and set class + content
      activeProfileIcon.className = `navbar-profile-icon ${profileInfo.class}`;
      activeProfileIcon.textContent = profileInfo.text;
    }
    if (activeProfileName) {
      activeProfileName.textContent = name;
    }

    // Hide profile selection screen after animation completes
    setTimeout(() => {
      profileScreen.classList.remove('active');
      profileScreen.classList.remove('dissolving');
      revealDashboard();
    }, delay);
  };

  // --- Step 1: Entry Gate Trigger ---
  if (gateBtn && gateScreen) {
    // Lock scrolling initially during intro
    document.body.classList.add('no-scroll');
    mainHeader.style.opacity = '0';
    mainHeader.style.transform = 'translateY(-20px)';
    mainHeader.style.transition = 'none';
    heroSection.style.opacity = '0';
    heroSection.style.transform = 'translateY(20px)';

    gateBtn.addEventListener('click', () => {
      // 1. Fade gate out
      gateScreen.classList.add('hide');
      
      // 2. Play Tudum
      synth.play();

      // 3. Show Splash Drawing Animation
      splashScreen.classList.add('active');

      // 4. Zoom SVG and beam dissolves halfway
      setTimeout(() => {
        splashScreen.classList.add('zooming');
      }, 1800);

      // 5. Hide Splash and reveal Profile Selector
      setTimeout(() => {
        splashScreen.classList.add('hide');
        profileScreen.classList.add('active');
      }, 3100);
    });
  }

  // --- Step 2: Profile Selection Actions ---
  profileCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.getAttribute('data-name');
      
      // Scale profile card up, blur background
      card.classList.add('selected-profile');
      profileScreen.classList.add('dissolving');
      
      selectProfile(name, 1000);
    });
  });

  // --- Step 3: Switch Profiles from navbar dropdown ---
  if (switchProfilesBtn) {
    switchProfilesBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Hide dashboard elements smoothly
      document.body.classList.add('no-scroll');
      mainHeader.style.opacity = '0';
      heroSection.style.opacity = '0';
      
      // Show profile selection screen
      profileCards.forEach(c => c.classList.remove('selected-profile'));
      profileScreen.className = 'netflix-profiles active';
    });
  }

  // --- Step 4: Sign out triggers back to Gate ---
  if (signoutBtn) {
    signoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('varnam_profile');
      location.reload();
    });
  }

  // Skip screen checks: If profile already exists, let's load it smoothly, but let's play the intro splash directly!
  // To make it feel premium, we bypass the gate and play the splash screen directly if they click anywhere, or just play a faster intro.
  // Actually, playing the gate is perfect for first time, but let's check local storage. If a profile already exists, we can still load the profile selector or skip directly to show off their dashboard.
  // Let's make it so it always plays the splash starting screen on hard refreshes to keep that Netflix starting vibe!

  // --- 3. Collapsible Navigation Search Bar ---
  const searchBtn = document.getElementById('search-btn');
  const searchBox = document.getElementById('netflix-search-box');
  const searchInput = document.getElementById('search-input');
  
  if (searchBtn && searchBox && searchInput) {
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchBox.classList.toggle('active');
      if (searchBox.classList.contains('active')) {
        searchInput.focus();
      }
    });

    // Close search box if clicking outside and input is empty
    document.addEventListener('click', (e) => {
      if (!searchBox.contains(e.target) && searchInput.value === '') {
        searchBox.classList.remove('active');
      }
    });

    // Real-Time Search Filtering on client videos
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      const portfolioCards = document.querySelectorAll('.portfolio-card');
      const filterButtons = document.querySelectorAll('.filter-btn');

      portfolioCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const desc = card.querySelector('.card-description').textContent.toLowerCase();
        const genre = card.querySelector('.card-genre').textContent.toLowerCase();

        if (title.includes(query) || desc.includes(query) || genre.includes(query)) {
          card.classList.remove('hide');
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        } else {
          card.classList.add('hide');
        }
      });

      // Clear filter category active states when typing
      if (query !== '') {
        filterButtons.forEach(btn => btn.classList.remove('active'));
      } else {
        // Reset category "All" active
        const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allBtn) allBtn.classList.add('active');
        portfolioCards.forEach(c => c.classList.remove('hide'));
      }
    });
  }

  // --- 4. Billboard Interactive Event Handlers ---
  const billboardPlayBtn = document.getElementById('billboard-play-btn');
  const billboardInfoBtn = document.getElementById('billboard-info-btn');
  const billboardListBtn = document.getElementById('billboard-list-btn');
  const billboardAudioBtn = document.getElementById('billboard-audio-btn');

  // Connect Billboard Play to Showreel Modal
  if (billboardPlayBtn) {
    billboardPlayBtn.addEventListener('click', () => {
      const playBtn = document.getElementById('play-showreel-btn');
      if (playBtn) playBtn.click();
    });
  }

  // Connect Billboard Info to Lightbox Modal
  if (billboardInfoBtn) {
    billboardInfoBtn.addEventListener('click', () => {
      // Open modal for the hero billboard project (NEBULA VR BRANDING)
      const targetCard = document.querySelector('.portfolio-card[data-category="features"]');
      if (targetCard) {
        targetCard.click();
      }
    });
  }

  // Add / Remove from My List Watchlist
  if (billboardListBtn) {
    let inWatchlist = localStorage.getItem('varnam_watchlist') === 'true';
    
    const updateListUI = () => {
      const label = billboardListBtn.querySelector('span');
      const icon = billboardListBtn.querySelector('.list-icon');
      
      if (inWatchlist) {
        if (label) label.textContent = 'In My List';
        if (icon) {
          // Replace with a checkmark SVG
          icon.innerHTML = '<path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
        }
      } else {
        if (label) label.textContent = 'My List';
        if (icon) {
          // Keep plus SVG
          icon.innerHTML = '<path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>';
        }
      }
    };
    
    updateListUI();

    billboardListBtn.addEventListener('click', () => {
      inWatchlist = !inWatchlist;
      localStorage.setItem('varnam_watchlist', inWatchlist);
      updateListUI();

      // Show toast alert
      const toast = document.getElementById('toast-notification');
      const tTitle = toast.querySelector('.toast-title');
      const tDesc = toast.querySelector('.toast-desc');

      if (toast) {
        if (inWatchlist) {
          tTitle.textContent = 'ADDED TO WATCHLIST';
          tDesc.textContent = 'Nebula VR Branding added to My List watchlist.';
        } else {
          tTitle.textContent = 'REMOVED FROM WATCHLIST';
          tDesc.textContent = 'Nebula VR Branding removed from My List watchlist.';
        }
        toast.classList.add('active');
        setTimeout(() => toast.classList.remove('active'), 4000);
      }
    });
  }

  // Billboard Mute/Unmute toggle for atmospheric music
  if (billboardAudioBtn) {
    billboardAudioBtn.addEventListener('click', () => {
      const droneBtn = document.getElementById('audio-control');
      if (droneBtn) {
        droneBtn.click();
        
        // Sync button graphic
        const audioIcon = billboardAudioBtn.querySelector('svg');
        const isPlaying = droneBtn.classList.contains('playing');
        
        if (isPlaying) {
          // Muted state, click unmuted it
          audioIcon.innerHTML = '<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        } else {
          // Playing state, click muted it
          audioIcon.innerHTML = '<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        }
      }
    });
  }
};
