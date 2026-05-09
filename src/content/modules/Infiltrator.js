/**
 * Nera Infiltration Agent - Core Logic
 */
export class NeraInfiltrator {
  constructor(NeraStyles, NeraTemplates, NeraDataMiner) {
    this.NeraStyles = NeraStyles;
    this.NeraTemplates = NeraTemplates;
    this.NeraDataMiner = NeraDataMiner;
    this.observer = null;
    this.globalPersona = 'Hawl';
    this.init();
  }

  async init() {
    console.log("[NERA] Infiltration Agent active. Scanning targets...");
    
    // Initial persona load
    const result = await chrome.storage.local.get('persona');
    if (result.persona) this.globalPersona = result.persona;

    // Listen for persona changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.persona) this.globalPersona = changes.persona.newValue;
    });

    this.setupObserver();
    this.scanExisting();

    // Tactical Pulse: Periodic deep scan for late-rendering posts or missed targets
    setInterval(() => this.scanExisting(), 3000);
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            this.checkNode(node);
          }
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  scanExisting() {
    const postSelectors = [
      'div[data-testid="fbfeed_story"]',
      '[role="article"]',
      'div[data-ad-preview="message"]',
      'div.x1y1aw1k.xwib8y2.x1ye3wu6',
      'div.x1pbtk8m',
      'div[data-pagelet*="FeedUnit"]',
      'div[data-pagelet*="GroupFeed"]',
      'div[role="dialog"] [role="article"]'
    ];
    
    // 1. Direct Selector Scan
    const directPosts = document.querySelectorAll(postSelectors.join(','));
    directPosts.forEach(post => this.injectNeraControl(post));

    // 2. Discovery by Interaction (The "Catch-all" failsafe)
    const triggers = document.querySelectorAll('div[role="toolbar"], div[aria-label*="Hành động"], div[aria-label*="Actions"], i[style*="-487px"], div[data-ad-rendering-role="comment_button"]');
    triggers.forEach(t => {
      try {
        const post = t.closest('div[data-testid*="story"], [role="article"], div.x1y1aw1k, div.x1pbtk8m, div.x193iq5w, div[data-pagelet*="FeedUnit"], div[role="dialog"] div.x1n2onr6');
        if (post) this.injectNeraControl(post);
      } catch (e) { /* Skip invalid nodes */ }
    });
  }

  checkNode(node) {
    try {
      const postSelectors = [
        'div[data-testid="fbfeed_story"]',
        '[role="article"]',
        'div[data-ad-preview="message"]',
        'div.x1y1aw1k.xwib8y2.x1ye3wu6',
        'div.x1pbtk8m',
        'div[data-pagelet*="FeedUnit"]',
        'div[role="dialog"] [role="article"]'
      ];
      if (node.matches && postSelectors.some(s => node.matches(s))) {
        this.injectNeraControl(node);
      } else {
        const posts = node.querySelectorAll(postSelectors.join(','));
        posts.forEach(post => this.injectNeraControl(post));
      }
    } catch (e) { /* Silent fail */ }
  }

  injectNeraControl(post) {
    if (post.dataset.neraInfiltrated) return;
    
    // Safety check: skip elements that are obviously not posts (like very small buttons)
    if (post.offsetWidth < 50 || post.offsetHeight < 50) return;
    
    post.dataset.neraInfiltrated = 'true';

    const container = document.createElement('div');
    container.className = 'nera-control';
    const shadow = container.attachShadow({ mode: 'open' });

    // Inject Styles
    this.NeraStyles.inject(shadow);

    const consoleEl = document.createElement('div');
    consoleEl.className = 'tactical-console'; // Starts minified by default
    
    let selectedIntent = "agree";
    let selectedPersona = this.globalPersona;

    consoleEl.innerHTML = this.NeraTemplates.getConsoleHTML(selectedPersona, selectedIntent);

    // Toggle Logic
    const toggleFunc = (e) => {
      e.stopPropagation();
      consoleEl.classList.toggle('expanded');
      this.sendLog(consoleEl.classList.contains('expanded') ? "Console Expanded: High-Fidelity Mode" : "Console Minified: Stealth Mode", "info");
    };

    const trigger = consoleEl.querySelector('.nera-toggle-trigger');
    const closeBtn = consoleEl.querySelector('.nera-close-btn');
    
    if (trigger) trigger.onclick = toggleFunc;
    if (closeBtn) closeBtn.onclick = toggleFunc;

    const editor = consoleEl.querySelector('.payload-editor');
    const mainBtn = consoleEl.querySelector('#nera-main-action');
    const personaBadge = consoleEl.querySelector('.badge-persona');
    const intentBadge = consoleEl.querySelector('.badge-intent');
    const footer = consoleEl.querySelector('.console-footer');
    
    const updateBadges = () => {
      if (personaBadge) personaBadge.innerText = selectedPersona;
      if (intentBadge) intentBadge.innerText = selectedIntent;
    };

    // Set initial active persona mini
    const initialActive = consoleEl.querySelector(`.persona-mini[data-persona="${selectedPersona}"]`);
    if (initialActive) initialActive.classList.add('active');

    // Find anchored comment button early (Legacy 'Icon Recognition' Logic)
    const anchoredBtn = post.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
      post.querySelector('i[style*="background-position: 0px -487px"]')?.closest('div[role="button"]') ||
      post.querySelector('div[aria-label="Viết bình luận"]') ||
      post.querySelector('div[aria-label*="Bình luận"]') ||
      post.querySelector('div[aria-label*="Comment"]');

    // Reset Logic
    const refreshBtn = consoleEl.querySelector('.btn-refresh');
    if (refreshBtn) {
      refreshBtn.onclick = (e) => {
        e.stopPropagation();
        editor.innerText = "";
        mainBtn.dataset.state = "";
        mainBtn.innerHTML = `<span>Synthesize</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
        this.sendLog("Tactical Reload: Regenerating...", "info");
        // No auto-trigger on manual reset to allow hint typing
      };
    }

    // Persona Selection
    const personaMinis = consoleEl.querySelectorAll('.persona-mini');
    personaMinis.forEach(mini => {
      mini.onclick = (e) => {
        e.stopPropagation();
        personaMinis.forEach(i => i.classList.remove('active'));
        mini.classList.add('active');
        selectedPersona = mini.dataset.persona;
        updateBadges();
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

        // AUTOMATIC FLOW: Clicking an intent automatically triggers synthesis
        const userHint = editor.innerText.trim();
        mainBtn.dataset.state = ""; // Reset state to ensure synthesis triggers
        this.synthesizePayload(post, selectedIntent, selectedPersona, mainBtn, null, editor, footer, anchoredBtn, userHint);
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

    if (mainBtn) {
      mainBtn.onclick = (e) => {
        e.stopPropagation();
        if (mainBtn.dataset.state === 'ready') {
          this.executeDeployment(post, editor.innerText, mainBtn, anchoredBtn);
        } else {
          const userHint = editor.innerText.trim();
          this.synthesizePayload(post, selectedIntent, selectedPersona, mainBtn, null, editor, footer, anchoredBtn, userHint);
        }
      };
    }

    shadow.appendChild(consoleEl);
    
    // Consistent Top-Right Placement via CSS Absolute Positioning
    post.prepend(container);
    
    // Ensure post container doesn't clip our console
    post.style.setProperty('position', 'relative', 'important');
    post.style.setProperty('overflow', 'visible', 'important');
    post.style.setProperty('contain', 'none', 'important');

    this.sendLog("Tactical Console ready for input.", "success");
  }

  synthesizePayload(post, intent, persona, btn, box, editor, footer, anchoredBtn, userHint = "") {
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="nera-spinner"></span> Synthesizing...`;
    
    // Advanced Context Extraction using DataMiner
    const postData = this.NeraDataMiner.extract(post);
    
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
          overlay.innerHTML = this.NeraTemplates.getScanningOverlay();
          wrapper.appendChild(overlay);
          scanOverlays.push(overlay);
        }
      }
    });

    const prompt = `
      CONTEXT: Facebook Post
      POST TYPE: ${postData.type}
      MODALITY: ${postData.modality}
      AUTHOR: ${postData.author}
      ${postData.groupName ? `GROUP: ${postData.groupName}` : ""}
      CONTENT: ${postData.content}
      METRICS: ${postData.metrics.reactions} reactions, ${postData.metrics.comments} comments
      PERSONA: ${persona}
      INTENT: ${intent}
      USER_HINT: ${userHint}
      
      ACTION: Generate a short, natural, and engaging comment for this post.
      ${postData.modality === 'IMAGE' ? "NOTE: This post contains an image, you can mention it." : ""}
      ${postData.modality === 'VIDEO' ? "NOTE: This post contains a video, you can mention it." : ""}
      ${postData.type === 'SHARED' ? "NOTE: This is a shared post, acknowledge the context of sharing." : ""}
    `;

    this.safeSendMessage({
      type: "ANALYZE_POST",
      content: prompt,
      intent: intent,
      persona: persona,
      userHint: userHint,
      imageUrls: imageUrls
    }, (response) => {
      btn.disabled = false;
      scanOverlays.forEach(o => o.remove());

      if (response && response.success) {
        if (box) box.style.display = 'flex';
        if (editor) editor.innerText = response.comment;
        btn.innerHTML = `<span>Launch Payload</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
        btn.dataset.state = 'ready';
      } else {
        btn.innerHTML = `<span>Retry Synthesis</span>`;
        if (response && response.error) {
          this.sendLog(`Synthesis failed: ${response.error}`, "error");
        }
      }
    });
  }

  safeSendMessage(message, callback) {
    try {
      if (!chrome.runtime || !chrome.runtime.id) throw new Error("Extension context invalidated.");
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) return;
        callback(response);
      });
    } catch (e) {
      this.sendLog("Nera Link Severed: Please refresh the page.", "error");
    }
  }

  async executeDeployment(post, text, btn, anchoredBtn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="nera-spinner"></span> Deploying...`;
    const success = await this.executeGhostTyping(post, text, true, anchoredBtn);
    if (success) {
      btn.innerHTML = `<span>Deployed</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `<span>Launch Payload</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
      }, 2000);
    } else {
      btn.disabled = false;
      btn.innerHTML = `<span>Failed - Retry</span>`;
    }
  }

  getCurrentMode() {
    const path = window.location.pathname;
    const search = window.location.search;
    if (path.includes('/groups/')) return 'GROUP';
    if (path.includes('/watch') || path.includes('/reels')) return 'VIDEO';
    if (path === '/' || path.includes('/feed') || search.includes('sk=h_chr')) return 'FEED';
    if (path.includes('/posts/') || path.includes('/permalink')) return 'PERMALINK';
    if (path.match(/\/[a-zA-Z0-9.]+$/) && !path.includes('/')) return 'PROFILE'; // Simple profile check
    return 'STANDARD';
  }

  async executeGhostTyping(post, text, autoSubmit = false, anchoredBtn = null) {
    // Stage 0: Recursive Root Normalization (Climb until we see the interaction bar)
    let root = post;
    for (let i = 0; i < 8; i++) {
      if (root.querySelector('div[role="toolbar"], div[aria-label*="Hành động"], div[aria-label*="Actions"], i[style*="-487px"]')) break;
      if (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
      else break;
    }

    const mode = this.getCurrentMode();
    this.sendLog(`Environment: ${mode}. Root identified: ${root.tagName}.${Array.from(root.classList).join('.')}`, "info");
    
    const inputSelectors = [
      'div[role="textbox"][data-lexical-editor="true"]',
      'div[role="textbox"][aria-label*="Bình luận"]',
      'div[role="textbox"][aria-label*="Comment"]',
      'div[role="textbox"][aria-label*="như"]',
      'div.notranslate[contenteditable="true"]',
      'div._5rpu[contenteditable="true"]',
      'div[data-editor][contenteditable="true"]',
      'div[contenteditable="true"]'
    ];

    // STAGE 1: Passive Probe (Passive Synchrony)
    let input = this.findInput(root, inputSelectors);

    if (input) {
      this.sendLog(`Active ${mode} terminal detected. Synchronizing...`, "success");
    } else {
      this.sendLog(`Terminal missing in ${mode} mode. Initiating Force Entry...`, "warning");
      let commentBtn = anchoredBtn;
      
      if (!commentBtn) {
        this.sendLog("Scanning for interaction triggers...", "info");
        
        // 1. Structural Match (Facebook Standard)
        commentBtn = root.querySelector('div[aria-label="Viết bình luận"][role="button"]') ||
                     root.querySelector('div[aria-label="Bình luận"][role="button"]') ||
                     root.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
                     root.querySelector('div[data-testid*="comment_button"]') ||
                     root.querySelector('div[aria-label*="Bình luận dưới dạng"]');

        // 2. Toolbar/Interaction Bar (Positional)
        if (!commentBtn) {
          const bar = root.querySelector('div[role="toolbar"], div[aria-label*="Hành động"], div[aria-label*="Actions"]');
          if (bar) {
            const btns = Array.from(bar.querySelectorAll('div[role="button"], div[aria-label]'));
            if (btns.length >= 2) commentBtn = btns[1]; 
          }
        }

        // 3. Visual Sprite/Icon Lock (High Priority for Ads)
        if (!commentBtn) {
          const icon = root.querySelector('i[style*="-487px"]') || 
                       root.querySelector('i[class*="comment"]');
          if (icon) commentBtn = icon.closest('div[role="button"]') || icon.closest('div[aria-label]') || icon.parentElement;
        }

        // 4. Lexical Search (Deep Text Scan)
        if (!commentBtn) {
          const allElements = Array.from(root.querySelectorAll('div, span, a'));
          commentBtn = allElements.find(el => {
            const text = (el.getAttribute('aria-label') || el.innerText || "").trim();
            return (text === "Bình luận" || text === "Viết bình luận" || text === "Comment") && el.offsetWidth > 0;
          });
        }
      }

      if (commentBtn) {
        // Visual Validation: Ensure the button is actually inside the root's visual range
        const btnRect = commentBtn.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const isInside = btnRect.top >= rootRect.top - 50 && btnRect.bottom <= rootRect.bottom + 100;
        
        if (!isInside) {
          this.sendLog("Target mismatch: Discovered trigger is outside tactical zone. Aborting to prevent friendly fire.", "error");
          return false;
        }

        this.sendLog("Target locked. Dispatching opening signal...", "success");
        commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        if (typeof commentBtn.click === 'function') commentBtn.click();
        ['mousedown', 'mouseup', 'click'].forEach(type => {
          commentBtn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });

        this.sendLog("Signal sent. Awaiting terminal initialization...", "info");
        
        for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise(r => setTimeout(r, 500));
            input = this.findInput(root, inputSelectors);
            if (input) {
                this.sendLog(`Terminal synchronized on attempt ${attempt + 1}.`, "success");
                break;
            }
        }
      }
    }

    if (!input) {
        this.sendLog("Infiltration failed: Terminal unreachable. (No Lexical Editor found)", "error");
        return false;
    }

    const { stealthLevel = 'standard' } = await chrome.storage.local.get('stealthLevel');
    const config = this.getStealthConfig(stealthLevel);

    input.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    await new Promise(r => setTimeout(r, 100));

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (Math.random() < config.errorRate) {
        const typo = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        this.dispatchKey(input, typo);
        await new Promise(r => setTimeout(r, config.minDelay));
        this.dispatchKey(input, 'Backspace');
      }
      this.dispatchKey(input, char);
      await new Promise(r => setTimeout(r, config.minDelay + Math.random() * (config.maxDelay - config.minDelay)));
    }

    if (autoSubmit) {
      await new Promise(r => setTimeout(r, 800));
      const submitBtn = this.findSubmitButton(root);
      if (submitBtn) submitBtn.click();
      else {
          this.dispatchKey(input, 'Enter');
      }

      // FEED Mode: Auto-dismiss popup after successful injection
      if (mode === 'FEED') {
          this.sendLog("Deployment confirmed. Initiating automatic extraction...", "info");
          setTimeout(() => this.closePopup(), 2000);
      }
    }
    return true;
  }

  closePopup() {
    const closeBtn = document.querySelector('div[role="dialog"] div[aria-label="Đóng"]') || 
                     document.querySelector('div[role="dialog"] div[aria-label="Close"]') ||
                     document.querySelector('div[aria-label="Đóng bài viết"]');
    if (closeBtn) {
        this.sendLog("Tactical popup dismissed. Workspace cleared.", "success");
        closeBtn.click();
    }
  }

  findInput(root, selectors) {
    // 1. Search within the post container (Passive Scan)
    for (const s of selectors) {
      const el = root.querySelector(s);
      if (el) return el;
    }

    // 2. Focused Element Check (Active Signal Trace)
    const active = document.activeElement;
    if (active && (active.getAttribute?.('role') === 'textbox' || active.hasAttribute?.('contenteditable'))) {
        const rootRect = root.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const verticalMatch = activeRect.top > rootRect.top - 200 && activeRect.top < rootRect.bottom + 600;
        const horizontalMatch = Math.abs(activeRect.left - rootRect.left) < 800;
        if (verticalMatch && horizontalMatch) return active;
    }

    // 3. Heuristic Proximity Search (Geometric Triangulation)
    const allEditors = Array.from(document.querySelectorAll(selectors.join(',')));
    if (allEditors.length === 0) {
        document.querySelectorAll('div[role="textbox"]').forEach(el => {
            if (!allEditors.includes(el)) allEditors.push(el);
        });
    }

    if (allEditors.length === 0) return document.querySelector('div[data-lexical-editor="true"]');

    const postRect = root.getBoundingClientRect();
    const postBottom = postRect.bottom;

    // Filter candidates to ensure they are visually related to THIS post
    const candidates = allEditors.filter(el => {
        const r = el.getBoundingClientRect();
        // 1. Vertical Safety: Editor must not be above the post's top (prevents matching post above)
        const isNotAbove = r.top > postRect.top - 50;
        // 2. Horizontal Safety: Editor must have some horizontal overlap with the post
        const horizontalOverlap = !(r.right < postRect.left || r.left > postRect.right);
        // 3. Proximity: Must be within a reasonable range
        const isNear = Math.abs(r.top - postBottom) < 800;
        
        return isNotAbove && (horizontalOverlap || isNear);
    });

    if (candidates.length === 0) return null;

    const bestEditor = candidates.sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        
        // Weight vertical proximity to post bottom more heavily
        const aDist = Math.abs(aRect.top - postBottom) + (Math.abs(aRect.left - postRect.left) * 2);
        const bDist = Math.abs(bRect.top - postBottom) + (Math.abs(bRect.left - postRect.left) * 2);
        
        return aDist - bDist;
    })[0];

    return bestEditor;
  }

  findSubmitButton(post) {
    const selectors = ['div[aria-label="Đăng bình luận"]', 'div[aria-label="Post comment"]', 'div[aria-label="Đăng"]', 'div[aria-label="Send"]'];
    for (const s of selectors) {
      const btn = post.querySelector(s) || document.querySelector(s);
      if (btn && !btn.hasAttribute('aria-disabled')) return btn;
    }
    return null;
  }

  getStealthConfig(level) {
    const presets = {
      'fast': { minDelay: 5, maxDelay: 15, errorRate: 0.002 },
      'standard': { minDelay: 30, maxDelay: 80, errorRate: 0.01 },
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
        el.focus();
        document.execCommand('delete', false);
    } else if (isEnter) {
        el.dispatchEvent(new KeyboardEvent('keypress', opts));
    } else {
        el.focus();
        document.execCommand('insertText', false, char);
    }
    
    el.dispatchEvent(new KeyboardEvent('keyup', opts));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  sendLog(message, status) {
    chrome.runtime.sendMessage({ type: "LOG_EVENT", text: `[FIELD] ${message}`, status: status }).catch(() => { });
  }
}
