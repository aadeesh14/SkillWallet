/**
 * CrimeVision AI - High-Performance Forensic Evidence Canvas Engine
 * Renders procedural, highly authentic CCTV / Surveillance video feeds with
 * dynamic object detection overlays, thermal FLIR & night-vision shaders,
 * frame-by-frame stepping, digital pan/zoom, and bounding box telemetry.
 */

class EvidenceCanvas {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.currentCase = null;
    this.currentStream = null;
    
    // Playback state
    this.isPlaying = false;
    this.currentFrame = 35; // default interesting frame
    this.totalFrames = 150;
    this.fps = 15;
    this.playbackSpeed = 1.0;
    this.lastTimestamp = 0;
    this.animationId = null;

    // Visual modes: 'cctv', 'night_vision', 'flir_thermal', 'edge_detect'
    this.filterMode = 'cctv';
    
    // Layer toggles
    this.showBoundingBoxes = true;
    this.showWeapons = true;
    this.showMotionVectors = true;
    this.showHUD = true;
    this.showAttentionMap = false;

    // Pan & Zoom
    this.zoomLevel = 1.0;
    this.panOffset = { x: 0, y: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    // Hovered / selected detection
    this.hoveredDetection = null;
    this.selectedDetection = null;

    // Callbacks
    this.onFrameChange = options.onFrameChange || (() => {});
    this.onDetectionClick = options.onDetectionClick || (() => {});

    this.initEvents();
    this.resizeCanvas();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.panOffset.x = e.clientX - this.dragStart.x;
        this.panOffset.y = e.clientY - this.dragStart.y;
        this.clampPan();
        this.render();
      } else {
        this.checkHover(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.15 : -0.15;
      this.setZoom(this.zoomLevel + zoomDelta);
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      const hit = this.getDetectionAtPoint(clientX, clientY);
      if (hit) {
        this.selectedDetection = hit;
        this.onDetectionClick(hit);
        this.render();
      }
    });
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth || 800;
    const h = Math.round(w * (9 / 16));
    
