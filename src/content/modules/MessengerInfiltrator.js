/**
 * NeraMessengerInfiltrator — Cyberpunk Tactical v11.5 (Icons Edition)
 */
export class NeraMessengerInfiltrator {
  constructor() {
    this.persona = 'Hawl';
    this.isProcessing = false;
    this.currentIntent = 'Agree';
    this.isMenuOpen = false;

    this.SELECTORS = {
      chatLog: '[role="main"] [role="log"], [role="main"] .x1n2onr6.x1iyjqo2',
      bubbles: '[role="article"], [data-scope="message_bubble"]',
      lexicalInput: '[data-lexical-editor="true"][role="textbox"]',
      sendButton: '[aria-label*="Nhấn Enter để gửi"], [aria-label*="Send"]'
    };

    // Định nghĩa các SVG Icons để dùng lại
    this.ICONS = {
      shield: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
      smile: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
      x: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
      briefcase: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
      fire: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 4 6.5 2 2 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>',
      search: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
      eye: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      leaf: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 2 8a7 7 0 0 1-7 7c-1 0-1.39-.1-2-1"></path><path d="M11 20s-2-3-3-9"></path></svg>',
      box: '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
      refresh: '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>'
    };

    this.init();
  }

  async init() {
    try {
      const res = await chrome.storage.local.get(['persona']);
      this.persona = res.persona || 'Hawl';
      this._injectStyles();
      this._startMonitoring();
    } catch (e) {}
  }

