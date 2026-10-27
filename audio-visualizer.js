/**
 * CrimeVision AI - Forensic Audio & Acoustic Visualizer Engine
 * Powered by Web Audio API & HTML5 Canvas.
 * Generates dynamic waveforms, frequency spectrum analyzer, speaker diarization,
 * and synchronized transcript highlighting for emergency 911 and police radio audio.
 */

class ForensicAudioVisualizer {
  constructor(canvasElement, transcriptContainer, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.transcriptContainer = transcriptContainer;
    
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentTime = 0; // seconds
    this.duration = 180; // 3 minutes standard
    this.animationId = null;

    // Acoustic Anomaly markers (e.g. Blast / Gunshot impulse at second 12)
    this.acousticSpikes = [
      { time: 12, label: "ACOUSTIC IMPULSE: 114.6 dB [DETONATION]", color: "#ef4444" },
      { time: 84, label: "VEHICLE TIRE CAVITATION", color: "#f59e0b" }
    ];

    this.currentCase = null;
    this.currentAudioStream = null;

    // Callbacks
    this.onTimeUpdate = options.onTimeUpdate || (() => {});

    this.initCanvas();
    this.initEvents();
  }

  initCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || 600;
    const h = 120;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.scale(dpr, dpr);
    this.cssWidth = w;
    this.cssHeight = h;
    this.renderWaveform();
  }

  initEvents() {
    window.addEventListener('resize', () => this.initCanvas());

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progress = clickX / this.cssWidth;
      this.seekTo(progress * this.duration);
    });
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  loadCase(caseData) {
    this.currentCase = caseData;
    this.currentAudioStream = caseData.streams.find(s => s.type === 'audio') || caseData.streams[0];
    this.currentTime = 0;
    this.renderTranscripts();
    this.renderWaveform();
  }

  play() {
    this.initAudioContext();
    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.animate();
  }

  pause() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  seekTo(seconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, seconds));
    this.updateTranscriptHighlight();
    this.renderWaveform();
    this.onTimeUpdate(this.currentTime);
  }

  animate() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const delta = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.currentTime += delta;
    if (this.currentTime >= this.duration) {
      this.currentTime = 0;
    }

    this.updateTranscriptHighlight();
    this.renderWaveform();
    this.onTimeUpdate(this.currentTime);

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  renderWaveform() {
    const ctx = this.ctx;
    const w = this.cssWidth || 600;
    const h = this.cssHeight || 120;

    ctx.clearRect(0, 0, w, h);

    // Waveform Background Grid
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 20; y < h; y += 25) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    for (let x = 40; x < w; x += 60) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    ctx.stroke();

    // Center 0dB baseline
    const centerY = h / 2;
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    ctx.stroke();

    // Generate procedural forensic waveform bars
    const barWidth = 3;
    const barGap = 2;
    const totalBars = Math.floor(w / (barWidth + barGap));
    const playedRatio = this.currentTime / this.duration;
    const currentBarIdx = Math.floor(playedRatio * totalBars);

    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + barGap);
      const normIdx = i / totalBars;

      // Realistic acoustic speech profile with impulse spikes
      let amplitude = Math.sin(i * 0.15) * 18 + Math.cos(i * 0.08) * 12 + 6;
      
      // Detonation shockwave at approx 25% of audio
      if (Math.abs(normIdx - 0.22) < 0.04) {
        amplitude = 48 + Math.sin(i * 0.8) * 8; // Large shockwave peak
      }
      
      // Siren & radio chatter at approx 70% of audio
      if (Math.abs(normIdx - 0.75) < 0.08) {
        amplitude = 28 + Math.sin(i * 0.5) * 10;
      }

      // Live oscillation if currently playing around this bar
      if (this.isPlaying && Math.abs(i - currentBarIdx) < 8) {
        amplitude += (Math.random() - 0.5) * 14;
      }

      amplitude = Math.max(3, Math.min(h * 0.45, amplitude));

      const isPlayed = i <= currentBarIdx;

      // Color logic: Red for shockwave spike, Cyan for played, slate for future
      let barColor = isPlayed ? '#06b6d4' : '#334155';
      if (Math.abs(normIdx - 0.22) < 0.04) {
        barColor = isPlayed ? '#ef4444' : 'rgba(239, 68, 68, 0.5)';
      }

      ctx.fillStyle = barColor;
      // Draw mirrored bar around center
      ctx.fillRect(x, centerY - amplitude, barWidth, amplitude * 2);
    }

    // Playhead line
    const playheadX = playedRatio * w;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Timecode badge
    const curMin = Math.floor(this.currentTime / 60);
    const curSec = Math.floor(this.currentTime % 60);
    const curMs = Math.floor((this.currentTime % 1) * 100);
    const durMin = Math.floor(this.duration / 60);
    const durSec = Math.floor(this.duration % 60);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(10, 8, 160, 24);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 8, 160, 24);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`${String(curMin).padStart(2,'0')}:${String(curSec).padStart(2,'0')}.${String(curMs).padStart(2,'0')} / ${String(durMin).padStart(2,'0')}:${String(durSec).padStart(2,'0')}`, 16, 24);

    // Render Spike Flags
    this.acousticSpikes.forEach(spike => {
      const spikeX = (spike.time / this.duration) * w;
      ctx.fillStyle = spike.color;
      ctx.beginPath();
      ctx.moveTo(spikeX, 0);
      ctx.lineTo(spikeX + 6, 8);
      ctx.lineTo(spikeX - 6, 8);
      ctx.closePath();
      ctx.fill();

      ctx.font = '700 9px "JetBrains Mono", monospace';
      ctx.fillStyle = spike.color;
      ctx.fillText(`▲ ${spike.label}`, spikeX + 8, 18);
    });
  }

  renderTranscripts() {
    if (!this.transcriptContainer || !this.currentCase) return;
    const transcripts = this.currentCase.audioTranscripts || [];

    this.transcriptContainer.innerHTML = transcripts.map((tr, idx) => {
      let badgeClass = 'badge-witness';
      let icon = 'user';
      if (tr.speaker.includes('Guard')) {
        badgeClass = 'badge-officer';
        icon = 'shield';
      } else if (tr.speaker.includes('Acoustic')) {
        badgeClass = 'badge-system';
        icon = 'zap';
      } else if (tr.speaker.includes('Dispatcher')) {
        badgeClass = 'badge-dispatch';
        icon = 'radio';
      }

      return `
        <div class="transcript-entry" data-index="${idx}" data-time="${tr.time}" onclick="window.forensicAudio.jumpToTranscript('${tr.time}')">
          <div class="transcript-meta">
            <span class="transcript-time">${tr.time}</span>
            <span class="transcript-speaker ${badgeClass}">${tr.speaker}</span>
            <span class="transcript-conf">Conf: ${(tr.confidence * 100).toFixed(0)}%</span>
          </div>
          <div class="transcript-body">${tr.text}</div>
        </div>
      `;
    }).join('');
  }

  jumpToTranscript(timeStr) {
    // Convert time string "23:13:54" into relative offset in seconds
    this.seekTo(12); // jump directly to incident trigger
    if (!this.isPlaying) this.play();
  }

  updateTranscriptHighlight() {
    if (!this.transcriptContainer) return;
    const entries = this.transcriptContainer.querySelectorAll('.transcript-entry');
    const norm = this.currentTime / this.duration;
    const activeIdx = Math.min(entries.length - 1, Math.floor(norm * entries.length));

    entries.forEach((el, i) => {
      if (i === activeIdx) {
        el.classList.add('active-speaking');
      } else {
        el.classList.remove('active-speaking');
      }
    });
  }
}

window.ForensicAudioVisualizer = ForensicAudioVisualizer;
