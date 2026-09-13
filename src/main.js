import './style.css';

document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initGate();
  initGallery();
  initCinematicScroll();
  initCountdown();
  initCandle();
  initParticles();
});

// --- Splash Screen Video ---
function initSplash() {
  const splash = document.getElementById('splash-screen');
  const video = document.getElementById('splash-video');
  const startBtn = document.getElementById('start-btn');
  const startOverlay = document.getElementById('start-video-overlay');
  const transitionSound = document.getElementById('transition-sound');
  
  if (!splash || !video) return;

  const loadingText = document.getElementById('loading-text');
  
  // Wait for the video to buffer enough to play smoothly
  const onVideoReady = () => {
    if (loadingText) loadingText.classList.add('hidden');
    if (startBtn) startBtn.classList.remove('hidden');
  };

  if (video.readyState >= 3) {
    onVideoReady();
  } else {
    video.addEventListener('canplaythrough', onVideoReady);
  }

  // Let user start the video so it can play with sound
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      startOverlay.classList.add('hidden');
      video.play().catch(e => console.log("Video play failed:", e));
    });
  }

  const fadeOutSplash = () => {
    // Play transition swoosh
    if (transitionSound) {
      transitionSound.volume = 0.7;
      transitionSound.play().catch(e => console.log("Transition sound failed:", e));
    }
    
    // Start background music immediately so it plays while the seal is on screen
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    if (bgMusic) {
      bgMusic.volume = 0.5;
      bgMusic.play().then(() => {
        // Toggle will be shown immediately so user can manage sound
        window.isBgMusicPlaying = true;
        if (musicToggle) {
          musicToggle.classList.remove('hidden');
        }
      }).catch(e => console.log("Bg music play failed:", e));
    }

    splash.classList.add('hidden');
    setTimeout(() => {
      splash.remove(); 
    }, 1500); // Wait for CSS transition
  };

  let hasFadedOut = false;
  video.addEventListener('timeupdate', () => {
    // Trigger fadeout 1 second before the end to create a seamless cinematic crossfade
    if (video.duration && video.duration - video.currentTime <= 1 && !hasFadedOut) {
      hasFadedOut = true;
      fadeOutSplash();
    }
  });
  
  // Fallback just in case timeupdate misses the window on very fast jumps
  video.addEventListener('ended', () => {
    if (!hasFadedOut) {
      hasFadedOut = true;
      fadeOutSplash();
    }
  });
}