  _injectStyles() {
    if (document.getElementById('nera-cyber-css')) return;
    const style = document.createElement('style');
    style.id = 'nera-cyber-css';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap');

      .nera-header-badge {
        display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px;
        background: #000; border: 1.5px solid #1d4ed8; border-radius: 100px;
        color: #3b82f6; font-family: 'Inter', sans-serif; font-size: 9px;
        font-weight: 800; cursor: pointer; transition: 0.2s;
        margin: 0 10px; vertical-align: middle; height: 22px;
      }

      .nera-tactical-menu {
        position: fixed; top: 80px; right: 20px; width: 440px;
        background: #141414; border-radius: 20px; padding: 2px;
        z-index: 10000; display: none; overflow: hidden;
        font-family: 'Inter', sans-serif;
      }
      .nera-tactical-menu.active { display: block; }
      
      .nera-tactical-menu::before {
        content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: conic-gradient(transparent, #2563eb, transparent 30%);
        animation: rotateGlow 4s linear infinite; z-index: -1;
      }
      @keyframes rotateGlow { 100% { transform: rotate(360deg); } }

      .nera-menu-inner { background: #121212; border-radius: 18px; padding: 24px; height: 100%; }
      .nera-top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
      .nera-top-text { color: #555; font-size: 14px; font-weight: 500; }
      .nera-close-mini { color: #444; font-size: 18px; cursor: pointer; }

      .nera-main-grid { display: flex; gap: 20px; margin-bottom: 25px; }
      .nera-left-icons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; flex: 1; }
      .nera-icon-box {
        width: 42px; height: 42px; background: #1a1a1a; border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid #222; cursor: pointer; transition: 0.2s; color: #555;
      }
      .nera-icon-box svg { pointer-events: none; }
      .nera-icon-box:hover { border-color: #3b82f6; color: #3b82f6; }
      .nera-icon-box.active { background: #2563eb; color: #fff; border: none; }

      .nera-right-pills { display: flex; flex-wrap: wrap; gap: 8px; flex: 2; align-content: flex-start; }
      .nera-intent-pill {
        padding: 10px 18px; background: #1a1a1a; border-radius: 10px;
        font-size: 12px; color: #888; cursor: pointer; transition: 0.2s;
        font-weight: 600; border: 1px solid transparent;
      }
      .nera-intent-pill:hover { background: #222; color: #ccc; }
      .nera-intent-pill.active { background: #2563eb; color: #fff; }
      .nera-intent-pill.special { background: #1a2333; color: #3b82f6; border: 1px solid #1e3a8a; }

      .nera-terminal-v11 {
        background: #0a0a0a; border-radius: 12px; height: 120px; padding: 12px;
        font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.6;
        overflow-y: auto; border: 1px solid #1a1a1a; margin-bottom: 20px; color: #888;
      }
      .log-sys { color: #3b82f6; font-weight: 600; }
      .log-ai { color: #94a3b8; }
      .log-success { color: #10b981; }

      .nera-footer-v11 { display: flex; justify-content: space-between; align-items: center; }
      .nera-refresh-btn { 
        width: 40px; height: 40px; background: #1a1a1a; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid #222; color: #888; cursor: pointer;
      }
      .nera-mini-pill { font-size: 10px; background: #1a1a1a; padding: 6px 14px; border-radius: 100px; color: #444; border: 1px solid #222; }
      .nera-mini-pill.active { color: #3b82f6; border-color: #1e3a8a; }

      .nera-synthesize-v11 {
        background: #2563eb; color: white; border: none; padding: 12px 28px;
        border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer;
        display: flex; align-items: center; gap: 8px; transition: 0.1s;
      }
      .nera-synthesize-v11:hover { background: #3b82f6; }
      .nera-synthesize-v11:active { transform: scale(0.98); }
      .nera-synthesize-v11.loading { background: #1e3a8a; color: #60a5fa; cursor: not-allowed; opacity: 0.8; }
    `;
    document.head.appendChild(style);
  }

  _startMonitoring() {
    const check = () => {
      const infoBtn = document.querySelector('[aria-label*="Thông tin"], [aria-label*="Conversation Information"]');
      const container = infoBtn?.parentElement;
      if (container && !document.getElementById('nera-compact-trigger')) {
        this._injectUI(container);
      }
      setTimeout(check, 1000);
    };
    check();
  }

  _injectUI(container) {
    const btn = document.createElement('div');
    btn.id = 'nera-compact-trigger';
    btn.className = 'nera-header-badge';
    btn.innerHTML = '<span style="color:#fbbf24">⚡</span> NERA';
    
    const menu = document.createElement('div');
    menu.id = 'nera-tactical-menu';
    menu.className = 'nera-tactical-menu';
    menu.innerHTML = `
      <div class="nera-menu-inner">
        <div class="nera-top-bar">
          <div class="nera-top-text">What's the tactical plan today?</div>
          <div class="nera-close-mini">−</div>
        </div>
        
        <div class="nera-main-grid">
          <div class="nera-left-icons">
            <div class="nera-icon-box">${this.ICONS.shield}</div>
            <div class="nera-icon-box active">${this.ICONS.smile}</div>
            <div class="nera-icon-box">${this.ICONS.x}</div>
            <div class="nera-icon-box">${this.ICONS.briefcase}</div>
            <div class="nera-icon-box">${this.ICONS.fire}</div>
            <div class="nera-icon-box">${this.ICONS.search}</div>
            <div class="nera-icon-box">${this.ICONS.eye}</div>
            <div class="nera-icon-box">${this.ICONS.leaf}</div>
            <div class="nera-icon-box">${this.ICONS.box}</div>
          </div>
          
          <div class="nera-right-pills">
            <div class="nera-intent-pill active" data-intent="Agree">Đồng ý</div>
            <div class="nera-intent-pill" data-intent="Disagree">Phản đối</div>
            <div class="nera-intent-pill" data-intent="Sarcastic">Trêu chọc</div>
            <div class="nera-intent-pill" data-intent="Empathy">Đồng cảm</div>
            <div class="nera-intent-pill" data-intent="Inquiry">Hỏi cách</div>
            <div class="nera-intent-pill" data-intent="Confirm">Xác nhận</div>
            <div class="nera-intent-pill" data-intent="Call">Kêu gọi</div>
            <div class="nera-intent-pill special" data-intent="Suggest">AI Suggest</div>
          </div>
        </div>

        <div class="nera-terminal-v11" id="nera-logs">
          <div class="log-line log-sys">[SYSTEM] Neural link online. Ready for command.</div>
        </div>

        <div class="nera-footer-v11">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="nera-refresh-btn">${this.ICONS.refresh}</div>
            <div style="display:flex; gap:6px;">
              <div class="nera-mini-pill active">Friendly</div>
              <div class="nera-mini-pill">Agree</div>
            </div>
          </div>
          <button class="nera-synthesize-v11" id="nera-reply-trigger">Synthesize ✨</button>
        </div>
      </div>
    `;

    btn.onclick = (e) => {
      e.stopPropagation();
      this.isMenuOpen = !this.isMenuOpen;
      menu.classList.toggle('active', this.isMenuOpen);
    };

    menu.querySelectorAll('.nera-icon-box').forEach(box => {
      box.onclick = () => {
        menu.querySelectorAll('.nera-icon-box').forEach(x => x.classList.remove('active'));
        box.classList.add('active');
        this._log(`Neural mode updated.`, 'sys');
      };
    });

    menu.querySelectorAll('.nera-intent-pill').forEach(p => {
      p.onclick = () => {
        menu.querySelectorAll('.nera-intent-pill').forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        this.currentIntent = p.dataset.intent;
        this._log(`Intent set: ${this.currentIntent}`, 'sys');
      };
    });

    menu.querySelector('#nera-reply-trigger').onclick = () => this._onManualReply();
    container.insertBefore(btn, container.lastChild);
    
    // Cleanup old menu if exists before adding new one
    const oldMenu = document.getElementById('nera-tactical-menu');
    if (oldMenu) oldMenu.remove();
    
    document.body.appendChild(menu);
  }

  _log(msg, type = 'ai') {
    const box = document.getElementById('nera-logs');
    if (!box) return;
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    const div = document.createElement('div');
    div.className = `log-line log-${type}`;
    div.style.marginBottom = '4px';
    div.innerHTML = `<span style="color:#666; margin-right:8px;">[${time}]</span>${msg}`;
    box.appendChild(div);
    
    // Ép cuộn xuống cuối
    setTimeout(() => { box.scrollTop = box.scrollHeight; }, 10);
  }

  async _onManualReply() {
    if (this.isProcessing) return;
    const history = this.extractChat(15);
    if (!history.length) return;

    this.isProcessing = true;
    const trigger = document.getElementById('nera-reply-trigger');
    if (trigger) {
      trigger.classList.add('loading');
      trigger.innerText = 'Processing...';
    }

    this._log(`Analyzing conversation context...`, 'ai');

    try {
      const contextPreview = history.slice(-3).map(m => `${m.sender}: ${m.text.substring(0, 15)}...`).join(' | ');
      this._log(`Context: ${contextPreview}`, 'sys');
      const historyStr = history.map(m => `${m.sender}: ${m.text}`).join('\n');
      const prompt = `Bạn là chủ tài khoản. Hãy trả lời tin nhắn theo ý đồ: ${this.currentIntent}.\n\nLỊCH SỬ:\n${historyStr}\n\nTRẢ LỜI NGẮN:`;
      chrome.runtime.sendMessage({ type: 'ANALYZE_POST', content: prompt, intent: 'reply', persona: this.persona }, async (res) => {
        if (res?.success && res.comment) {
          this._log('Tactical response generated.', 'success');
          const input = document.querySelector(this.SELECTORS.lexicalInput) || document.querySelector('[contenteditable="true"]');
          if (input) {
            this._log('Target locked. Typing...', 'success');
            await this._typeAndSend(input, res.comment.replace(/^"|"$/g, ''));
            this._log('Infiltration successful.', 'success');
          }
        } else { this._log('AI malfunction.', 'sys'); }
        if (trigger) {
          trigger.classList.remove('loading');
          trigger.innerText = 'Synthesize ✨';
        }
        this.isProcessing = false;
      });
    } catch (e) { this.isProcessing = false; }
  }

  extractChat(limit = 20) {
    const messages = [];
    const bubbles = document.querySelectorAll(this.SELECTORS.bubbles);
    const log = document.querySelector(this.SELECTORS.chatLog) || document.querySelector('[role="main"]');
    if (!log) return [];
    const logMid = log.getBoundingClientRect().left + (log.getBoundingClientRect().width / 2);
    bubbles.forEach((el) => {
      const textEl = el.querySelector('[dir="auto"]');
      if (!textEl) return;
      const text = textEl.innerText?.trim();
      if (!text || text === 'Aa' || /^\d{1,2}:\d{2}$/.test(text)) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const isPartner = rect.left < logMid;
      messages.push({ text, isMe: !isPartner, sender: isPartner ? 'Partner' : 'Me' });
    });
    return messages.slice(-limit);
  }

  async _typeAndSend(input, text) {
    input.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('delete', false, null);
    for (const char of text) {
      input.dispatchEvent(new InputEvent('beforeinput', { inputType: 'insertText', data: char, bubbles: true }));
      document.execCommand('insertText', false, char);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
    }
    await new Promise(r => setTimeout(r, 500));
    const sendBtn = document.querySelector(this.SELECTORS.sendButton);
    if (sendBtn && sendBtn.getAttribute('aria-disabled') !== 'true') sendBtn.click();
    else input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
}
