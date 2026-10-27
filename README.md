# CrimeVision AI – Intelligent Multimodal Forensic Analysis Platform

> **Classification:** Law Enforcement Sensitive // CJIS Compliant Architecture Simulation  
> **Version:** v4.2  
> **Integrity Standard:** ISO/IEC 27037 & NIST SP 800-86 Compliant

An advanced, client-side multimodal forensic intelligence platform for digital evidence fusion, procedural CCTV / surveillance reconstruction, acoustic shockwave diarization, weapon detection, and contextual AI investigation.

---

## 🔍 Key Capabilities

- **Multimodal Evidence Viewer (`evidence-canvas.js`)**
  - High-performance HTML5 Canvas rendering procedural CCTV surveillance streams (Sub-vault corridors, Alleyway egress, Harbor logistics, Server rooms).
  - Multi-spectral optical filters: Standard Optical CCTV, IR Night Vision (green phosphor + noise grain), and FLIR Thermal.
  - Interactive digital pan & zoom (up to 4.0x) and frame scrubber (0–150 frames) with step forward/back controls.
  - Neural detection overlays: Bounding boxes with corner brackets, confidence chips, weapon highlights (YOLOv10), motion vectors, and attention heatmaps.
  - Clickable entity telemetry modals displaying biometric attributes and classification scores.

- **Acoustic Waveform & Diarization (`audio-visualizer.js`)**
  - Web Audio API waveform visualization with baseline grid and anomaly markers (e.g. 114.6 dB detonation shockwaves, tire cavitation).
  - Diarized witness transcripts (Whisper-v3) with speaker tags, stress levels, and synchronized transcript highlighting.

- **Chronological Unified Timeline (`app.js`)**
  - Cross-modal chronological fusion correlating audio, video, sensor trips, and suspect movement into a single coherent narrative.
  - Dynamic filtering: *All*, *Weapons*, *Incidents*, *Persons*, *Acoustic*.
  - Direct seek: Clicking any timeline event jumps the camera viewport to that exact frame and timecode.

- **Automated Scene Reconstruction Tour**
  - One-click automated walkthrough that steps through the crime timeline chronologically, switching cameras and syncing audio cues in real time.

- **Forensic Report Generator (`report-generator.js`)**
  - Generates ISO/IEC 27037 & NIST SP 800-86 compliant digital forensic intelligence reports.
  - Includes cryptographic chain-of-custody hashes (SHA-256), stream inventories, entity telemetry tables, and official examiner sign-off blocks.
  - One-click Print to PDF (`window.print()`) and standalone HTML export.

- **Evidence Ingestion Pipeline Simulation**
  - Drag-and-drop file upload simulating SHA-256 hashing, YOLOv10 object detection, Whisper-v3 diarization, and cross-modal graph fusion.

---

## 🗂️ Project Structure

```text
├── index.html              # Main dashboard interface
├── style.css               # Tactical dark mode forensic theme & HUD styles
├── app.js                  # Main orchestrator & UI event wiring
├── cases-data.js           # Multi-case database (Vault, Harbor, Server Room)
├── evidence-canvas.js      # Procedural video canvas, shaders, pan/zoom & bounding boxes
├── audio-visualizer.js     # Waveform generator & diarized transcript synchronizer
├── ai-engine.js            # Forensic AI Copilot Q&A engine with citations
├── report-generator.js     # ISO-compliant forensic PDF & HTML report generator
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

No build tools, package managers, or backend servers are required.

1. Clone the repository:
   ```bash
   git clone <REPO_URL>
   ```
2. Open `index.html` in any modern web browser (Edge, Chrome, Firefox, Safari).

---

## 🛡️ Forensic Integrity

All evidence entries feature simulated SHA-256 cryptographic hashes maintaining strict digital chain-of-custody verification.