    // Support high DPI
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.ctx.scale(dpr, dpr);
    this.cssWidth = w;
    this.cssHeight = h;
    this.clampPan();
    this.render();
  }

  setZoom(zoom) {
    this.zoomLevel = Math.max(1.0, Math.min(4.0, zoom));
    if (this.zoomLevel === 1.0) {
      this.panOffset = { x: 0, y: 0 };
    }
    this.clampPan();
    this.render();
  }

  clampPan() {
    if (this.zoomLevel <= 1.0) {
      this.panOffset = { x: 0, y: 0 };
      return;
    }
    const maxPanX = (this.cssWidth * (this.zoomLevel - 1)) / 2;
    const maxPanY = (this.cssHeight * (this.zoomLevel - 1)) / 2;
    this.panOffset.x = Math.max(-maxPanX, Math.min(maxPanX, this.panOffset.x));
    this.panOffset.y = Math.max(-maxPanY, Math.min(maxPanY, this.panOffset.y));
  }

  loadCase(caseData, streamId = null) {
    this.currentCase = caseData;
    this.currentStream = streamId 
      ? caseData.streams.find(s => s.id === streamId) 
      : caseData.streams.find(s => s.type === 'video') || caseData.streams[0];
    this.currentFrame = 35;
    this.render();
  }

  setStream(streamId) {
    if (!this.currentCase) return;
    const stream = this.currentCase.streams.find(s => s.id === streamId);
    if (stream) {
      this.currentStream = stream;
      this.render();
    }
  }

  play() {
    if (this.isPlaying) return;
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

  stepForward() {
    this.pause();
    this.currentFrame = Math.min(this.totalFrames, this.currentFrame + 1);
    this.onFrameChange(this.currentFrame);
    this.render();
  }

  stepBackward() {
    this.pause();
    this.currentFrame = Math.max(0, this.currentFrame - 1);
    this.onFrameChange(this.currentFrame);
    this.render();
  }

  seekToFrame(frame) {
    this.currentFrame = Math.max(0, Math.min(this.totalFrames, Math.round(frame)));
    this.onFrameChange(this.currentFrame);
    this.render();
  }

  animate() {
    if (!this.isPlaying) return;
    const now = performance.now();
    const elapsed = now - this.lastTimestamp;
    const interval = 1000 / (this.fps * this.playbackSpeed);

    if (elapsed >= interval) {
      this.lastTimestamp = now;
      this.currentFrame++;
      if (this.currentFrame > this.totalFrames) {
        this.currentFrame = 0;
      }
      this.onFrameChange(this.currentFrame);
      this.render();
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  setFilterMode(mode) {
    this.filterMode = mode;
    this.render();
  }

  // Check hover on bounding box
  checkHover(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const hit = this.getDetectionAtPoint(clientX, clientY);

    if (hit !== this.hoveredDetection) {
      this.hoveredDetection = hit;
      this.canvas.style.cursor = hit ? 'pointer' : (this.zoomLevel > 1 ? 'grab' : 'crosshair');
      this.render();
    }
  }

  getDetectionAtPoint(x, y) {
    if (!this.showBoundingBoxes || !this.currentCase) return null;
    const boxes = this.getActiveDetections();
    
    // Transform point taking zoom and pan into account
    const centerX = this.cssWidth / 2;
    const centerY = this.cssHeight / 2;
    const normX = (x - centerX - this.panOffset.x) / this.zoomLevel + centerX;
    const normY = (y - centerY - this.panOffset.y) / this.zoomLevel + centerY;

    for (let det of boxes) {
      if (!det.boundingBox) continue;
      const bx = (det.boundingBox.x / 100) * this.cssWidth;
      const by = (det.boundingBox.y / 100) * this.cssHeight;
      const bw = (det.boundingBox.w / 100) * this.cssWidth;
      const bh = (det.boundingBox.h / 100) * this.cssHeight;

      if (normX >= bx && normX <= bx + bw && normY >= by && normY <= by + bh) {
        return det;
      }
    }
    return null;
  }

  getActiveDetections() {
    if (!this.currentCase || !this.currentStream) return [];
    return this.currentCase.detections.filter(d => {
      if (d.stream !== this.currentStream.id) return false;
      if (!this.showWeapons && d.category.includes('Weapon')) return false;
      return true;
    });
  }

  // Primary rendering pipeline
  render() {
    const ctx = this.ctx;
    const w = this.cssWidth || 800;
    const h = this.cssHeight || 450;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply Zoom & Pan
    const centerX = w / 2;
    const centerY = h / 2;
    ctx.translate(centerX + this.panOffset.x, centerY + this.panOffset.y);
    ctx.scale(this.zoomLevel, this.zoomLevel);
    ctx.translate(-centerX, -centerY);

    // Render Scene Base
    this.renderScene(ctx, w, h);

    // Render Procedural Actors based on currentFrame
    this.renderActors(ctx, w, h);

    // Render Attention Map if enabled
    if (this.showAttentionMap) {
      this.renderAttentionMap(ctx, w, h);
    }

    // Render Bounding Boxes & Tracking
    if (this.showBoundingBoxes) {
      this.renderDetections(ctx, w, h);
    }

    ctx.restore();

    // Render Screen-space HUD & Overlays
    if (this.showHUD) {
      this.renderHUD(ctx, w, h);
    }

    // Apply Post-Process Filter effect in screen space
    this.applyScreenFilter(ctx, w, h);
  }

  renderScene(ctx, w, h) {
    const scene = this.currentStream ? this.currentStream.sceneType : 'vault';

    if (scene === 'vault') {
      this.drawVaultCorridor(ctx, w, h);
    } else if (scene === 'alley') {
      this.drawAlleyScene(ctx, w, h);
    } else if (scene === 'harbor' || scene === 'harbor_crane') {
      this.drawHarborScene(ctx, w, h);
    } else if (scene === 'server_room') {
      this.drawServerRoomScene(ctx, w, h);
    } else {
      this.drawDefaultFeed(ctx, w, h);
    }
  }

  drawVaultCorridor(ctx, w, h) {
    // Dark subterranean hallway
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.5, '#121824');
    bgGrad.addColorStop(1, '#070a0f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Perspective walls
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w * 0.28, h * 0.25);
    ctx.lineTo(w * 0.28, h * 0.85);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Left wall steel panels
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.07 * i, h * 0.06 * i);
      ctx.lineTo(w * 0.07 * i, h - h * 0.04 * i);
      ctx.stroke();
    }

    // Right wall
    ctx.fillStyle = '#162032';
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(w * 0.72, h * 0.25);
    ctx.lineTo(w * 0.72, h * 0.85);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Ceiling conduits & lights
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w * 0.72, h * 0.25);
    ctx.lineTo(w * 0.28, h * 0.25);
    ctx.closePath();
    ctx.fill();

    // Fluorescent flicker light bar
    const flicker = 0.8 + Math.sin(this.currentFrame * 0.4) * 0.15;
    ctx.fillStyle = `rgba(224, 242, 254, ${flicker * 0.35})`;
    ctx.fillRect(w * 0.42, h * 0.12, w * 0.16, h * 0.02);

    // Floor reflection
    const floorGrad = ctx.createLinearGradient(0, h * 0.85, 0, h);
    floorGrad.addColorStop(0, '#0f172a');
    floorGrad.addColorStop(1, '#020617');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.85);
    ctx.lineTo(w * 0.72, h * 0.85);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Heavy vault door in center
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.35, h * 0.28, w * 0.3, h * 0.57);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.35, h * 0.28, w * 0.3, h * 0.57);

    // Vault circular dial & locking spokes
    const dialX = w * 0.5;
    const dialY = h * 0.55;
    ctx.beginPath();
    ctx.arc(dialX, dialY, h * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Breached lock effect if frame > 55
    if (this.currentFrame >= 55) {
      // Scorched blast marks around lock
      const blastGrad = ctx.createRadialGradient(dialX + 25, dialY, 5, dialX + 25, dialY, 45);
      blastGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      blastGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.4)');
      blastGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = blastGrad;
      ctx.beginPath();
      ctx.arc(dialX + 25, dialY, 45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Keypad terminal on right frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w * 0.67, h * 0.48, w * 0.035, h * 0.12);
    ctx.fillStyle = this.currentFrame > 20 ? '#ef4444' : '#10b981';
    ctx.fillRect(w * 0.675, h * 0.49, w * 0.025, h * 0.03);
  }

  drawAlleyScene(ctx, w, h) {
    // Wet alleyway at night
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, w, h);

    // Distant streetlamp glow
    const lamp = ctx.createRadialGradient(w * 0.82, h * 0.25, 10, w * 0.82, h * 0.25, 200);
    lamp.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    lamp.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, 0, w, h);

    // Brick building facades
    ctx.fillStyle = '#1a1f2c';
    ctx.fillRect(0, 0, w * 0.35, h * 0.8);
    ctx.fillRect(w * 0.7, 0, w * 0.3, h * 0.75);

    // Wet asphalt floor
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Wet reflective puddle
    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.86, w * 0.28, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark sedan waiting (Subj #2)
    const carX = w * 0.55;
    const carY = h * 0.58;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(carX, carY, w * 0.32, h * 0.22, [15, 25, 5, 5]);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Glowing red taillights
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 15;
    ctx.fillRect(carX + 5, carY + h * 0.1, 14, 8);
    ctx.fillRect(carX + w * 0.28, carY + h * 0.1, 14, 8);
    ctx.shadowBlur = 0;
  }

  drawHarborScene(ctx, w, h) {
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, w, h);

    // Harbor water reflections
    ctx.fillStyle = '#081226';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Container stacks
    const colors = ['#1e3a8a', '#991b1b', '#065f46', '#374151'];
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = colors[c % colors.length];
      ctx.fillRect(w * 0.1 + c * w * 0.18, h * 0.32, w * 0.16, h * 0.33);
      ctx.strokeStyle = '#0f172a';
      ctx.strokeRect(w * 0.1 + c * w * 0.18, h * 0.32, w * 0.16, h * 0.33);
    }
  }

  drawServerRoomScene(ctx, w, h) {
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, w, h);

    // Server rack perspective
    for (let i = 0; i < 5; i++) {
      const rx = w * 0.15 + i * w * 0.15;
      ctx.fillStyle = '#111827';
      ctx.fillRect(rx, h * 0.18, w * 0.12, h * 0.7);
      ctx.strokeStyle = '#1f2937';
      ctx.strokeRect(rx, h * 0.18, w * 0.12, h * 0.7);

      // Blinking LEDs
      for (let row = 0; row < 10; row++) {
        const ledOn = (this.currentFrame + i * 3 + row) % 3 === 0;
        ctx.fillStyle = ledOn ? (row % 2 === 0 ? '#10b981' : '#06b6d4') : '#1e293b';
        ctx.fillRect(rx + 8, h * 0.2 + row * 22, 6, 6);
        ctx.fillRect(rx + 20, h * 0.2 + row * 22, 6, 6);
      }
    }
  }

  drawDefaultFeed(ctx, w, h) {
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(0, 0, w, h);
  }

  // Render moving actors (Suspect, Weapons, Flashlights)
  renderActors(ctx, w, h) {
    if (!this.currentStream || this.currentStream.type !== 'video') return;

    const frameNorm = this.currentFrame / this.totalFrames; // 0.0 to 1.0

    if (this.currentStream.sceneType === 'vault') {
      // Suspect movements in vault
      // Frame 0-30: Ingress from left
      // Frame 31-70: Draws weapon and points at lock
      // Frame 71-110: Grabs duffle bag
      // Frame 111-150: Retreats back toward left
      let actorX = w * 0.2 + frameNorm * (w * 0.26);
      let actorY = h * 0.38;
      if (this.currentFrame > 90) {
        actorX = w * 0.46 - ((this.currentFrame - 90) / 60) * (w * 0.25);
      }

      this.drawSuspectFigure(ctx, actorX, actorY, w * 0.14, h * 0.48);

      // Weapon brandished between frames 30 and 85
      if (this.currentFrame >= 30 && this.currentFrame <= 85) {
        this.drawWeaponInHand(ctx, actorX + w * 0.09, actorY + h * 0.22);
      }

      // Tactical flashlight beam from suspect
      ctx.save();
      const beamGrad = ctx.createRadialGradient(actorX + w * 0.08, actorY + h * 0.2, 5, actorX + w * 0.28, actorY + h * 0.35, 180);
      beamGrad.addColorStop(0, 'rgba(255, 255, 240, 0.4)');
      beamGrad.addColorStop(0.4, 'rgba(255, 255, 240, 0.12)');
      beamGrad.addColorStop(1, 'rgba(255, 255, 240, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(actorX + w * 0.08, actorY + h * 0.2);
      ctx.lineTo(w * 0.58, h * 0.25);
      ctx.lineTo(w * 0.62, h * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Duffle bag on ground / picked up
      if (this.currentFrame > 60) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(actorX + w * 0.02, actorY + h * 0.35, w * 0.09, h * 0.12);
        ctx.strokeStyle = '#f59e0b';
        ctx.strokeRect(actorX + w * 0.02, actorY + h * 0.35, w * 0.09, h * 0.12);
      }
    } else if (this.currentStream.sceneType === 'alley') {
      // Suspect sprinting toward vehicle
      const sprintProg = Math.min(1.0, this.currentFrame / 100);
      const alleyX = w * 0.2 + sprintProg * (w * 0.38);
      const alleyY = h * 0.52;

      if (this.currentFrame < 110) {
        this.drawSuspectFigure(ctx, alleyX, alleyY, w * 0.1, h * 0.35);
      }
    }
  }

  drawSuspectFigure(ctx, x, y, width, height) {
    ctx.save();
    // Tactical silhouette
    ctx.fillStyle = '#0d131f';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;

    // Head with tactical hood
    const headRadius = width * 0.24;
    ctx.beginPath();
    ctx.arc(x + width * 0.5, y + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Torso / tactical storm vest
    ctx.beginPath();
    ctx.moveTo(x + width * 0.2, y + headRadius * 1.8);
    ctx.lineTo(x + width * 0.8, y + headRadius * 1.8);
    ctx.lineTo(x + width * 0.75, y + height * 0.65);
    ctx.lineTo(x + width * 0.25, y + height * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x + width * 0.28, y + height * 0.65);
    ctx.lineTo(x + width * 0.24, y + height);
    ctx.lineTo(x + width * 0.44, y + height);
    ctx.lineTo(x + width * 0.48, y + height * 0.65);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + width * 0.52, y + height * 0.65);
    ctx.lineTo(x + width * 0.56, y + height);
    ctx.lineTo(x + width * 0.76, y + height);
    ctx.lineTo(x + width * 0.72, y + height * 0.65);
    ctx.fill();

    ctx.restore();
  }

  drawWeaponInHand(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#030712';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    
    // Handgun silhouette
    ctx.beginPath();
    ctx.rect(x, y, 22, 7); // Slide
    ctx.rect(x + 4, y + 7, 7, 14); // Grip
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  renderAttentionMap(ctx, w, h) {
    // Saliency / AI visual attention heatmap overlay
    const heatGrad = ctx.createRadialGradient(w * 0.48, h * 0.52, 20, w * 0.48, h * 0.52, 140);
    heatGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    heatGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)');
    heatGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
    heatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(0, 0, w, h);
  }

  renderDetections(ctx, w, h) {
    const detections = this.getActiveDetections();

    detections.forEach((det) => {
      if (!det.boundingBox) return;
      const bx = (det.boundingBox.x / 100) * w;
      const by = (det.boundingBox.y / 100) * h;
      const bw = (det.boundingBox.w / 100) * w;
      const bh = (det.boundingBox.h / 100) * h;

      const isHovered = this.hoveredDetection && this.hoveredDetection.id === det.id;
      const isSelected = this.selectedDetection && this.selectedDetection.id === det.id;

      // Color coding by category
      let color = '#06b6d4'; // default cyan
      if (det.category.includes('Weapon')) color = '#ef4444'; // red
      else if (det.category.includes('Person')) color = '#f59e0b'; // amber
      else if (det.category.includes('Vehicle')) color = '#a855f7'; // purple
      else if (det.category.includes('Thermal') || det.category.includes('Contraband')) color = '#10b981'; // green

      ctx.save();

      // Bounding box style
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? 3 : (isHovered ? 2.5 : 1.5);
      if (isSelected || isHovered) {
        ctx.fillStyle = color.replace(')', ', 0.12)').replace('rgb', 'rgba').replace('#', 'rgba(');
      }

      // Draw tactical corner brackets
      const bracketLen = Math.min(16, bw * 0.25, bh * 0.25);
      
      // Top-left
      ctx.beginPath();
      ctx.moveTo(bx, by + bracketLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + bracketLen, by);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(bx + bw - bracketLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + bracketLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - bracketLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + bracketLen, by + bh);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(bx + bw - bracketLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - bracketLen);
      ctx.stroke();

      // Dashed boundary
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);

      // Fill glow on hover
      if (isHovered || isSelected) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.fillRect(bx, by, bw, bh);
      }

      // Label Chip
      const tagText = `${det.label} • ${det.confidence}%`;
      ctx.font = '600 11px "JetBrains Mono", monospace';
      const textW = ctx.measureText(tagText).width + 14;
      const tagH = 20;

      ctx.fillStyle = color;
      ctx.fillRect(bx, Math.max(0, by - tagH), textW, tagH);

      ctx.fillStyle = '#020617';
      ctx.fillText(tagText, bx + 7, Math.max(14, by - 6));

      // Optical motion vector arrow
      if (this.showMotionVectors && det.attributes && det.attributes.movementRate) {
        this.drawMotionArrow(ctx, bx + bw / 2, by + bh / 2, color);
      }

      ctx.restore();
    });
  }

  drawMotionArrow(ctx, x, y, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 28, y - 8);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 28, y - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  renderHUD(ctx, w, h) {
    ctx.save();

    // Top-left camera metadata
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#06b6d4';
    const streamName = this.currentStream ? this.currentStream.name : 'LIVE STREAM';
    const streamId = this.currentStream ? this.currentStream.id : 'CAM-01';
    ctx.fillText(`● REC [${streamId}] ${streamName.toUpperCase()}`, 16, 26);

    // Frame count & FPS
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`FRAME: ${String(this.currentFrame).padStart(5, '0')} / ${this.totalFrames} | FPS: ${this.fps * this.playbackSpeed}x`, 16, 44);

    // Dynamic timestamp based on current case & frame
    const baseDate = this.currentCase ? this.currentCase.date : '2026-10-24';
    const secondsOffset = Math.floor(this.currentFrame / 2);
    const timeFormatted = `23:13:${String(42 + secondsOffset).padStart(2, '0')}.${String((this.currentFrame % 25) * 40).padStart(3, '0')} UTC`;
    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText(`${baseDate} ${timeFormatted}`, w - 240, 26);

    // Forensic classification watermark
    ctx.font = '700 10px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.fillText(`EVIDENCE HASH VERIFIED [SHA-256]`, w - 240, 44);

    // Center Crosshair
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.lineWidth = 1;
    const cx = w / 2;
    const cy = h / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy);
    ctx.lineTo(cx + 15, cy);
    ctx.moveTo(cx, cy - 15);
    ctx.lineTo(cx, cy + 15);
    ctx.stroke();

    // Zoom badge if zoomed
    if (this.zoomLevel > 1.0) {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.fillRect(w / 2 - 40, h - 36, 80, 22);
      ctx.fillStyle = '#020617';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillText(`ZOOM ${this.zoomLevel.toFixed(1)}X`, w / 2 - 28, h - 21);
    }

    ctx.restore();
  }

  applyScreenFilter(ctx, w, h) {
    if (this.filterMode === 'cctv') {
      // Subtle CRT scanline effect
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }
      ctx.restore();
    } else if (this.filterMode === 'night_vision') {
      // High-phosphor night vision green cast + vignette
      ctx.save();
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.fillRect(0, 0, w, h);

      // Noise grain
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let i = 0; i < 300; i++) {
        const nx = Math.random() * w;
        const ny = Math.random() * h;
        ctx.fillRect(nx, ny, 2, 2);
      }
      ctx.restore();
    } else if (this.filterMode === 'flir_thermal') {
      // Thermal FLIR color overlay
      ctx.save();
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
  }
}

window.EvidenceCanvas = EvidenceCanvas;
