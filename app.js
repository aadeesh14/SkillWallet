/**
 * CrimeVision AI – Main Platform Orchestrator
 * Integrates Evidence Canvas, Acoustic Visualizer, Timeline Fusion, AI Copilot,
 * Ingestion Pipeline, and Forensic Report Generator.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let currentCase = window.CRIME_CASES[0];
  let isTourRunning = false;
  let tourInterval = null;

  // Module Instances
  const canvasEl = document.getElementById('evidence-canvas');
  const waveformEl = document.getElementById('waveform-canvas');
  const transcriptEl = document.getElementById('transcripts-container');
  const chatMessagesEl = document.getElementById('chat-messages-container');

  // 1. Initialize Evidence Canvas
  const evidenceCanvas = new EvidenceCanvas(canvasEl, {
    onFrameChange: (frame) => {
      const scrubber = document.getElementById('frame-scrubber');
      const badge = document.getElementById('frame-counter-badge');
      if (scrubber) scrubber.value = frame;
      if (badge) badge.textContent = `FRM: ${String(frame).padStart(5, '0')} / 00150`;
    },
    onDetectionClick: (det) => {
      openDetectionModal(det);
    }
  });

  // 2. Initialize Forensic Audio Visualizer
  const audioVisualizer = new ForensicAudioVisualizer(waveformEl, transcriptEl, {
    onTimeUpdate: (currentTime) => {
      // Sync timeline if needed
    }
  });

  // 3. Initialize Forensic AI Copilot Engine
  const aiEngine = new ForensicAIEngine(chatMessagesEl, {
    onCitationClick: (streamId, timecode) => {
      evidenceCanvas.setStream(streamId);
      showToast(`Switched view to ${streamId} at ${timecode}`);
    }
  });

  // 4. Initialize Forensic Report Generator
  const reportGenerator = new ForensicReportGenerator();

  // Expose to window for inline onclick handlers
  window.evidenceCanvas = evidenceCanvas;
  window.forensicAudio = audioVisualizer;
  window.forensicAI = aiEngine;
  window.forensicReport = reportGenerator;

  // Initialize UI & Populate Data
  initCaseSelector();
  loadCase(currentCase);
  initControls();
  initTimeline();
  initIngestionModal();
  initChatForm();

  // =========================================================================
  // Case Selector Initialization
  // =========================================================================
  function initCaseSelector() {
    const selectEl = document.getElementById('case-select');
    if (!selectEl) return;

    selectEl.innerHTML = window.CRIME_CASES.map(c => `
      <option value="${c.id}">${c.id}: ${c.title}</option>
    `).join('');

    selectEl.addEventListener('change', (e) => {
      const selected = window.CRIME_CASES.find(c => c.id === e.target.value);
      if (selected) {
        currentCase = selected;
        loadCase(currentCase);
        showToast(`Loaded Case: ${currentCase.id}`);
      }
    });
  }

  function loadCase(caseData) {
    // 1. Update Header Hash & Titles
    const hashEl = document.getElementById('header-hash-code');
    if (hashEl) hashEl.textContent = `${caseData.chainOfCustodyHash.substring(0, 24)}...`;

    // 2. Render Stream Tabs
    renderStreamTabs(caseData);

    // 3. Load into Canvas Engine
    evidenceCanvas.loadCase(caseData);

    // 4. Load into Audio Visualizer
    audioVisualizer.loadCase(caseData);

    // 5. Load into AI Copilot
    aiEngine.loadCase(caseData);

    // 6. Render Timeline Cards
    renderTimelineCards(caseData.timeline);
  }

  function renderStreamTabs(caseData) {
    const tabContainer = document.getElementById('stream-tab-bar');
    if (!tabContainer) return;

    tabContainer.innerHTML = caseData.streams.map((stream, idx) => `
      <button class="stream-tab-btn ${idx === 0 ? 'active' : ''}" data-stream-id="${stream.id}">
        ${stream.type === 'video' ? '📹' : '🎙️'} ${stream.id}
      </button>
    `).join('');

    tabContainer.querySelectorAll('.stream-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabContainer.querySelectorAll('.stream-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const streamId = btn.getAttribute('data-stream-id');
        evidenceCanvas.setStream(streamId);
      });
    });
  }

  // =========================================================================
  // Control Bar & Viewport Interactivity
  // =========================================================================
  function initControls() {
    const btnPlay = document.getElementById('btn-play-pause');
    const playIcon = document.getElementById('play-icon');
    const scrubber = document.getElementById('frame-scrubber');
    const btnStepBack = document.getElementById('btn-step-back');
    const btnStepForward = document.getElementById('btn-step-forward');

    btnPlay.addEventListener('click', () => {
      evidenceCanvas.togglePlay();
      if (evidenceCanvas.isPlaying) {
        btnPlay.classList.add('playing');
        btnPlay.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
      } else {
        btnPlay.classList.remove('playing');
        btnPlay.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
      }
    });

    scrubber.addEventListener('input', (e) => {
      evidenceCanvas.seekToFrame(parseInt(e.target.value));
    });

    btnStepBack.addEventListener('click', () => evidenceCanvas.stepBackward());
    btnStepForward.addEventListener('click', () => evidenceCanvas.stepForward());

    // Shaders
    document.querySelectorAll('.btn-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        evidenceCanvas.setFilterMode(mode);
        showToast(`Optical Filter Set: ${mode.toUpperCase().replace('_', ' ')}`);
      });
    });

    // Zoom Controls
    const zoomReadout = document.getElementById('zoom-readout');
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      evidenceCanvas.setZoom(evidenceCanvas.zoomLevel + 0.5);
      zoomReadout.textContent = `${evidenceCanvas.zoomLevel.toFixed(1)}x`;
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      evidenceCanvas.setZoom(evidenceCanvas.zoomLevel - 0.5);
      zoomReadout.textContent = `${evidenceCanvas.zoomLevel.toFixed(1)}x`;
    });
    document.getElementById('btn-reset-view').addEventListener('click', () => {
      evidenceCanvas.setZoom(1.0);
      zoomReadout.textContent = '1.0x';
    });

    // Layer Toggles
    document.getElementById('toggle-boxes').addEventListener('change', (e) => {
      evidenceCanvas.showBoundingBoxes = e.target.checked;
      evidenceCanvas.render();
    });
    document.getElementById('toggle-weapons').addEventListener('change', (e) => {
      evidenceCanvas.showWeapons = e.target.checked;
      evidenceCanvas.render();
    });
    document.getElementById('toggle-vectors').addEventListener('change', (e) => {
      evidenceCanvas.showMotionVectors = e.target.checked;
      evidenceCanvas.render();
    });
    document.getElementById('toggle-heatmap').addEventListener('change', (e) => {
      evidenceCanvas.showAttentionMap = e.target.checked;
      evidenceCanvas.render();
    });

    // Audio Play Button
    const btnAudio = document.getElementById('btn-audio-play');
    btnAudio.addEventListener('click', () => {
      audioVisualizer.togglePlay();
      if (audioVisualizer.isPlaying) {
        btnAudio.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg><span>Pause Audio</span>`;
      } else {
        btnAudio.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Play Audio</span>`;
      }
    });

    // Export PDF Report Button
    document.getElementById('btn-export-report').addEventListener('click', () => {
      reportGenerator.showPreview(currentCase);
    });

    // Scene Reconstruction Tour
    document.getElementById('btn-reconstruct-tour').addEventListener('click', () => {
      runSceneReconstructionTour();
    });
  }

  // =========================================================================
  // Chronological Forensic Timeline
  // =========================================================================
  function initTimeline() {
    const filterButtons = document.querySelectorAll('.filter-pill');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        filterTimeline(filter);
      });
    });
  }

  function renderTimelineCards(events) {
    const container = document.getElementById('timeline-events-list');
    const countBadge = document.getElementById('timeline-count-badge');
    if (!container) return;

    if (countBadge) countBadge.textContent = `${events.length} Events`;

    container.innerHTML = events.map((event, idx) => `
      <div class="timeline-card ${event.severity}" data-event-id="${event.id}" data-frame="${event.frameIndex || 30}" data-stream="${event.linkedEvidence}">
        <div class="timeline-node-dot"></div>
        <div class="timeline-card-header">
          <span class="timeline-time">${event.time}</span>
          <span class="severity-chip ${event.severity}">${event.severity}</span>
        </div>
        <div class="timeline-title">${event.title}</div>
        <div class="timeline-summary">${event.summary}</div>
        <div class="timeline-card-footer">
          <span class="timeline-source">SRC: ${event.source}</span>
          <span class="timeline-confidence">CONF: ${event.confidence}%</span>
        </div>
      </div>
    `).join('');

    // Click card to jump to evidence timecode and frame
    container.querySelectorAll('.timeline-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.timeline-card').forEach(c => c.classList.remove('active-step'));
        card.classList.add('active-step');
        
        const frame = parseInt(card.getAttribute('data-frame'));
        const stream = card.getAttribute('data-stream');
        
        if (stream) evidenceCanvas.setStream(stream);
        evidenceCanvas.seekToFrame(frame);
        
        showToast(`Jumped to ${card.querySelector('.timeline-title').textContent} [Frame ${frame}]`);
      });
    });
  }

  function filterTimeline(category) {
    if (!currentCase) return;
    if (category === 'all') {
      renderTimelineCards(currentCase.timeline);
      return;
    }
    const filtered = currentCase.timeline.filter(e => {
      if (category === 'weapon' && (e.category === 'weapon' || e.title.toLowerCase().includes('weapon') || e.title.toLowerCase().includes('glock'))) return true;
      if (category === 'incident' && (e.category === 'incident' || e.severity === 'critical')) return true;
      if (category === 'person' && (e.category === 'person' || e.category === 'movement')) return true;
      if (category === 'audio' && (e.category === 'audio' || e.source.includes('AUDIO'))) return true;
      return false;
    });
    renderTimelineCards(filtered);
  }

  // =========================================================================
  // Scene Reconstruction Tour
  // =========================================================================
  function runSceneReconstructionTour() {
    if (isTourRunning) {
      clearInterval(tourInterval);
      isTourRunning = false;
      showToast("Scene Reconstruction Paused");
      return;
    }

    isTourRunning = true;
    showToast("Starting Automated Scene Reconstruction Tour...");
    const cards = document.querySelectorAll('.timeline-card');
    let stepIndex = 0;

    // Start audio visualizer too
    if (!audioVisualizer.isPlaying) audioVisualizer.play();

    tourInterval = setInterval(() => {
      if (stepIndex >= cards.length) {
        clearInterval(tourInterval);
        isTourRunning = false;
        showToast("Scene Reconstruction Tour Completed ✓");
        return;
      }

      cards.forEach(c => c.classList.remove('active-step'));
      const activeCard = cards[stepIndex];
      activeCard.classList.add('active-step');
      activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      const frame = parseInt(activeCard.getAttribute('data-frame'));
      const stream = activeCard.getAttribute('data-stream');
      if (stream) evidenceCanvas.setStream(stream);
      evidenceCanvas.seekToFrame(frame);

      const title = activeCard.querySelector('.timeline-title').textContent;
      showToast(`Step ${stepIndex + 1}/${cards.length}: ${title}`);

      stepIndex++;
    }, 2800);
  }

  // =========================================================================
  // AI Copilot Interactions & Suggestions
  // =========================================================================
  function initChatForm() {
    const form = document.getElementById('chat-input-form');
    const input = document.getElementById('chat-input-text');
    const clearBtn = document.getElementById('btn-clear-chat');
    const suggContainer = document.getElementById('suggestion-chips-container');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      aiEngine.ask(val);
    });

    clearBtn.addEventListener('click', () => {
      aiEngine.clearHistory();
      showToast("Chat history cleared");
    });

    // Wire suggestion chips
    suggContainer.querySelectorAll('.chip-query').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.textContent.trim();
        aiEngine.ask(text);
      });
    });
  }

  // =========================================================================
  // Evidence Ingestion Modal
  // =========================================================================
  function initIngestionModal() {
    const modal = document.getElementById('ingest-modal');
    const openBtn = document.getElementById('btn-open-ingest');
    const closeBtn = document.getElementById('btn-close-ingest');
    const simulateBtn = document.getElementById('btn-run-sample-ingest');

    openBtn.addEventListener('click', () => modal.classList.add('open'));
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));

    simulateBtn.addEventListener('click', () => {
      simulateIngestionPipeline();
    });

    const dropzone = document.getElementById('dropzone-area');
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '#06b6d4';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'rgba(6, 182, 212, 0.4)';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      simulateIngestionPipeline();
    });
  }

  function simulateIngestionPipeline() {
    const steps = [
      document.getElementById('pipe-step-1'),
      document.getElementById('pipe-step-2'),
      document.getElementById('pipe-step-3'),
      document.getElementById('pipe-step-4')
    ];

    steps.forEach(s => {
      s.classList.remove('active');
      s.querySelector('.step-status').textContent = 'Processing...';
      s.querySelector('.step-status').style.color = '#f59e0b';
    });

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        steps[currentStep].classList.add('active');
        steps[currentStep].querySelector('.step-status').textContent = 'Verified ✓';
        steps[currentStep].querySelector('.step-status').style.color = '#10b981';
        currentStep++;
      } else {
        clearInterval(interval);
        showToast("Multimodal evidence successfully ingested & synchronized!");
        setTimeout(() => {
          document.getElementById('ingest-modal').classList.remove('open');
        }, 800);
      }
    }, 600);
  }

  // =========================================================================
  // Entity Detection Telemetry Modal
  // =========================================================================
  function openDetectionModal(det) {
    const modal = document.getElementById('detection-detail-modal');
    const titleEl = document.getElementById('det-modal-title');
    const bodyEl = document.getElementById('det-modal-body');

    titleEl.textContent = `${det.label} [${det.id}]`;
    
    let attrsHtml = Object.entries(det.attributes || {}).map(([k, v]) => `
      <div style="margin-bottom: 8px;">
        <span style="color: #64748b; font-family: monospace; font-size: 11px;">${k.toUpperCase()}:</span>
        <div style="font-size: 13px; color: #f8fafc; font-weight: 500;">${v}</div>
      </div>
    `).join('');

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
        <div style="background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155;">
          <small style="color: #94a3b8; font-family: monospace;">CLASSIFICATION:</small>
          <div style="font-size: 14px; font-weight: 700; color: #06b6d4; margin-top: 4px;">${det.category}</div>
        </div>
        <div style="background: #0f172a; padding: 12px; border-radius: 6px; border: 1px solid #334155;">
          <small style="color: #94a3b8; font-family: monospace;">NEURAL CONFIDENCE:</small>
          <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-top: 4px;">${det.confidence}% Match</div>
        </div>
      </div>

      <div style="background: #0a0e1a; padding: 14px; border-radius: 6px; border: 1px solid #1e293b; margin-bottom: 16px;">
        <h4 style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-bottom: 10px;">FORENSIC ATTRIBUTES & BIOMETRICS:</h4>
        ${attrsHtml}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary" onclick="document.getElementById('detection-detail-modal').classList.remove('open')">Close</button>
        <button class="btn btn-primary" onclick="window.forensicAI.ask('Tell me everything about ${det.label}'); document.getElementById('detection-detail-modal').classList.remove('open')">Query AI about this Entity</button>
      </div>
    `;

    document.getElementById('btn-close-det-modal').onclick = () => modal.classList.remove('open');
    modal.classList.add('open');
  }

  // =========================================================================
  // Toast Notifications
  // =========================================================================
  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});
