/**
 * Nera Tactical Overlay - Dashboard & Sidepanel Trigger
 */
export class NeraOverlay {
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
        background: transparent;
        box-shadow: 0 10px 50px rgba(0,0,0,0.8);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2;
        transform: translateX(-120%);
        transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform;
        backface-visibility: hidden;
        pointer-events: auto;
      }
      .nera-trigger {
        position: absolute;
        top: 50%;
        left: -20px;
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
        position: absolute;
        top: 8px;
        left: 50%;
        transform: translateX(-50%);
        height: 3px;
        width: 30px;
        background: rgba(255,255,255,0.15);
        border-radius: 2px;
        z-index: 100;
        pointer-events: none;
      }
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'nera-overlay';

    const handle = document.createElement('div');
    handle.className = 'drag-handle';

    const iframe = document.createElement('iframe');
    iframe.src = chrome.runtime.getURL('src/ui/pages/sidepanel/sidepanel.html');

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
    this.container.style.display = 'block';
  }
}
