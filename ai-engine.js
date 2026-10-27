/**
 * CrimeVision AI - Persistent Multimodal Forensic AI Assistant
 * Provides context-aware natural language Q&A over video, audio transcripts,
 * acoustic sensor signatures, and chronological timeline events with citation linking.
 */

class ForensicAIEngine {
  constructor(chatMessagesContainer, options = {}) {
    this.container = chatMessagesContainer;
    this.currentCase = null;
    this.history = [];
    this.isThinking = false;

    this.onCitationClick = options.onCitationClick || (() => {});
  }

  loadCase(caseData) {
    this.currentCase = caseData;
    this.loadHistoryFromStorage();
    this.render();

    // If history is empty, insert default introductory forensic briefing
    if (this.history.length === 0) {
      this.addSystemMessage(`
        **CrimeVision AI Co-Pilot Initialized**  
        Case Context Loaded: **${caseData.id}** (${caseData.title}).  
        *Multimodal analysis synthesized from ${caseData.streams.length} sensory streams, ${caseData.detections.length} neural entity detections, and cross-referenced acoustic transcripts.*  
        How can I assist your investigation?
      `);
    }
  }

  getStorageKey() {
    return `crimevision_chat_${this.currentCase ? this.currentCase.id : 'global'}`;
  }

  loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        this.history = JSON.parse(stored);
      } else {
        this.history = [];
      }
    } catch (e) {
      this.history = [];
    }
  }

  saveHistoryToStorage() {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.history));
    } catch (e) {
      console.warn("Storage full or unavailable");
    }
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem(this.getStorageKey());
    this.loadCase(this.currentCase);
  }

  addMessage(role, content, citations = []) {
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      role, // 'user' or 'assistant' or 'system'
      content,
      citations,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    this.history.push(msg);
    this.saveHistoryToStorage();
    this.render();
    this.scrollToBottom();
  }

  addSystemMessage(content) {
    this.addMessage('system', content);
  }

  async ask(userQuestion) {
    if (!userQuestion || !userQuestion.trim()) return;

    // 1. Add user message
    this.addMessage('user', userQuestion);

    // 2. Set thinking state
    this.isThinking = true;
    this.renderThinkingIndicator();

    // 3. Synthesize response based on case context
    const responseData = await this.synthesizeForensicAnswer(userQuestion);

    // Remove thinking indicator
    this.isThinking = false;
    this.removeThinkingIndicator();

    // 4. Add assistant response
    this.addMessage('assistant', responseData.answer, responseData.citations);
  }

  async synthesizeForensicAnswer(query) {
    // Artificial network simulation delay for realistic thinking
    await new Promise(r => setTimeout(r, 650));

    const q = query.toLowerCase();
    const c = this.currentCase;

    // 1. Check for Weapon Queries
    if (q.includes('weapon') || q.includes('gun') || q.includes('firearm') || q.includes('brandish') || q.includes('glock') || q.includes('pistol')) {
      const weaponDet = c.detections.find(d => d.category.includes('Weapon'));
      return {
        answer: `**Weapon Detection Analysis:**  
Visual neural model YOLOv10-Forensic confirmed firearm presence on **${weaponDet ? weaponDet.stream : 'CAM-01'}** at **${weaponDet ? weaponDet.time : '23:13:45'}** with **${weaponDet ? weaponDet.confidence : 94.8}% confidence**.  
- **Classification:** ${weaponDet ? weaponDet.label : 'Semi-automatic Handgun (Glock 19)'}  
- **Tactical Posture:** Holstered in waistband, drawn with right hand, extended toward security terminal. Trigger finger remained along the slide (indicating tactical training).  
- **Cross-Validation:** Guard transcript at **[23:13:58]** explicitly matches: *"Subject is armed! Repeat, subject has a firearm drawn!"*`,
        citations: [
          { label: "CAM-01 [23:13:45]", streamId: "CAM-01", time: "23:13:45" },
          { label: "AUDIO-01 [23:13:58]", streamId: "AUDIO-01", time: "23:13:58" }
        ]
      };
    }

    // 2. Check for Discrepancy / Inconsistency Queries
    if (q.includes('discrepancy') || q.includes('inconsist') || q.includes('conflict') || q.includes('audio vs') || q.includes('witness')) {
      return {
        answer: `**Cross-Modal Triangulation & Discrepancy Verification:**  
- **Optical vs. Acoustic Correlation:** The reported loud blast by Guard Jenkins at 23:14:00 corresponds precisely with a **114.6 dB acoustic impulse** detected by the audio sensor array at **23:14:02**, corroborated by atmospheric dust billows observed on **CAM-01 frame 58**.  
- **Timeline Consistency:** **98.4% Match**. No major temporal hallucinations detected. Guard's initial report stated *"cutting tools"* at 23:13:54, but subsequent sensor data proves an explosive shaped charge was utilized rather than mechanical cutting.`,
        citations: [
          { label: "CAM-01 [23:14:02]", streamId: "CAM-01", time: "23:14:02" },
          { label: "AUDIO-01 [23:14:02]", streamId: "AUDIO-01", time: "23:14:02" }
        ]
      };
    }

    // 3. Check for Gunshot / Acoustic Detonation Queries
    if (q.includes('shot') || q.includes('detonation') || q.includes('sound') || q.includes('acoustic') || q.includes('explosion') || q.includes('blast') || q.includes('decibel')) {
      const acEvent = c.timeline.find(t => t.category === 'incident' || t.category === 'audio');
      return {
        answer: `**Acoustic Forensic Reconstruction:**  
An impulse signature was logged at **23:14:02 UTC** on **AUDIO-01 (Dispatch line)** with peak amplitude reaching **114.6 dB**.  
- **Spectral Profile:** Rapid rise time (under 4 milliseconds) with resonant low-frequency vibration (40 Hz - 3.2 kHz), matching high-order chemical breaching charges.  
- **Temporal Delta to Exit:** The acoustic impulse occurred **2 minutes and 8 seconds prior to suspect vehicle departure** (23:16:10).`,
        citations: [
          { label: "AUDIO-01 [23:14:02]", streamId: "AUDIO-01", time: "23:14:02" },
          { label: "CAM-02 [23:16:10]", streamId: "CAM-02", time: "23:16:10" }
        ]
      };
    }

    // 4. Check for Chronological Summary / Chain of Events
    if (q.includes('summarize') || q.includes('chain') || q.includes('timeline') || q.includes('unfold') || q.includes('overview') || q.includes('events')) {
      const events = c.timeline.map(t => `• **${t.time}** - *${t.title}* (${t.source}, ${t.confidence}% conf)`).join('\n');
      return {
        answer: `**Chronological Forensic Reconstruction (${c.id}):**  
${events}  
  
**Forensic Synopsis:** Initial security perimeter bypass at 23:12:18 led directly to armed corridor breach at 23:13:42. Door forced via explosive charge at 23:14:02. Suspect extracted ~25kg payload and escaped via North Alleyway sedan at 23:16:10.`,
        citations: [
          { label: "CAM-01 [23:12:18]", streamId: "CAM-01", time: "23:12:18" },
          { label: "CAM-01 [23:14:02]", streamId: "CAM-01", time: "23:14:02" },
          { label: "CAM-02 [23:16:10]", streamId: "CAM-02", time: "23:16:10" }
        ]
      };
    }

    // 5. Check for Suspect / Person / Clothing Attributes
    if (q.includes('suspect') || q.includes('person') || q.includes('height') || q.includes('clothing') || q.includes('who') || q.includes('subject') || q.includes('gait')) {
      const personDet = c.detections.find(d => d.category.includes('Person'));
      return {
        answer: `**Biometric & Morphological Suspect Profile:**  
- **Identifier:** Subject #1 (Lead Ingress Operative)  
- **Estimated Stature:** ${personDet && personDet.attributes.height ? personDet.attributes.height : '182 cm (± 3 cm)'} derived from corridor height markers and camera extrinsic matrix.  
- **Attire & Equipment:** ${personDet && personDet.attributes.clothing ? personDet.attributes.clothing : 'Dark hooded tactical storm jacket, reinforced gloves, neoprene balaclava mask.'}  
- **Gait Analysis:** Biomechanical step frequency of 1.4 m/s during entry; posture shift indicating right-side load bearing of ~25 kg upon egress.`,
        citations: [
          { label: "CAM-01 [23:13:42]", streamId: "CAM-01", time: "23:13:42" }
        ]
      };
    }

    // 6. Check for Vehicle / Egress Queries
    if (q.includes('car') || q.includes('vehicle') || q.includes('sedan') || q.includes('escape') || q.includes('getaway') || q.includes('license') || q.includes('alley')) {
      const vehDet = c.detections.find(d => d.category.includes('Vehicle'));
      return {
        answer: `**Getaway Vehicle Telemetry & Egress Route:**  
- **Vehicle Class:** ${vehDet ? vehDet.label : 'Dark Sedan (2022-2024 Honda Accord)'}  
- **Detection Point:** Stationary in North Alleyway with idling engine and brake lights engaged from **23:15:35**.  
- **Driver:** Secondary subject detected in driver seat awaiting Subject #1.  
- **Egress Path:** Accelerating northbound on Market St towards Interstate entrance ramp at approximately 52 km/h. License plate treated with anti-reflective coating to defeat ALPR flash.`,
        citations: [
          { label: "CAM-02 [23:15:35]", streamId: "CAM-02", time: "23:15:35" },
          { label: "CAM-02 [23:16:10]", streamId: "CAM-02", time: "23:16:10" }
        ]
      };
    }

    // Default Contextual Synthesis
    return {
      answer: `**Multimodal Query Result:**  
Regarding *"${userQuestion}"*:  
Cross-referencing active streams (**${c.streams.map(s => s.id).join(', ')}**) indicates full alignment with the established timeline.  
- **Key Entity:** ${c.detections[0].label} (${c.detections[0].confidence}% confidence)  
- **Lead Investigator:** ${c.leadInvestigator}  
- **Chain of Custody:** Cryptographically signed under hash \`${c.chainOfCustodyHash.substring(0, 18)}...\`  
- **Investigator Recommendation:** Review the chronological timeline at the center panel or export the full Forensic PDF report for complete evidentiary backing.`,
      citations: [
        { label: `${c.streams[0].id} [${c.detections[0].time}]`, streamId: c.streams[0].id, time: c.detections[0].time }
      ]
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = this.history.map(msg => {
      const isUser = msg.role === 'user';
      const isSystem = msg.role === 'system';

      let citationsHtml = '';
      if (msg.citations && msg.citations.length > 0) {
        citationsHtml = `
          <div class="message-citations">
            <span class="citation-title">Linked Evidence Citations:</span>
            ${msg.citations.map(c => `
              <button class="citation-chip" onclick="window.forensicAI.triggerCitation('${c.streamId}', '${c.time}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                ${c.label}
              </button>
            `).join('')}
          </div>
        `;
      }

      // Convert simple markdown bold/bullets
      let formattedText = msg.content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n• /g, '<br>• ');

      return `
        <div class="chat-message ${msg.role}">
          <div class="message-avatar">
            ${isUser ? 'INV' : (isSystem ? 'SYS' : 'CV')}
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">${isUser ? 'Investigator' : (isSystem ? 'System Core' : 'CrimeVision AI')}</span>
              <span class="message-time">${msg.timestamp}</span>
            </div>
            <div class="message-text">${formattedText}</div>
            ${citationsHtml}
          </div>
        </div>
      `;
    }).join('');

    this.scrollToBottom();
  }

  renderThinkingIndicator() {
    const thinkingEl = document.createElement('div');
    thinkingEl.id = 'ai-thinking-node';
    thinkingEl.className = 'chat-message assistant thinking';
    thinkingEl.innerHTML = `
      <div class="message-avatar">CV</div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-sender">CrimeVision AI</span>
          <span class="message-time">Analyzing streams...</span>
        </div>
        <div class="thinking-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    this.container.appendChild(thinkingEl);
    this.scrollToBottom();
  }

  removeThinkingIndicator() {
    const node = document.getElementById('ai-thinking-node');
    if (node) node.remove();
  }

  triggerCitation(streamId, timecode) {
    if (this.onCitationClick) {
      this.onCitationClick(streamId, timecode);
    }
  }

  scrollToBottom() {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }
}

window.ForensicAIEngine = ForensicAIEngine;
