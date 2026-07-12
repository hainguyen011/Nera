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
    this.globalStealthLevel = 'standard';
    this.autopilotActive = false;
    this.autopilotProcessing = false;
    this.init();
  }

  async init() {
    console.log("[NERA] Infiltration Agent active. Scanning targets...");
    
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        // Initial config load
        const result = await chrome.storage.local.get(['persona', 'stealthLevel', 'autopilotActive']);
        if (result.persona) this.globalPersona = result.persona;
        if (result.stealthLevel) this.globalStealthLevel = result.stealthLevel;
        this.autopilotActive = !!result.autopilotActive;

        // Listen for config changes
        chrome.storage.onChanged.addListener((changes) => {
          if (changes.persona) this.globalPersona = changes.persona.newValue;
          if (changes.stealthLevel) this.globalStealthLevel = changes.stealthLevel.newValue;
          if (changes.autopilotActive) {
            this.autopilotActive = !!changes.autopilotActive.newValue;
            if (this.autopilotActive) {
              document.querySelectorAll('[data-nera-autopilot-processed="true"]').forEach(el => {
                delete el.dataset.neraAutopilotProcessed;
              });
              this.startAutopilotLoop();
            }
          }
        });
      }
    } catch (e) {
      console.warn("[NERA] Storage context lost.", e);
    }

    this.setupObserver();
    this.scanExisting();

    // Tactical Pulse: Periodic deep scan for late-rendering posts or missed targets
    setInterval(() => this.scanExisting(), 3000);

    if (this.autopilotActive) {
      this.startAutopilotLoop();
    }
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
      'div[data-pagelet*="FeedUnit"]',
      'div[data-pagelet*="GroupFeed"]',
      'div[data-pagelet*="Biz"]',
      'div[role="dialog"] [role="article"]',
      'div[role="dialog"]'
    ];
    
    // 1. Direct Selector Scan
    const directPosts = document.querySelectorAll(postSelectors.join(','));
    directPosts.forEach(post => this.injectNeraControl(post));
 
    // 2. Discovery by Interaction (Class-independent failsafe)
    const triggers = document.querySelectorAll('div[role="toolbar"], div[aria-label*="Hành động"], div[aria-label*="Actions"], i[style*="-487px"], div[data-ad-rendering-role="comment_button"]');
    triggers.forEach(t => {
      try {
        let parent = t.parentElement;
        let post = null;
        for (let i = 0; i < 12 && parent && parent !== document.body; i++) {
          const hasHeader = parent.querySelector('h2, h3, h4, [data-ad-rendering-role="profile_name"]');
          const isArticle = parent.getAttribute('role') === 'article' || parent.tagName === 'ARTICLE';
          const hasPagelet = parent.hasAttribute('data-pagelet');
          
          if (hasHeader || isArticle || hasPagelet) {
            post = parent;
            break; // Stop immediately at the closest post container
          }
          parent = parent.parentElement;
        }
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
        'div[data-pagelet*="FeedUnit"]',
        'div[data-pagelet*="GroupFeed"]',
        'div[data-pagelet*="Biz"]',
        'div[role="dialog"] [role="article"]',
        'div[role="dialog"]'
      ];
      
      if (node.matches && postSelectors.some(s => node.matches(s))) {
        this.injectNeraControl(node);
      } else {
        const posts = node.querySelectorAll(postSelectors.join(','));
        posts.forEach(post => this.injectNeraControl(post));
      }

      // Interaction-based failsafe for dynamically added nodes
      const nodeTriggers = node.querySelectorAll ? node.querySelectorAll('div[role="toolbar"], div[aria-label*="Hành động"], div[aria-label*="Actions"], i[style*="-487px"], div[data-ad-rendering-role="comment_button"]') : [];
      nodeTriggers.forEach(t => {
        try {
          let parent = t.parentElement;
          let post = null;
          for (let i = 0; i < 12 && parent && parent !== document.body; i++) {
            const hasHeader = parent.querySelector('h2, h3, h4, [data-ad-rendering-role="profile_name"]');
            const isArticle = parent.getAttribute('role') === 'article' || parent.tagName === 'ARTICLE';
            const hasPagelet = parent.hasAttribute('data-pagelet');
            
            if (hasHeader || isArticle || hasPagelet) {
              post = parent;
              break; // Stop immediately at the closest post container
            }
            parent = parent.parentElement;
          }
          if (post) this.injectNeraControl(post);
        } catch (e) { }
      });
    } catch (e) { /* Silent fail */ }
  }

  /**
   * Hydration Guard: Check if the node has enough context to be infiltrated
   */
  isNodeReady(node) {
    // 1. Basic visibility check
    if (node.offsetWidth === 0 && node.offsetHeight === 0) return false;

    // 2. Ultra-Lenient Content Heuristic
    // If it has a reasonable amount of text, or media, or a message block, it's ready.
    const hasText = (node.innerText && node.innerText.trim().length > 15);
    const hasMedia = node.querySelector('img, video, iframe');
    const hasStructure = node.querySelector('h2, h3, [role="link"], [data-ad-comet-preview="message"]');
    
    return hasText || hasMedia || hasStructure;
  }

  injectNeraControl(post) {
    if (post.dataset.neraInfiltrated) return;
    
    // Safety check: skip elements that are obviously not posts (like very small buttons)
    if (post.offsetWidth < 50 || post.offsetHeight < 50) return;

    // Hydration Guard: Wait for content to load before claiming this node
    if (!this.isNodeReady(post)) {
        return;
    }

    // Mode Detection: Is this a Post or a Comment?
    const ariaLabel = post.getAttribute('aria-label') || "";
    const isComment = !!(
      ariaLabel.toLowerCase().includes('bình luận') || 
      ariaLabel.toLowerCase().includes('comment') || 
      post.closest('[data-commentid]') || 
      post.closest('[data-comment-id]') ||
      post.hasAttribute('data-commentid') ||
      post.hasAttribute('data-comment-id')
    );
    
    const mode = isComment ? 'COMMENT' : 'POST';

    // Check if any ancestor of the SAME mode is already infiltrated
    let ancestor = post.parentElement;
    while (ancestor && ancestor !== document.body) {
      if (ancestor.dataset && ancestor.dataset.neraInfiltrated === 'true' && ancestor.dataset.neraMode === mode) {
        return;
      }
      ancestor = ancestor.parentElement;
    }

    // Check if any descendant of the SAME mode is already infiltrated
    if (post.querySelector(`.nera-control.mode-${mode.toLowerCase()}`)) {
      return;
    }

    post.dataset.neraInfiltrated = 'true';
    post.dataset.neraMode = mode;

    const container = document.createElement('div');
    container.className = `nera-control mode-${mode.toLowerCase()}`;
    const shadow = container.attachShadow({ mode: 'open' });

    // Inject Styles
    this.NeraStyles.inject(shadow);

    const consoleEl = document.createElement('div');
    consoleEl.className = 'tactical-console'; // Starts minified by default
    
    let selectedIntent = "agree";
    let selectedPersona = this.globalPersona;

    consoleEl.innerHTML = this.NeraTemplates.getConsoleHTML(selectedPersona, selectedIntent, mode);

    // Toggle Logic
    const toggleFunc = (e) => {
      e.stopPropagation();
      const isExpanded = consoleEl.classList.toggle('expanded');
      
      // Dynamic Stacking Priority: Bring the entire post and its parents to front
      if (isExpanded) {
          this.elevateStacking(post, true);
          container.style.setProperty('z-index', '2147483647', 'important');
          this.fixAncestors(container); 
      } else {
          this.elevateStacking(post, false); // Revert to safe base priority
          container.style.setProperty('z-index', '2147483647', 'important');
          
          // Restore standard badges display for manual mode
          const standardIntents = ['agree', 'expand', 'question', 'humor', 'thanks', 'challenge', 'disagree', 'tease', 'empathize', 'ask', 'confirm', 'cta', 'suggest'];
          shadow.querySelectorAll('.intent-mini').forEach(el => {
            if (standardIntents.includes(el.dataset.intent)) {
              el.style.display = '';
            }
          });
      }

      this.sendLog(isExpanded ? "Console Expanded: High-Fidelity Mode" : "Console Minified: Stealth Mode", "info");
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
        try {
          chrome.storage.local.set({ persona: selectedPersona });
        } catch (e) { /* Storage might be throttled or disconnected */ }
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

    // Expose runAISuggest function to consoleEl for Autopilot to use synchronously
    consoleEl.runAISuggest = async () => {
      const mini = consoleEl.querySelector('.intent-mini[data-intent="suggest"]');
      if (!mini) return [];

      const originalText = mini.innerText;
      mini.innerText = "Scanning...";
      mini.style.opacity = "0.7";
      mini.style.pointerEvents = "none";

      // Clean old custom intents
      const standardIntents = ['agree', 'expand', 'question', 'humor', 'thanks', 'challenge', 'disagree', 'tease', 'empathize', 'ask', 'confirm', 'cta', 'suggest'];
      consoleEl.querySelectorAll('.intent-mini').forEach(el => {
        if (!standardIntents.includes(el.dataset.intent)) {
          el.remove();
        }
      });

      return new Promise((resolve) => {
        this.safeSendMessage({
          type: "SUGGEST_INTENTS",
          content: post.innerText.substring(0, 1000)
        }, (response) => {
          mini.innerText = originalText;
          mini.style.opacity = "1";
          mini.style.pointerEvents = "auto";

          if (response && response.success && response.intents) {
            const customIntents = [];
            response.intents.forEach(text => {
              const newIntent = document.createElement('div');
              newIntent.className = 'intent-mini';
              newIntent.dataset.intent = text.toLowerCase();
              newIntent.innerText = text;
              attachIntentLogic(newIntent);
              mini.parentNode.insertBefore(newIntent, mini);
              customIntents.push(newIntent);

              // Highlight recommended option
              if (response.recommended && text.toLowerCase() === response.recommended.toLowerCase()) {
                newIntent.style.border = "1px solid #00e676";
                newIntent.style.boxShadow = "0 0 8px rgba(0, 230, 118, 0.4)";
              }
            });
            this.sendLog("AI suggested new tactical paths.", "success");
            resolve(customIntents);
          } else {
            resolve([]);
          }
        });
      });
    };

    const intentMinis = consoleEl.querySelectorAll('.intent-mini');
    intentMinis.forEach(mini => {
      if (mini.dataset.intent === 'suggest') {
        mini.onclick = (e) => {
          e.stopPropagation();
          consoleEl.runAISuggest();
        };
      } else {
        attachIntentLogic(mini);
      }
    });

    if (mainBtn) {
      mainBtn.onclick = (e) => {
        e.stopPropagation();
        chrome.storage.local.get('autoSubmit', (res) => {
          const autoSubmit = res.autoSubmit !== false; // Default to true
          if (mainBtn.dataset.state === 'ready') {
            this.executeDeployment(post, editor.innerText, mainBtn, anchoredBtn, autoSubmit);
          } else {
            const userHint = editor.innerText.trim();
            this.synthesizePayload(post, selectedIntent, selectedPersona, mainBtn, null, editor, footer, anchoredBtn, userHint);
          }
        });
      };
    }


    shadow.appendChild(consoleEl);
    
    // Strategic Placement: In Lightbox/Dialog, try to anchor to the header area specifically
    const headerArea = post.querySelector('div[role="heading"]') || 
                       post.querySelector('div.x1cy8z3s') ||
                       post.querySelector('div.x193iq5w');
    
    if (headerArea && post.closest('[role="dialog"]')) {
        headerArea.style.setProperty('position', 'relative', 'important');
        headerArea.prepend(container);
    } else {
        post.style.setProperty('position', 'relative', 'important');
        post.style.setProperty('z-index', '1000', 'important'); // Base priority elevated
        post.prepend(container);
    }
    
    // Overflow Bypass Protocol: Aggressively clear path to top
    post.dataset.neraInfiltrated = "true";
    this.fixAncestors(post);
    if (mode === 'COMMENT') this.fixAncestors(container); // Extra safety for comments

    this.sendLog("Tactical Console ready for input.", "success");
  }

  /**
   * Climb up DOM and force overflow visibility to prevent clipping
   */
  elevateStacking(el, active) {
    let parent = el;
    let depth = 0;
    // Elevate up to 12 levels to clear all potential FB stacking contexts
    while (parent && parent !== document.body && depth < 12) {
      if (active) {
        // Store original values if not already stored
        if (!parent.dataset.neraOrigZ) {
          parent.dataset.neraOrigZ = parent.style.zIndex || 'auto';
          parent.dataset.neraOrigIso = parent.style.isolation || 'auto';
        }
        parent.style.setProperty('z-index', '2147483647', 'important');
        parent.style.setProperty('isolation', 'auto', 'important');
      } else {
        // Revert to original
        if (parent.dataset.neraOrigZ) {
          parent.style.zIndex = parent.dataset.neraOrigZ === 'auto' ? '' : parent.dataset.neraOrigZ;
          parent.style.isolation = parent.dataset.neraOrigIso === 'auto' ? '' : parent.dataset.neraOrigIso;
          delete parent.dataset.neraOrigZ;
          delete parent.dataset.neraOrigIso;
        }
        // Apply a safe base z-index for the trigger button
        if (depth === 0) parent.style.setProperty('z-index', '1000', 'important');
      }
      parent = parent.parentElement;
      depth++;
    }
  }

  fixAncestors(el) {
    let parent = el.parentElement;
    let depth = 0;
    // Surgical Depth: 8 levels is usually enough to clear the immediate feed item clipping
    while (parent && parent !== document.body && depth < 8) {
      const style = window.getComputedStyle(parent);
      
      // Only fix if it's actually clipping or creating a new stacking context that traps us
      const hasOverflow = style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowY === 'hidden';
      const hasIsolation = style.isolation === 'isolate';
      const hasContain = style.contain !== 'none' && style.contain !== 'auto';

      if (hasOverflow || hasIsolation || hasContain) {
        parent.style.setProperty('overflow', 'visible', 'important');
        parent.style.setProperty('contain', 'none', 'important');
        parent.style.setProperty('isolation', 'auto', 'important');
      }
      
      parent = parent.parentElement;
      depth++;
    }
  }

  synthesizePayload(post, intent, persona, btn, box, editor, footer, anchoredBtn, userHint = "") {
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = `<span class="nera-spinner"></span> Synthesizing...`;
    
    // Advanced Context Extraction using DataMiner
    const mode = btn.getRootNode().host.classList.contains('mode-comment') ? 'COMMENT' : 'POST';
    const postData = this.NeraDataMiner.extract(post, mode);
    
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
      CONTEXT: Facebook Engagement (${postData.mode})
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


  async executeDeployment(post, text, btn, anchoredBtn, autoSubmit = true) {
    btn.disabled = true;
    btn.innerHTML = `<span class="nera-spinner"></span> Deploying...`;
    const success = await this.executeGhostTyping(post, text, autoSubmit, anchoredBtn, btn);
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

  async executeGhostTyping(post, text, autoSubmit = false, anchoredBtn = null, btn = null) {
    const host = btn?.getRootNode()?.host;
    const isInCommentMode = host?.classList.contains('mode-comment') || false;
    const inputSelectors = [
      'div[role="textbox"][data-lexical-editor="true"][aria-label*="Trả lời"]',
      'div[role="textbox"][data-lexical-editor="true"][aria-label*="Reply"]',
      'div[role="textbox"][data-lexical-editor="true"]',
      'div[role="textbox"][aria-label*="Bình luận"]',
      'div[role="textbox"][aria-placeholder*="Trả lời"]',
      'div[role="textbox"][aria-label*="như"]',
      'div.notranslate[contenteditable="true"]'
    ];

    let input = null;

    if (isInCommentMode) {
      input = await this.executeReplyFlow(post, inputSelectors, anchoredBtn);
    } else {
      input = await this.executePostFlow(post, inputSelectors, anchoredBtn);
    }

    if (!input) {
      this.sendLog("Infiltration failed: Terminal unreachable.", "error");
      return false;
    }

    // STAGE 3: Ghost Typing Execution
    let stealthLevel = 'standard';
    try {
      const res = await chrome.storage.local.get('stealthLevel');
      if (res.stealthLevel) stealthLevel = res.stealthLevel;
    } catch (e) {}

    const config = this.getStealthConfig(stealthLevel);

    input.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    await new Promise(r => setTimeout(r, 200));

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

    // STAGE 4: Tactical Launch
    if (autoSubmit) {
      this.sendLog("Payload delivered. Executing Launch...", "success");
      await new Promise(r => setTimeout(r, 800));
      
      let submitBtn = input.closest('form')?.querySelector('div[role="button"][aria-label*="Đăng"], div[role="button"][aria-label*="Post"]') ||
                      input.parentElement?.parentElement?.parentElement?.querySelector('div[role="button"][aria-label*="Đăng"]');

      if (!submitBtn) {
        submitBtn = this.findSubmitButton(input.closest('div[role="article"]') || post);
      }

      if (submitBtn) {
        submitBtn.click();
      } else {
        const enterOpts = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 };
        input.dispatchEvent(new KeyboardEvent('keydown', enterOpts));
        input.dispatchEvent(new KeyboardEvent('keypress', enterOpts));
      }
    }

    if (this.getCurrentMode() === 'FEED' && !isInCommentMode) {
      setTimeout(() => this.closePopup(), 2000);
    }
    return true;
  }

  async executeReplyFlow(post, selectors, anchoredBtn) {
    this.sendLog("[REPLY] Initiating Strict Protocol: Identifying target reply trigger...", "info");
    
    // Always attempt to find the reply button first
    let replyBtn = anchoredBtn || 
                   post.querySelector('[aria-label*="Trả lời"], [aria-label*="Reply"]') ||
                   Array.from(post.querySelectorAll('div[role="button"], span, a')).find(el => {
                     const t = (el.getAttribute('aria-label') || el.innerText || "").trim();
                     return (t === 'Trả lời' || t === 'Reply' || t.includes('phản hồi')) && el.offsetWidth > 0;
                   });

    if (replyBtn) {
      // Record existing editors to detect the new one
      const existingEditors = new Set(Array.from(document.querySelectorAll(selectors.join(','))));
      
      this.sendLog("[REPLY] Step 1: Triggering Reply interaction...", "info");
      replyBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Clear focus to detect focus-shift
      if (document.activeElement) document.activeElement.blur();

      const events = ['mousedown', 'mouseup', 'click'];
      events.forEach(type => {
        replyBtn.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      });
      if (typeof replyBtn.click === 'function') replyBtn.click();
      
      this.sendLog("[REPLY] Step 2: Waiting for sub-terminal to mount...", "info");
      
      // Wait for behavioral changes (New element or Focus shift)
      let input = null;
      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise(r => setTimeout(r, 400));
        
        // 1. Check for Active Element (Focus shift) - High Priority
        const active = document.activeElement;
        if (active && (active.getAttribute('role') === 'textbox' || active.hasAttribute('contenteditable'))) {
            input = active;
            this.sendLog("[REPLY] Step 3: Terminal identified via Focus-Shift.", "success");
            break;
        }

        // 2. Check for New Editors (Structural change)
        const currentEditors = Array.from(document.querySelectorAll(selectors.join(',')));
        const newEditor = currentEditors.find(e => !existingEditors.has(e));
        if (newEditor) {
            input = newEditor;
            this.sendLog("[REPLY] Step 3: Terminal identified via DOM Mutation.", "success");
            break;
        }

        // 3. Proximity Fallback (Geometric Triangulation)
        const nearby = this.findInputNear(post, selectors);
        if (nearby && !existingEditors.has(nearby)) {
            input = nearby;
            this.sendLog("[REPLY] Step 3: Terminal identified via Geometric Proximity.", "success");
            break;
        }
      }

      if (input) {
          this.sendLog("[REPLY] Step 4: Synchronizing target for Ghost Typing...", "info");
          input.focus();
          await new Promise(r => setTimeout(r, 200));
          // Clear drafts/mentions
          document.execCommand('selectAll', false, null);
          document.execCommand('delete', false, null);
          return input;
      }
    }
    
    return this.findInputNear(post, selectors);
  }

  /**
   * Specialized search for inputs near a target element with indentation support
   */
  findInputNear(target, selectors) {
    const rect = target.getBoundingClientRect();
    const allEditors = Array.from(document.querySelectorAll(selectors.join(',')));
    
    // Weight candidates by location: Below target AND indented (further right)
    const candidates = allEditors.filter(el => {
      const r = el.getBoundingClientRect();
      const isBelow = r.top > rect.top - 10;
      const isIndented = r.left > rect.left;
      const isNear = Math.abs(r.top - rect.bottom) < 500;
      return isBelow && isNear;
    });

    if (candidates.length === 0) {
      // Relaxed search if no indented found
      return allEditors.filter(el => {
        const r = el.getBoundingClientRect();
        return r.top > rect.top - 50 && r.top < rect.bottom + 500 && Math.abs(r.left - rect.left) < 500;
      }).sort((a, b) => {
        const distA = Math.abs(a.getBoundingClientRect().top - rect.bottom);
        const distB = Math.abs(b.getBoundingClientRect().top - rect.bottom);
        return distA - distB;
      })[0];
    }

    return candidates.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      // Prioritize the one closest to the bottom of the target
      return Math.abs(aRect.top - rect.bottom) - Math.abs(bRect.top - rect.bottom);
    })[0];
  }

  async executePostFlow(post, selectors, anchoredBtn) {
    this.sendLog("[POST] Engagement Protocol: Locating main terminal...", "info");
    
    // Find root for post context
    let root = post;
    for (let i = 0; i < 8; i++) {
      if (root.querySelector('div[role="toolbar"], div[aria-label*="Hành động"], div[aria-label*="Actions"]')) break;
      if (root.parentElement && root.parentElement !== document.body) root = root.parentElement;
      else break;
    }

    let input = this.findInput(root, selectors);
    
    if (!input) {
      this.sendLog("[POST] Terminal hidden. Dispatching interaction signal...", "warning");
      let commentBtn = anchoredBtn || 
                       root.querySelector('div[aria-label="Viết bình luận"][role="button"]') ||
                       root.querySelector('div[aria-label="Bình luận"][role="button"]') ||
                       root.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
                       root.querySelector('div[data-testid*="comment_button"]');

      if (commentBtn) {
        commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentBtn.click();
        
        for (let attempt = 0; attempt < 10; attempt++) {
          await new Promise(r => setTimeout(r, 500));
          input = this.findInput(root, selectors);
          if (input) return input;
        }
      }
    }
    return input;
  }

  /**
   * New specialized search for inputs near a target element
   */
  findInputNear(target, selectors) {
    // 1. Check inside target subtree
    for (const s of selectors) {
      const el = target.querySelector(s);
      if (el) return el;
    }

    // 2. Check nearby siblings or immediate parent container
    const parent = target.parentElement;
    if (parent) {
      for (const s of selectors) {
        const el = parent.querySelector(s);
        if (el) return el;
      }
    }

    // 3. Proximity-based global search
    const rect = target.getBoundingClientRect();
    const allEditors = Array.from(document.querySelectorAll(selectors.join(',')));
    
    const candidates = allEditors.filter(el => {
      const r = el.getBoundingClientRect();
      // Editor should be below or very close to the target
      return r.top > rect.top - 50 && r.top < rect.bottom + 500 && Math.abs(r.left - rect.left) < 500;
    });

    return candidates.sort((a, b) => {
      const distA = Math.abs(a.getBoundingClientRect().top - rect.bottom);
      const distB = Math.abs(b.getBoundingClientRect().top - rect.bottom);
      return distA - distB;
    })[0];
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
    const selectors = [
      '#focused-state-composer-submit div[role="button"]',
      'div[aria-label="Đăng bình luận"]', 
      'div[aria-label="Post comment"]', 
      'div[aria-label="Đăng"]', 
      'div[aria-label="Send"]',
      'div[role="button"][aria-label*="Đăng"]'
    ];
    
    // 1. Search in the post subtree
    for (const s of selectors) {
      const btn = post.querySelector(s);
      if (btn && !btn.hasAttribute('aria-disabled')) return btn;
    }

    // 2. Search globally near the active element (fallback for replies)
    for (const s of selectors) {
      const btn = document.querySelector(s);
      if (btn && !btn.hasAttribute('aria-disabled')) {
          const btnRect = btn.getBoundingClientRect();
          const postRect = post.getBoundingClientRect();
          // Verify proximity
          if (Math.abs(btnRect.top - postRect.bottom) < 1000) return btn;
      }
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

  safeSendMessage(message, callback) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            // Silently handle invalidated context
            return;
          }
          if (callback) callback(response);
        });
      } catch (e) {
        // Context invalidated or other runtime error
      }
    }
  }

  async startAutopilotLoop() {
    if (this.autopilotProcessing) return;
    this.autopilotProcessing = true;
    this.sendLog("Autopilot engine initialized. Preparing scanning loop...", "success");

    let scrollAttempts = 0;

    while (this.autopilotActive) {
      try {
        // Wait 1.5 seconds between loop iterations to prevent high CPU or UI locks
        await new Promise(r => setTimeout(r, 1500));

        if (!this.autopilotActive) break;

        const target = this.findNextAutopilotTarget();
        if (target) {
          scrollAttempts = 0;
          this.sendLog("Target identified. Engaging autopilot protocol...", "info");
          
          // 1. Mark target
          target.dataset.neraAutopilotProcessed = 'true';

          // 2. Scroll to target naturally
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          await new Promise(r => setTimeout(r, 2000)); // wait for scroll to finish
          
          if (!this.autopilotActive) break;

          // 3. Inject Nera Control if not present
          if (!target.dataset.neraInfiltrated) {
            this.injectNeraControl(target);
            await new Promise(r => setTimeout(r, 1000));
          }

          if (!this.autopilotActive) break;

          // 4. Retrieve console elements
          const container = target.querySelector('.nera-control');
          if (!container || !container.shadowRoot) {
            this.sendLog("Bypass warning: Control container missing.", "warning");
            continue;
          }

          const shadow = container.shadowRoot;
          const consoleEl = shadow.querySelector('.tactical-console');
          const trigger = shadow.querySelector('.nera-toggle-trigger');
          const closeBtn = shadow.querySelector('.nera-close-btn');
          const mainBtn = shadow.querySelector('#nera-main-action');
          const editor = shadow.querySelector('.payload-editor');
          const footer = shadow.querySelector('.console-footer');
          const suggestBtn = shadow.querySelector('.intent-mini[data-intent="suggest"]');

          if (!consoleEl || !trigger) {
            this.sendLog("Bypass warning: Console elements missing.", "warning");
            continue;
          }

          // 4a. Visually Expand the Board
          this.sendLog("Opening Nera Console...", "info");
          if (!consoleEl.classList.contains('expanded')) {
            trigger.click();
            await new Promise(r => setTimeout(r, 1200)); // Wait for expansion animation
          }

          if (!this.autopilotActive) break;

          // Hide standard intent badges visually in Autopilot mode (since AI is auto-generating)
          const standardIntents = ['agree', 'expand', 'question', 'humor', 'thanks', 'challenge', 'disagree', 'tease', 'empathize', 'ask', 'confirm', 'cta', 'suggest'];
          shadow.querySelectorAll('.intent-mini').forEach(el => {
            if (standardIntents.includes(el.dataset.intent)) {
              el.style.display = 'none';
            }
          });

          // 4b. AI dynamically decides and synthesizes optimal response
          this.sendLog("Autopilot: Analyzing post content & synthesizing optimal response...", "info");
          
          if (editor) {
            editor.innerText = "Auto...";
          }
          
          const anchoredBtn = target.querySelector('div[data-ad-rendering-role="comment_button"]')?.closest('div[role="button"]') ||
            target.querySelector('i[style*="background-position: 0px -487px"]')?.closest('div[role="button"]') ||
            target.querySelector('div[aria-label="Viết bình luận"]') ||
            target.querySelector('div[aria-label*="Bình luận"]') ||
            target.querySelector('div[aria-label*="Comment"]');
            
          this.synthesizePayload(target, "auto", this.globalPersona, mainBtn, null, editor, footer, anchoredBtn, "");

          // 5. Wait for Synthesis to become 'ready'
          let synthSuccess = false;
          for (let waitSec = 0; waitSec < 20; waitSec++) {
            await new Promise(r => setTimeout(r, 1000));
            if (!this.autopilotActive) break;
            if (mainBtn.dataset.state === 'ready') {
              synthSuccess = true;
              break;
            }
          }

          if (!this.autopilotActive) break;

          if (!synthSuccess) {
            this.sendLog("Synthesis timed out or failed. Skipping target.", "error");
            if (closeBtn) closeBtn.click(); // Close console
            continue;
          }

          // 6. Deploy comment (Ghost Typing + Auto submit)
          this.sendLog("Synthesis complete. Initiating Ghost Typing deployment...", "info");
          await new Promise(r => setTimeout(r, 1000)); // Natural pause before typing

          if (!this.autopilotActive) break;

          const deploySuccess = await this.executeGhostTyping(target, editor.innerText, true, anchoredBtn, mainBtn);

          if (deploySuccess) {
            this.sendLog("Deployment successful. Comment posted.", "success");
          } else {
            this.sendLog("Deployment failed. Skipping target.", "error");
          }

          // 7. Close the board after deployment
          if (closeBtn) {
            closeBtn.click();
            await new Promise(r => setTimeout(r, 800)); // Wait for close animation
          }

          // 8. Stealth Delay before next post
          if (this.autopilotActive) {
            const stealthPreset = this.getStealthConfig(this.globalStealthLevel);
            const baseDelay = stealthPreset.minDelay * 200 + Math.random() * (stealthPreset.maxDelay - stealthPreset.minDelay) * 200;
            this.sendLog(`Stealth mode cooldown: resting for ${Math.round(baseDelay / 1000)} seconds...`, "info");
            await new Promise(r => setTimeout(r, baseDelay));
          }

        } else {
          // No targets found. Scroll down to load more content.
          scrollAttempts++;
          if (scrollAttempts > 5) {
            this.sendLog("No new targets found after multiple scroll attempts. Autopilot pausing...", "warning");
            await new Promise(r => setTimeout(r, 10000)); // Pause longer
            scrollAttempts = 0;
            continue;
          }

          this.sendLog("Scanning feed: No targets in view. Scrolling for new content...", "info");
          window.scrollBy({ top: 600, behavior: 'smooth' });
          await new Promise(r => setTimeout(r, 3000)); // Wait for content load
        }
      } catch (err) {
        console.error("[NERA Autopilot Error]:", err);
        this.sendLog(`Autopilot error: ${err.message}`, "error");
      }
    }

    this.autopilotProcessing = false;
    this.sendLog("Autopilot engine offline.", "warning");
  }

  getCurrentUserName() {
    // Try to find in top-right profile button
    const profileTrigger = document.querySelector('div[aria-label*="Trang cá nhân của"], div[aria-label*="Your profile"], a[href*="/me/"]');
    if (profileTrigger) {
      const label = profileTrigger.getAttribute('aria-label') || "";
      // Extract name from "Trang cá nhân của Nguyễn Văn A" or "Your profile, John Doe"
      const match = label.match(/Trang cá nhân của (.+)/i) || label.match(/Your profile, (.+)/i) || label.match(/(.+)'s profile/i);
      if (match && match[1]) return match[1].trim();
    }
    
    // Try to find in comment input placeholder/label (e.g. "Viết bình luận dưới tên Hải...")
    const commentInputs = document.querySelectorAll('div[aria-label*="dưới tên"], div[aria-label*="as "]');
    for (const input of commentInputs) {
      const label = input.getAttribute('aria-label') || "";
      const match = label.match(/dưới tên (.+)/i) || label.match(/as (.+)/i);
      if (match && match[1]) return match[1].trim();
    }
    
    return null;
  }

  hasUserCommented(post, currentUserName) {
    if (!currentUserName) return false;
    
    // Find all comments inside the post container
    const comments = post.querySelectorAll('[data-commentid], [data-comment-id], [role="article"]');
    for (const comment of comments) {
      const label = comment.getAttribute('aria-label') || "";
      if (label.toLowerCase().includes('bình luận') || label.toLowerCase().includes('comment')) {
        // If comment label contains our profile name, we already commented
        if (label.toLowerCase().includes(currentUserName.toLowerCase())) {
          return true;
        }
      }
      
      // Fallback: check text of links inside the comment for author name matching
      const authorLinks = comment.querySelectorAll('a[role="link"], span[role="link"]');
      for (const link of authorLinks) {
        if (link.innerText && link.innerText.trim().toLowerCase() === currentUserName.toLowerCase()) {
          return true;
        }
      }
    }
    
    return false;
  }

  findNextAutopilotTarget() {
    // Find all infiltrated post containers
    const candidates = Array.from(document.querySelectorAll('[data-nera-infiltrated="true"]'));
    const currentUserName = this.getCurrentUserName();
    
    for (const el of candidates) {
      // Skip if already processed by autopilot
      if (el.dataset.neraAutopilotProcessed === 'true') continue;

      // Skip elements that are obviously not posts (like very small buttons)
      if (el.offsetWidth < 50 || el.offsetHeight < 50) continue;

      // Autopilot only comments on main posts, skip comments
      if (el.dataset.neraMode === 'COMMENT') continue;

      // Skip if the user has already commented on this post (prevent duplicate comments)
      if (currentUserName && this.hasUserCommented(el, currentUserName)) {
        this.sendLog("Skipping post: User has already commented on this thread.", "warning");
        el.dataset.neraAutopilotProcessed = 'true'; // Mark as processed to save resources
        continue;
      }

      // Skip if it is inside another element already processed or being processed
      let parent = el.parentElement;
      let isNestedProcessed = false;
      while (parent && parent !== document.body) {
        if (parent.dataset && parent.dataset.neraAutopilotProcessed === 'true') {
          isNestedProcessed = true;
          break;
        }
        parent = parent.parentElement;
      }
      if (isNestedProcessed) continue;

      return el;
    }
    return null;
  }

  sendLog(message, status) {
    this.safeSendMessage({ type: "LOG_EVENT", text: `[FIELD] ${message}`, status: status });
  }
}
