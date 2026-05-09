/**
 * Nera Infiltrator - Tactical Field Engine
 * Clean Build v1.4.0
 */

class NeraInfiltrator {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    console.log("Nera Infiltrator: Systems online. Scanning battlefield...");
    this.setupObservation();
    this.scanExistingPosts();
  }

  setupObservation() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          this.scanForPosts(mutation.target);
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanExistingPosts() {
    this.scanForPosts(document.body);
  }

  scanForPosts(root) {
    if (!root || typeof root.querySelectorAll !== 'function') return;

    // We look for common post containers or elements that signify a post
    const candidates = root.querySelectorAll('div[role="article"], div[data-testid="fbfeed_story"], div[data-ad-comet-preview="message"]');

    candidates.forEach(candidate => {
      // Find the actual post container (usually role="article" or a close ancestor)
      let post = candidate.closest('div[role="article"]') || candidate;
      if (candidate.hasAttribute('data-ad-comet-preview')) {
        post = candidate.closest('div.x1y1aw1k.xwib8y2') || candidate.parentElement?.parentElement;
      }

      if (!post || post.dataset.neraInfiltrated) return;

      // Ensure it's not a nested component of another infiltrated post
      if (post.parentElement && post.parentElement.closest('[data-nera-infiltrated="true"]')) return;

      // Exclude non-post areas with high precision
      const isStories = post.closest('[aria-label*="Tin"], [aria-label*="Stories"]');
      const isComposer = post.closest('[role="presentation"], [aria-label*="Tạo bài viết"]');
      const isSidebar = post.closest('[role="complementary"]');
      const isMessenger = post.closest('[role="main"]') === null && post.closest('[aria-label*="Messenger"]');

      if (isStories || isComposer || isSidebar || isMessenger) return;

      // Must have either a message area or action buttons to be a valid target
      const hasContent = post.querySelector('[data-ad-preview="message"], [data-ad-comet-preview="message"], [aria-label*="Bình luận"], [aria-label*="Comment"]');
      if (!hasContent) return;

      this.injectNeraControl(post);
    });
  }

  async injectNeraControl(post) {
    if (post.dataset.neraInfiltrated) return;
    post.dataset.neraInfiltrated = 'true';

    // Fetch global persona for synchronization
    const { persona: globalPersona = 'Hawl' } = await chrome.storage.local.get('persona');


    const container = document.createElement('div');
    container.className = 'nera-control';
    const shadow = container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .nera-control { 
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        margin-top: 20px;
        width: 0;
        overflow: visible;
        pointer-events: none;
        z-index: 10000;
        font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      }      .tactical-console {
        position: sticky;
        top: 60px;
        left: 15px;
        width: calc(100% - 30px);
        pointer-events: auto;
        background: #1b1b1b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        margin-bottom: 15px;
        z-index: 10000;
      }
      .tactical-console::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #10b981, #3b82f6, #6366f1, #10b981);
        background-size: 200% 100%;
        opacity: 0.8;
        z-index: 10;
        animation: radarFlow 4s linear infinite;
      }
      @keyframes radarFlow {
        0% { background-position: 0% 0%; }
        100% { background-position: -200% 0%; }
      }

      .console-body {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .payload-editor {
        background: transparent;
        color: #e4e6eb;
        border: none;
        font-size: 13px;
        font-weight: 400;
        line-height: 1.5;
        outline: none;
        min-height: 40px;
        max-height: 180px;
        overflow-y: auto;
        padding: 0;
      }
      .payload-editor:empty:before {
        content: "What's the tactical plan today?";
        color: rgba(255, 255, 255, 0.2);
        pointer-events: none;
      }

      .console-footer {
        padding: 8px 16px 16px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .btn-refresh {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-refresh:hover { 
        background: rgba(255, 255, 255, 0.12); 
        transform: rotate(45deg);
      }

      .tactical-status {
        display: flex;
        align-items: center;
        gap: 6px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 11px;
        font-weight: 400;
        margin-left: 8px;
      }

      .tactical-badges {
        display: flex;
        gap: 4px;
        margin-left: 8px;
      }
      .badge {
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.5);
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 10px;
        font-weight: 500;
        text-transform: capitalize;
        border: 1px solid rgba(255, 255, 255, 0.03);
      }
      .badge-persona { color: #2374e1; border-color: rgba(35, 116, 225, 0.2); }

      .btn-primary {
        background: #2374e1;
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }
      .btn-primary:hover { background: #1b64d2; transform: translateY(-1px); }
      .btn-primary svg { width: 14px; height: 14px; }

      /* Suggestions Bar at the top */
      .suggestions-bar {
        padding: 10px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: #1b1b1b;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        pointer-events: auto;
      }
      .suggestion-group {
        display: flex;
        gap: 12px;
        align-items: center;
        overflow-x: auto;
        pointer-events: auto;
      }
      .suggestion-group::-webkit-scrollbar { display: none; }
      
      .persona-mini {
        width: 28px; height: 28px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.4);
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      .persona-mini.active {
        background: rgba(35, 116, 225, 0.2);
        color: #2374e1;
        box-shadow: 0 0 10px rgba(35, 116, 225, 0.2);
      }
      .persona-mini svg { width: 16px; height: 16px; }

      .intent-mini {
        padding: 4px 12px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.4);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      .intent-mini.active {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }
      


      @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      /* Visual Analysis Overlay */
      .nera-image-container { position: relative !important; overflow: hidden !important; }
      .nera-scanning-overlay {
        position: absolute;
        inset: 0;
        background: rgba(35, 116, 225, 0.15);
        backdrop-filter: blur(2px);
        z-index: 100;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #2374e1;
        animation: fadeIn 0.3s ease-out;
      }
      .nera-scanning-line {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: #2374e1;
        box-shadow: 0 0 15px #2374e1, 0 0 5px #fff;
        animation: scanMove 2s linear infinite;
      }
      .nera-scanning-text {
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-shadow: 0 0 10px #2374e1;
        background: rgba(0,0,0,0.5);
        padding: 4px 8px;
        border-radius: 4px;
      }
      @keyframes scanMove {
        0% { top: 0; }
        100% { top: 100%; }
      }
    `;

    const consoleEl = document.createElement('div');
    consoleEl.className = 'tactical-console';

    consoleEl.innerHTML = `
      <div class="suggestions-bar">
        <div class="suggestion-group">
          <span class="persona-mini" title="Hawl (Elite)" data-persona="Hawl">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </span>
          <span class="persona-mini" title="Friendly" data-persona="Friendly">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </span>
          <span class="persona-mini" title="Sarcastic" data-persona="Sarcastic">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="15" r="3"/><circle cx="18" cy="15" r="3"/><path d="M3 15h3"/><path d="M9 15h6"/><path d="M18 15h3"/><path d="M6 12a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3"/></svg>
          </span>
          <span class="persona-mini" title="Professional" data-persona="Professional">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </span>
          <span class="persona-mini" title="Chaos/Funny" data-persona="Funny">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </span>

          
          <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1); margin: 0 4px;"></div>

          <div class="intent-mini active" data-intent="agree">Đồng ý</div>
          <div class="intent-mini" data-intent="disagree">Phản đối</div>
          <div class="intent-mini" data-intent="tease">Trêu chọc</div>
          <div class="intent-mini" data-intent="suggest" style="background: rgba(35, 116, 225, 0.1); color: #2374e1;">AI Suggest</div>

        </div>
      </div>
      <div class="console-body">
        <div class="payload-editor" contenteditable="true"></div>
      </div>
      <div class="console-footer">
        <div style="display: flex; align-items: center;">
          <button class="btn-refresh" title="Reset Console">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
          <div class="tactical-badges">
            <div class="badge badge-persona">friendly</div>
            <div class="badge badge-intent">agree</div>
          </div>
        </div>

        <button class="btn-primary" id="nera-main-action">
          <span>Synthesize</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        </button>
      </div>
    `;

    // Functional Logic
    const editor = consoleEl.querySelector('.payload-editor');
    const mainBtn = consoleEl.querySelector('#nera-main-action');
    const refreshBtn = consoleEl.querySelector('.btn-refresh');
    const personaBadge = consoleEl.querySelector('.badge-persona');
    const intentBadge = consoleEl.querySelector('.badge-intent');
    const footer = consoleEl.querySelector('.console-footer');

    let selectedIntent = "agree";
    let selectedPersona = globalPersona;

    // Set initial active persona mini
    const initialActive = consoleEl.querySelector(`.persona-mini[data-persona="${selectedPersona}"]`);
    if (initialActive) initialActive.classList.add('active');
    else if (selectedPersona === 'Custom') {
      // If it's custom, we might not have an icon, but we can at least ensure we don't crash
    }


    const updateBadges = () => {
      personaBadge.innerText = selectedPersona;
      intentBadge.innerText = selectedIntent;
    };

    // Reset & Regenerate Logic
    refreshBtn.onclick = (e) => {
      e.stopPropagation();
      const userHint = editor.innerText.trim();

      mainBtn.dataset.state = "";
      mainBtn.innerHTML = `<span>Synthesize</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;

      this.sendLog("Tactical Reload: Regenerating...", "info");
      this.synthesizePayload(post, selectedIntent, selectedPersona, mainBtn, null, editor, footer, anchoredBtn, userHint);
    };

    // Persona Selection
    const personaMinis = consoleEl.querySelectorAll('.persona-mini');
    personaMinis.forEach(mini => {
      mini.onclick = (e) => {
        e.stopPropagation();
        personaMinis.forEach(i => i.classList.remove('active'));
        mini.classList.add('active');
        selectedPersona = mini.dataset.persona;
        updateBadges();

        // Sync with global storage
        chrome.storage.local.set({ persona: selectedPersona });

        this.sendLog(`Soul shifted: ${selectedPersona}`, "info");
      };
    });


    // Intent Selection Logic
    const attachIntentLogic = (el) => {
      el.onclick = (e) => {
        e.stopPropagation();
        consoleEl.querySelectorAll('.intent-mini').forEach(p => p.classList.remove('active'));
        el.classList.add('active');
        selectedIntent = el.dataset.intent;
        updateBadges();
        this.sendLog(`Aim locked: ${selectedIntent}`, "info");
      };
    };

    const intentMinis = consoleEl.querySelectorAll('.intent-mini');
    intentMinis.forEach(mini => {
      if (mini.dataset.intent === 'suggest') {
        mini.onclick = async (e) => {
          e.stopPropagation();
          const originalText = mini.innerText;
          mini.innerText = "Scanning...";
          mini.style.opacity = "0.7";
          mini.style.pointerEvents = "none";

          this.safeSendMessage({
            type: "SUGGEST_INTENTS",
            content: post.innerText.substring(0, 1000)
          }, (response) => {
            mini.innerText = originalText;
            mini.style.opacity = "1";
            mini.style.pointerEvents = "auto";

            if (response && response.success && response.intents) {
              response.intents.forEach(text => {
                const newIntent = document.createElement('div');
                newIntent.className = 'intent-mini';
                newIntent.dataset.intent = text.toLowerCase();
                newIntent.innerText = text;
                attachIntentLogic(newIntent);
                mini.parentNode.insertBefore(newIntent, mini);
              });
              this.sendLog("AI suggested new tactical paths.", "success");
            }
          });
        };
      } else {
        attachIntentLogic(mini);
      }
    });



    // Block click-through for the whole bar
    const sugBar = consoleEl.querySelector('.suggestions-bar');
    sugBar.onclick = (e) => e.stopPropagation();

    // Find anchored comment button
    const anchoredBtn = post.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
      post.querySelector('i[style*="background-position: 0px -487px"]')?.closest('div[role="button"]') ||
      post.querySelector('div[aria-label="Viết bình luận"]');

    mainBtn.onclick = (e) => {
      e.stopPropagation();
      if (mainBtn.dataset.state === 'ready') {
        this.executeDeployment(post, editor.innerText, mainBtn, anchoredBtn);
      } else {
        const userHint = editor.innerText.trim();
        this.synthesizePayload(post, selectedIntent, selectedPersona, mainBtn, null, editor, footer, anchoredBtn, userHint);
      }
    };

    shadow.appendChild(style);
    shadow.appendChild(consoleEl);

    post.appendChild(container);
    post.style.setProperty('position', 'relative', 'important');
    post.style.setProperty('overflow', 'visible', 'important');
    post.style.setProperty('contain', 'none', 'important');

    this.sendLog("Tactical Console ready for input.", "success");
  }

  synthesizePayload(post, intent, persona, btn, box, editor, footer, anchoredBtn, userHint = "") {
    btn.disabled = true;
    btn.innerHTML = `<span class="nera-spinner"></span> Synthesizing...`;

    // Image Analysis Scan
    const scanOverlays = [];
    const imageUrls = [];
    const imgs = post.querySelectorAll('img');

    imgs.forEach(img => {
      if (img.width > 120 && img.src && !img.src.includes('emoji')) {
        imageUrls.push(img.src);
        const wrapper = img.parentElement;
        if (wrapper) {
          wrapper.classList.add('nera-image-container');
          const overlay = document.createElement('div');
          overlay.className = 'nera-scanning-overlay';
          overlay.innerHTML = `<div class="nera-scanning-line"></div><div class="nera-scanning-text">Analyzing Target</div>`;
          wrapper.appendChild(overlay);
          scanOverlays.push(overlay);
        }
      }
    });

    let targetText = post.innerText.substring(0, 2000);

    this.safeSendMessage({
      type: "ANALYZE_POST",
      content: targetText,
      intent: intent,
      persona: persona,
      userHint: userHint,
      imageUrls: imageUrls
    }, (response) => {
      btn.disabled = false;
      // Clean up scanning effects
      scanOverlays.forEach(o => o.remove());

      if (response && response.success) {
        if (box) box.style.display = 'flex';
        editor.innerText = response.comment;
        btn.innerHTML = `<span>Launch Payload</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        btn.dataset.state = 'ready';
      } else {
        btn.innerHTML = `<span>Retry Synthesis</span>`;
        btn.disabled = false;
        if (response && response.error) {
          this.sendLog(`Synthesis failed: ${response.error}`, "error");
        }
      }
    });
  }

  safeSendMessage(message, callback) {
    try {
      if (!chrome.runtime || !chrome.runtime.id) {
        throw new Error("Extension context invalidated.");
      }
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          this.sendLog("Nera Link Severed: Please refresh the page.", "error");
          return;
        }
        callback(response);
      });
    } catch (e) {
      console.error("[Nera] Message failed:", e);
      this.sendLog("Nera Link Severed: Please refresh the page.", "error");

      // Visual feedback on the console if it's open
      const log = document.querySelector('.tactical-log');
      if (log) {
        log.innerHTML = `<div style="color:#ff4d4d; font-weight:bold; padding:10px;">[CRITICAL] Connection lost. Please refresh the page to re-establish Nera link.</div>` + log.innerHTML;
      }
    }
  }

  async executeDeployment(post, text, btn, anchoredBtn) {
    btn.disabled = true;
    btn.innerText = 'Launching...';
    const success = await this.executeGhostTyping(post, text, true, anchoredBtn);
    if (success) {
      btn.innerText = 'Deployed';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerText = 'Launch Payload';
      }, 2000);
    } else {
      btn.disabled = false;
      btn.innerText = 'Failed - Retry';
    }
  }


  async executeGhostTyping(post, text, autoSubmit = false, anchoredBtn = null) {
    const inputSelectors = [
      'div[role="textbox"][data-lexical-editor="true"]',
      'div[role="textbox"][aria-label*="Bình luận dưới tên"]',
      'div[role="textbox"][aria-label*="Bình luận..."]',
      'div[role="textbox"][aria-label*="Comment..."]',
      'div[contenteditable="true"]'
    ];

    let input = this.findInput(post, inputSelectors);

    if (!input) {
      this.sendLog("Target terminal missing. Forcing access...", "warning");
      let commentBtn = anchoredBtn;
      if (!commentBtn) {
        // 1. Precise Match from User HTML (data-ad-rendering-role is the most stable)
        commentBtn = post.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
          post.querySelector('i[style*="background-position: 0px -487px"]')?.closest('div[role="button"]') ||
          post.querySelector('div[aria-label="Viết bình luận"]');
      }

      // 2. Global Sweep for candidates (FB Portals)
      if (!commentBtn) {
        const candidates = [];
        const btnSelectors = [
          'div[data-ad-rendering-role="comment_button"]',
          'i[style*="background-position: 0px -487px"]',
          'div[aria-label="Viết bình luận"]',
          'div[aria-label*="Bình luận"]',
          'div[aria-label*="Comment"]'
        ];

        for (const s of btnSelectors) {
          const els = document.querySelectorAll(s);
          els.forEach(el => {
            const btn = el.closest('div[role="button"]') || el;
            if (btn && btn.offsetParent !== null) candidates.push(btn);
          });
        }

        if (candidates.length > 0) {
          const postRect = post.getBoundingClientRect();
          const targetY = postRect.bottom - 40;

          const validCandidates = candidates.filter(c => {
            const r = c.getBoundingClientRect();
            return r.top > postRect.top && r.top < (postRect.bottom + 100);
          });

          if (validCandidates.length > 0) {
            validCandidates.sort((a, b) => {
              const aRect = a.getBoundingClientRect();
              const bRect = b.getBoundingClientRect();
              return Math.abs(aRect.top - targetY) - Math.abs(bRect.top - targetY);
            });
            commentBtn = validCandidates[0];
            this.sendLog(`Precision lock established on interaction bar.`, "info");
          } else {
            candidates.sort((a, b) => {
              const aRect = a.getBoundingClientRect();
              const bRect = b.getBoundingClientRect();
              return Math.abs(aRect.top - targetY) - Math.abs(bRect.top - targetY);
            });
            commentBtn = candidates[0];
          }
        }
      }

      // 3. Last Stand: Search by Text globally
      if (!commentBtn) {
        const allButtons = document.querySelectorAll('div[role="button"]');
        const postRect = post.getBoundingClientRect();
        const postCenter = postRect.top + postRect.height / 2;
        let closest = null;
        let minDist = Infinity;

        for (const btn of allButtons) {
          const text = btn.innerText || "";
          if (text.includes("Bình luận") || text.includes("Comment") || text.includes("Viết bình luận")) {
            const btnRect = btn.getBoundingClientRect();
            const dist = Math.abs(btnRect.top - postCenter);
            if (dist < 1000 && dist < minDist) {
              minDist = dist;
              closest = btn;
            }
          }
        }
        commentBtn = closest;
      }

      if (commentBtn) {
        this.sendLog("Comment button located. Initiating bypass...", "info");
        commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Advanced Click Bypass
        const events = ['mousedown', 'mouseup', 'click'];
        events.forEach(type => {
          commentBtn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });

        this.sendLog("Signal sent. Awaiting terminal initialization...", "info");
        await new Promise(r => setTimeout(r, 2500)); // FB Comet needs more time sometimes
        input = this.findInput(post, inputSelectors);
      } else {
        this.sendLog("Could not locate interaction button via Deep Scan.", "error");
      }
    }

    if (!input) {
      this.sendLog("Infiltration failed: Terminal unreachable. (No Lexical Editor found)", "error");
      return false;
    }

    if (!chrome.storage || !chrome.storage.local) return false;
    const { stealthLevel = 'standard' } = await chrome.storage.local.get('stealthLevel');
    const config = this.getStealthConfig(stealthLevel);

    input.focus();
    // Clear existing content (Facebook Lexical)
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);

    for (let i = 0; i < text.length; i++) {
      if (!chrome.runtime || !chrome.runtime.id) break;

      const char = text[i];
      if (Math.random() < config.errorRate) {
        const typo = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        this.dispatchKey(input, typo);
        await new Promise(r => setTimeout(r, config.minDelay));
        this.dispatchKey(input, 'Backspace');
        await new Promise(r => setTimeout(r, config.minDelay));
      }

      this.dispatchKey(input, char);

      // Dynamic Delay with Burst Mode
      let delay = config.minDelay + Math.random() * (config.maxDelay - config.minDelay);
      if (stealthLevel === 'fast' && Math.random() < 0.4) delay = 2; // 40% chance of extreme burst

      if (config.pauseEvery && i > 0 && i % config.pauseEvery === 0) {
        await new Promise(r => setTimeout(r, config.pauseDuration));
      }
      await new Promise(r => setTimeout(r, delay));
    }

    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    if (autoSubmit) {
      this.sendLog("Payload delivered. Authorizing submission...", "info");
      await new Promise(r => setTimeout(r, 800));
      const submitBtn = this.findSubmitButton(post);
      if (submitBtn) {
        submitBtn.click();
        this.sendLog("Mission accomplished. Ghost in the shell.", "success");

        // Auto-close Modal after submission
        setTimeout(() => {
          const closeBtn = document.querySelector('div[aria-label="Đóng"]') ||
            document.querySelector('div[aria-label="Close"]') ||
            document.querySelector('div[aria-label="Gỡ"]') || // Sometimes it shows as 'Gỡ' for some overlays
            Array.from(document.querySelectorAll('div[role="button"]')).find(b => {
              const svg = b.querySelector('svg');
              return svg && svg.innerHTML.includes('M19.884 5.884');
            });

          if (closeBtn) {
            this.sendLog("Auto-cleaning terminal (Closing modal)...", "info");
            closeBtn.click();
          }
        }, 1500);

        return true;
      } else {
        this.sendLog("Submit button not found. Manual confirmation required.", "warning");
        return true;
      }
    }
    return true;
  }

  async suggestIntents(post, container, shadow, anchoredBtn, trigger) {
    const suggestBtn = container.querySelector('.ai-suggest');
    if (!suggestBtn || suggestBtn.dataset.loading) return;

    suggestBtn.dataset.loading = "true";
    const originalText = suggestBtn.innerText;
    suggestBtn.innerText = "Scanning...";

    try {
      let targetText = "";
      const textEls = post.querySelectorAll('[data-ad-comet-preview="message"], [data-testid="post_message"], .story_body_container, .userContent');
      textEls.forEach(el => targetText += el.innerText + " ");

      chrome.runtime.sendMessage({
        type: "SUGGEST_INTENTS",
        content: targetText.substring(0, 1000)
      }, (response) => {
        suggestBtn.innerText = originalText;
        suggestBtn.dataset.loading = "";

        if (response && response.success && response.intents) {
          // Remove AI suggest button temporarily to add new ones before it
          suggestBtn.remove();

          response.intents.forEach(label => {
            const chip = document.createElement('div');
            chip.className = 'intent-chip';
            chip.style.borderColor = 'rgba(69, 189, 255, 0.5)';
            chip.innerText = label;
            chip.onclick = (e) => {
              this.handleAction(post, trigger, shadow, e, anchoredBtn, label);
            };
            container.appendChild(chip);
          });

          this.sendLog("Strategic intents updated by AI.", "success");
        } else {
          this.sendLog("AI Suggestion failed.", "error");
        }
      });
    } catch (err) {
      suggestBtn.innerText = originalText;
      suggestBtn.dataset.loading = "";
      this.sendLog(`Error suggesting intents: ${err.message}`, "error");
    }
  }

  findInput(root, selectors) {
    // 1. Search within the post container first
    for (const s of selectors) {
      const el = root.querySelector(s);
      if (el) return el;
    }

    // 2. Global Search: Facebook often portals the editor outside the post article
    const allEditors = Array.from(document.querySelectorAll(selectors.join(',')));
    if (allEditors.length === 0) return document.querySelector('div[data-lexical-editor="true"]');

    // Return the one closest to the current post
    const postRect = root.getBoundingClientRect();
    const postCenter = postRect.top + postRect.height / 2;

    return allEditors.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return Math.abs(aRect.top - postCenter) - Math.abs(bRect.top - postCenter);
    })[0];
  }

  findSubmitButton(post) {
    const selectors = [
      'div[aria-label="Đăng bình luận"]',
      'div[aria-label="Post comment"]',
      'div[aria-label="Đăng"]',
      'div[role="button"][aria-label*="Đăng"]',
      'div[id="focused-state-composer-submit"] div[role="button"]'
    ];

    for (const s of selectors) {
      const btn = post.querySelector(s) || document.querySelector(s);
      if (btn && !btn.hasAttribute('aria-disabled')) return btn;
    }

    const paths = post.querySelectorAll('path') || document.querySelectorAll('path');
    for (const p of paths) {
      const d = p.getAttribute('d');
      if (d && d.includes('M1.32 6.2')) {
        return p.closest('div[role="button"]');
      }
    }
    return null;
  }

  getStealthConfig(level) {
    const presets = {
      'fast': { minDelay: 5, maxDelay: 15, errorRate: 0.002, pauseEvery: null },
      'standard': { minDelay: 30, maxDelay: 80, errorRate: 0.01, pauseEvery: null },
      'human': { minDelay: 80, maxDelay: 220, errorRate: 0.03, pauseEvery: 15, pauseDuration: 1000 },
      'paranoid': { minDelay: 150, maxDelay: 400, errorRate: 0.05, pauseEvery: 8, pauseDuration: 2000 }
    };
    return presets[level] || presets.standard;
  }

  dispatchKey(el, char) {
    const isEnter = char === 'Enter';
    const opts = { bubbles: true, cancelable: true, key: char, code: isEnter ? 'Enter' : '', keyCode: isEnter ? 13 : char.charCodeAt(0), which: isEnter ? 13 : char.charCodeAt(0) };
    el.dispatchEvent(new KeyboardEvent('keydown', opts));
    if (char === 'Backspace') {
      if (el.value !== undefined) el.value = el.value.slice(0, -1);
      else { el.focus(); document.execCommand('delete', false); }
    } else if (isEnter) {
      el.dispatchEvent(new KeyboardEvent('keypress', opts));
    } else {
      if (el.getAttribute('contenteditable') === 'true') { el.focus(); document.execCommand('insertText', false, char); }
      else if (el.value !== undefined) el.value += char;
      else el.innerText += char;
    }
    el.dispatchEvent(new KeyboardEvent('keyup', opts));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  sendLog(message, status) {
    if (chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({ type: "LOG_EVENT", text: `[FIELD] ${message}`, status: status }).catch(() => { });
    }
    console.log(`[NERA][${status.toUpperCase()}] ${message}`);
  }

  updateBtn(btn, text, disabled, isError = false) {
    btn.innerText = text;
    btn.disabled = disabled;
    btn.style.borderColor = isError ? '#ef4444' : (disabled ? '#3b82f6' : '#2e2e2e');
    if (isError) {
      setTimeout(() => {
        btn.innerText = 'Analyze';
        btn.disabled = false;
        btn.style.borderColor = '#2e2e2e';
      }, 3000);
    }
  }
}

class NeraOverlay {
  constructor() {
    this.container = null;
    this.isOpen = false;
    this.create();
    this.init();
  }

  init() {
    console.log("[NERA] Tactical Overlay optimized. Ready for Alt + Z.");

    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      }
    }, true);
  }

  toggle() {
    this.isOpen ? this.hide() : this.show();
  }

  show() {
    this.container.style.display = 'block';
    this.container.style.pointerEvents = 'auto';

    requestAnimationFrame(() => {
      const overlay = this.container.shadowRoot.querySelector('.nera-overlay');
      if (overlay) overlay.style.transform = 'translateX(0)';
    });

    this.isOpen = true;

    // Hide trigger
    const trigger = this.container.shadowRoot.querySelector('.nera-trigger');
    if (trigger) {
      trigger.style.opacity = '0';
      trigger.style.transform = 'translateX(-100%)';
      trigger.style.pointerEvents = 'none';
    }
  }

  hide() {
    const overlay = this.container.shadowRoot.querySelector('.nera-overlay');
    if (overlay) overlay.style.transform = 'translateX(-120%)';

    this.container.style.pointerEvents = 'none';
    setTimeout(() => {
      if (!this.isOpen) {
        this.container.style.display = 'none';
        // Show trigger
        const trigger = this.container.shadowRoot.querySelector('.nera-trigger');
        if (trigger) {
          trigger.style.opacity = '1';
          trigger.style.transform = 'translateX(0)';
          trigger.style.pointerEvents = 'auto';
          this.container.style.display = 'block'; // Keep container alive for trigger
        }
      }
    }, 500);
    this.isOpen = false;
  }

  create() {
    this.container = document.createElement('div');
    this.container.id = 'nera-dashboard-root';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      bottom: 20px;
      left: 20px;
      width: 440px;
      z-index: 2147483647;
      display: none;
      pointer-events: none;
    `;

    const shadow = this.container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .nera-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a0c;
        box-shadow: 0 10px 50px rgba(0,0,0,0.6);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2;
        
        /* GPU Acceleration - Slide from Left */
        transform: translateX(-120%);
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform;
        backface-visibility: hidden;
        pointer-events: auto;
      }
      .nera-trigger {
        position: absolute;
        top: 50%;
        left: -20px; /* Attach to edge */
        transform: translateY(-50%);
        width: 44px;
        height: 60px;
        background: rgba(20, 20, 24, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.1);
        border-left: none;
        border-radius: 0 8px 8px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1;
        box-shadow: 5px 0 20px rgba(0,0,0,0.3);
        pointer-events: auto;
      }
      .nera-trigger:hover {
        left: -10px;
        background: rgba(59, 130, 246, 0.15);
        border-color: rgba(59, 130, 246, 0.4);
      }
      .nera-trigger svg {
        width: 20px;
        height: 20px;
        color: #3b82f6;
        filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.5));
      }
      iframe {
        flex: 1;
        width: 100%;
        border: none;
        background: transparent;
      }
      .drag-handle {
        height: 3px;
        width: 30px;
        background: rgba(255,255,255,0.08);
        border-radius: 2px;
        margin: 10px auto 0;
        flex-shrink: 0;
      }
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'nera-overlay';

    const handle = document.createElement('div');
    handle.className = 'drag-handle';

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('sidepanel.html');

    const trigger = document.createElement('div');
    trigger.className = 'nera-trigger';
    trigger.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>`;
    trigger.onclick = () => this.show();

    wrapper.appendChild(handle);
    wrapper.appendChild(iframe);
    shadow.appendChild(style);
    shadow.appendChild(trigger);
    shadow.appendChild(wrapper);

    (document.body || document.documentElement).appendChild(this.container);

    // Initial State: Show trigger if not open
    this.container.style.display = 'block';
  }
}

new NeraInfiltrator();
new NeraOverlay();
