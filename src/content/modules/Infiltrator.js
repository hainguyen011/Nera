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
    const posts = document.querySelectorAll('div[data-testid="fbfeed_story"], [role="article"], div[data-ad-preview="message"]');
    posts.forEach(post => this.injectNeraControl(post));
  }

  checkNode(node) {
    const postSelectors = ['div[data-testid="fbfeed_story"]', '[role="article"]', 'div[data-ad-preview="message"]'];
    if (node.matches && postSelectors.some(s => node.matches(s))) {
      this.injectNeraControl(node);
    } else {
      const posts = node.querySelectorAll(postSelectors.join(','));
      posts.forEach(post => this.injectNeraControl(post));
    }
  }

  injectNeraControl(post) {
    if (post.dataset.neraInfiltrated) return;
    
    // Basic safety check: ensure it's not a tiny element
    if (post.offsetWidth < 100 || post.offsetHeight < 50) return;
    
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
        mainBtn.innerHTML = `<span>Synthesize</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
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
    post.appendChild(container);
    
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

  async executeGhostTyping(post, text, autoSubmit = false, anchoredBtn = null) {
    const inputSelectors = [
      'div[role="textbox"][data-lexical-editor="true"]',
      'div[role="textbox"][aria-label*="Bình luận"]',
      'div[role="textbox"][aria-label*="Comment"]',
      'div[contenteditable="true"]'
    ];

    let input = this.findInput(post, inputSelectors);

    if (!input) {
      this.sendLog("Terminal missing. Initiating Force Entry protocol...", "warning");
      let commentBtn = anchoredBtn;
      
      if (!commentBtn) {
        this.sendLog("Scanning local container for interaction triggers...", "info");
        // 1. Precise Match (Based on user's HTML snippet)
        commentBtn = post.querySelector('div[aria-label="Viết bình luận"][role="button"]') ||
                     post.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
                     post.querySelector('i[style*="background-position: 0px -487px"]')?.closest('div[role="button"]');

        // 2. Proximity Search inside Post (More elements)
        if (!commentBtn) {
          const allButtons = Array.from(post.querySelectorAll('div[role="button"]'));
          this.sendLog(`Scanned ${allButtons.length} buttons in post container.`, "info");
          commentBtn = allButtons.find(b => {
            const label = b.getAttribute('aria-label') || "";
            return label === "Viết bình luận" || label === "Bình luận" || label.includes("Comment");
          });
        }

        // 3. Global Proximity Search (Final Fallback)
        if (!commentBtn) {
           this.sendLog("Local scan failed. Engaging Omni-Search (Global)...", "warning");
           const allGlobalButtons = Array.from(document.querySelectorAll('div[role="button"], div[aria-label*="Bình luận"]'));
           const postRect = post.getBoundingClientRect();
           const postBottom = postRect.bottom;
           
           this.sendLog(`Evaluating ${allGlobalButtons.length} global candidates near Y:${postBottom.toFixed(0)}`, "info");
           
           // Find buttons near the bottom of the post
           const candidates = allGlobalButtons.filter(b => {
               const r = b.getBoundingClientRect();
               const verticalDist = Math.abs(r.top - postBottom);
               const horizontalDist = Math.abs(r.left - postRect.left);
               return verticalDist < 300 && horizontalDist < 600;
           });

           this.sendLog(`Found ${candidates.length} candidates in proximity zone.`, "info");

           commentBtn = candidates.find(b => {
                const label = b.getAttribute('aria-label') || b.innerText || "";
                return label.includes("Bình luận") || label.includes("Comment") || label.includes("Viết bình luận");
           });
        }

        // 4. Brute Force Sprite Search (The 'Nuclear' Option)
        if (!commentBtn) {
            this.sendLog("Heuristic search failed. Engaging Brute Force Sprite Lock...", "warning");
            const sprites = Array.from(document.querySelectorAll('i[style*="background-position: 0px -487px"]'));
            const postRect = post.getBoundingClientRect();
            
            // Find the sprite closest to this post's interaction bar area
            let bestSprite = null;
            let minDist = Infinity;
            
            sprites.forEach(s => {
                const r = s.getBoundingClientRect();
                // Priority: Sprite MUST be vertically near the post
                const verticalOverlap = r.top > postRect.top && r.top < (postRect.bottom + 100);
                if (verticalOverlap) {
                    const dist = Math.abs(r.top - (postRect.bottom - 50)); // Interaction bar is usually ~50px from bottom
                    if (dist < minDist) {
                        minDist = dist;
                        bestSprite = s;
                    }
                }
            });

            if (bestSprite) {
                commentBtn = bestSprite.closest('div[role="button"]');
                if (commentBtn) this.sendLog("Sprite lock established on precision coordinates.", "success");
            }
        }
      }

      if (commentBtn) {
        this.sendLog("Target locked. Dispatching opening signal...", "success");
        commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Native Click Fallback
        if (typeof commentBtn.click === 'function') commentBtn.click();

        const events = ['mousedown', 'mouseup', 'click'];
        events.forEach(type => {
          commentBtn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
        });

        this.sendLog("Signal sent. Awaiting terminal initialization (Max 5s)...", "info");
        
        // Polling Mechanism: Scan every 500ms for up to 5 seconds
        for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise(r => setTimeout(r, 500));
            input = this.findInput(post, inputSelectors);
            if (input) {
                this.sendLog(`Terminal established on attempt ${attempt + 1}.`, "success");
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
    // Lexical-safe Clear Sequence (Legacy Pattern)
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    await new Promise(r => setTimeout(r, 100)); // Stabilization wait

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
      const submitBtn = this.findSubmitButton(post);
      if (submitBtn) submitBtn.click();
      else {
          // Fallback: Dispatch Enter key
          this.dispatchKey(input, 'Enter');
      }
    }
    return true;
  }

  findInput(root, selectors) {
    // 1. Search within the post container (Include recursive search for generic textboxes)
    for (const s of selectors) {
      const el = root.querySelector(s);
      if (el) return el;
    }

    // Proximity search for ANY div with role="textbox" or contenteditable inside the root
    const localInput = root.querySelector('div[role="textbox"]') || root.querySelector('div[contenteditable="true"]');
    if (localInput) return localInput;

    // 2. Global Search: Facebook often portals the editor outside the post article
    const allEditors = Array.from(document.querySelectorAll(selectors.join(',')));
    
    // Add generic textboxes to global search if no specific ones found
    if (allEditors.length === 0) {
        document.querySelectorAll('div[role="textbox"]').forEach(el => allEditors.push(el));
    }

    if (allEditors.length === 0) return document.querySelector('div[data-lexical-editor="true"]');

    // Return the one closest to the current post visually
    const postRect = root.getBoundingClientRect();
    const postCenter = postRect.top + postRect.height / 2;

    return allEditors.sort((a, b) => {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        const aCenter = aRect.top + aRect.height/2;
        const bCenter = bRect.top + bRect.height/2;
        return Math.abs(aCenter - postCenter) - Math.abs(bCenter - postCenter);
    })[0];
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