// --- Falling Particles (Magic Dust/Sparkles) ---
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = Math.random() * 0.5 + 0.2;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.2;
      // Gold/Warm hues
      const hues = [45, 50, 55, 40]; 
      this.hue = hues[Math.floor(Math.random() * hues.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      
      // Gentle sway
      this.x += Math.sin(this.y * 0.01) * 0.5;

      if (this.y > height) {
        this.y = -10;
        this.x = Math.random() * width;
      }
      if (this.x > width || this.x < 0) {
        this.x = Math.random() * width;
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 40; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }
  
  animate();
}

// --- Intro Gate & Music ---
function initGate() {
  const openBtn = document.getElementById('open-btn');
  const gate = document.getElementById('intro-gate');
  const mainContent = document.getElementById('main-content');
  const body = document.body;
  const music = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  
  openBtn.addEventListener('click', () => {
    gate.classList.add('open');
    setTimeout(() => {
      gate.classList.add('fade-out');
      body.classList.remove('locked');
      mainContent.classList.add('visible');
    }, 1200); // Wait for open animation slightly

    // Ensure music is playing
    music.volume = 0.5;
    music.play().catch(e => console.log("Autoplay blocked", e));
  });

  // Toggle Music
  musicToggle.addEventListener('click', () => {
    if (!music.paused) {
      music.pause();
      musicToggle.innerHTML = '<i data-lucide="volume-x" stroke-width="1.5"></i>';
    } else {
      music.play();
      musicToggle.innerHTML = '<i data-lucide="volume-2" stroke-width="1.5"></i>';
    }
    lucide.createIcons();
  });
}

// --- Cinematic Scroll Animations ---
function initCinematicScroll() {
  const elements = document.querySelectorAll('.cinematic-fade');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

  elements.forEach(el => observer.observe(el));
}

// --- Live Countdown ---
function initCountdown() {
  const targetDate = new Date("2026-09-13T00:00:00").getTime();

  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  const updateCountdown = () => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minsEl.innerText = "00";
      secsEl.innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minsEl.innerText = String(minutes).padStart(2, '0');
    secsEl.innerText = String(seconds).padStart(2, '0');
  };

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// --- Candle & Microphone Logic ---
async function initCandle() {
  const candleTrigger = document.getElementById('candle-trigger');
  const flame = document.getElementById('flame');
  const glow = document.getElementById('candle-glow');
  const wishText = document.getElementById('wish-text');
  const instruction = document.getElementById('candle-instruction');
  
  let isBlownOut = false;
  let audioContext;

  const blowOutCandle = () => {
    if (isBlownOut) return;
    isBlownOut = true;
    flame.classList.add('blown-out');
    
    // Hide new glows
    const glow1 = document.getElementById('candle-glow-1');
    const glow2 = document.getElementById('candle-glow-2');
    if (glow1) glow1.style.display = 'none';
    if (glow2) glow2.style.display = 'none';

    wishText.classList.remove('hidden');
    instruction.innerText = "Your wish has been cast into the stars.";
    
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close();
    }
    
    // Trigger Celebration Video
    const celebrationOverlay = document.getElementById('celebration-overlay');
    const celebrationVideo = document.getElementById('celebration-video');
    
    setTimeout(() => {
      if (celebrationOverlay && celebrationVideo) {
        celebrationOverlay.classList.remove('hidden');
        celebrationVideo.play().catch(e => console.log("Celebration video failed:", e));
        
        celebrationVideo.onended = () => {
          celebrationOverlay.classList.add('hidden');
        };
      }
    }, 1500);
  };


  // Mic access
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    microphone.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let audioLoopId;
    const checkAudioLevel = () => {
      if (isBlownOut) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // When blowing air into a microphone, it creates a massive low-frequency rumble
      // that easily peaks near the maximum value (255).
      let maxVolume = 0;
      for (let i = 0; i < 20; i++) { // Check lower frequencies
        if (dataArray[i] > maxVolume) {
          maxVolume = dataArray[i];
        }
      }

      if (maxVolume > 230) { // High threshold specifically for peak wind noise
        blowOutCandle();
      } else {
        audioLoopId = requestAnimationFrame(checkAudioLevel);
      }
    };
    
    // Only listen when the user scrolls down to the candle
    const wishSection = document.querySelector('.wish-section');
    if (wishSection) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          checkAudioLevel();
        } else {
          cancelAnimationFrame(audioLoopId);
        }
      }, { threshold: 0.1 });
      observer.observe(wishSection);
    } else {
      checkAudioLevel(); // fallback
    }
    
  } catch (err) {
    console.log("Microphone access not available. Using click fallback.");
  }
}

import img1 from './assets/1.jpeg';
import img2 from './assets/2.jpeg';
import img3 from './assets/3.jpeg';
import img4 from './assets/4.jpeg';
import img5 from './assets/5.jpeg';
import img6 from './assets/6.jpeg';
import img7 from './assets/7.jpeg';

// --- Gallery Logic ---
function initGallery() {
  const galleryGrid = document.getElementById('gallery-grid');
  if (!galleryGrid) return;
  
  const images = [img1, img2, img3, img4, img5, img6, img7];

  images.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = `gallery-item cinematic-fade delay-${(i % 5) + 1}`;
    
    const img = document.createElement('img');
    img.src = src;
    img.loading = 'lazy';
    
    const overlay = document.createElement('div');
    overlay.className = 'gallery-overlay';
    overlay.innerHTML = '<i data-lucide="heart" stroke-width="1.5"></i>';
    
    item.appendChild(img);
    item.appendChild(overlay);
    galleryGrid.appendChild(item);
  });
  
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
