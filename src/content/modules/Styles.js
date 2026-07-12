/**
 * Nera Content Styles - CSS Injection Logic
 */
export const NeraStyles = {
  inject(shadow) {
    const style = document.createElement('style');
    style.textContent = this.getRawCSS();
    shadow.appendChild(style);
  },

  getRawCSS() {
    return `
      :host { 
        position: absolute;
        right: 0;
        top: 0;
        height: 0;
        width: 0;
        overflow: visible !important;
        pointer-events: none;
        z-index: 2147483647 !important;
        font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        isolation: auto !important;
        transform-style: flat !important;
        will-change: transform !important;
        contain: none !important;
      }
      .tactical-console {
        position: absolute;
        top: 12px;
        right: 75px; 
        width: 86px; 
        height: 28px; 
        pointer-events: auto;
        background: rgba(20, 20, 20, 0.9);
        backdrop-filter: blur(8px);
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        flex-direction: column;
        overflow: hidden; /* Mask the internal glow effects */
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 2147483640 !important;
      }
      .tactical-console::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          rgba(35, 116, 225, 0.4) 25%,
          rgba(35, 116, 225, 0.8) 50%,
          rgba(35, 116, 225, 0.4) 75%,
          transparent 100%
        );
        animation: rotateGlow 4s linear infinite;
        z-index: -2;
      }
      .tactical-console::after {
        content: "";
        position: absolute;
        inset: 1px;
        background: rgba(20, 20, 20, 0.95);
        border-radius: inherit;
        z-index: -1;
      }
      @keyframes rotateGlow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      :host(.mode-comment) .tactical-console {
        background: rgba(15, 40, 15, 0.9); /* Deep Green */
        border: none;
        right: 8px !important; 
        top: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
      }
      :host(.mode-comment) .tactical-console::before {
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          rgba(0, 230, 118, 0.4) 25%,
          rgba(0, 230, 118, 0.8) 50%,
          rgba(0, 230, 118, 0.4) 75%,
          transparent 100%
        );
      }
      :host(.mode-comment) .nera-toggle-trigger {
        color: #00e676; /* Tactical Green text */
      }
      .tactical-console.expanded {
        width: 580px;
        height: auto;
        min-height: 140px; 
        border-radius: 12px;
        background: #1b1b1b;
        right: 15px;
        box-shadow: none;
        z-index: 2147483647 !important;
      }
      :host(.mode-comment) .tactical-console.expanded {
        width: 380px; /* Optimized Mini Board */
        padding: 8px;
        right: 10px !important;
        left: auto !important;
        margin-left: 0;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6) !important;
      }
      :host(.mode-comment) .payload-editor {
        font-size: 13px;
        min-height: 60px;
      }
      :host(.mode-comment) .intent-mini, 
      :host(.mode-comment) .persona-mini {
        padding: 4px 8px;
        font-size: 11px;
      }
      :host(.mode-comment) #nera-main-action {
        background: #00c853;
        box-shadow: none;
      }
      :host(.mode-comment) .intent-mini.active,
      :host(.mode-comment) .persona-mini.active {
        background: rgba(0, 200, 83, 0.2);
        border-color: #00c853;
        color: #00e676;
      }
      :host(.mode-comment) .badge-persona,
      :host(.mode-comment) .badge-intent {
        background: rgba(0, 200, 83, 0.1);
        color: #00e676;
        border-color: rgba(0, 200, 83, 0.3);
      }
      .nera-toggle-trigger {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #2374e1;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        z-index: 100;
      }
      .tactical-console.expanded .nera-toggle-trigger {
        display: none;
      }
      .nera-close-btn {
        position: absolute;
        top: 12px;
        right: 8px;
        width: 32px;
        height: 32px;
        display: none; /* Only show when expanded */
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 101;
        color: rgba(255,255,255,0.4);
      }
      .tactical-console.expanded .nera-close-btn {
        display: flex;
      }
      .nera-close-btn::after {
        content: "";
        width: 12px;
        height: 2px;
        background: currentColor;
        border-radius: 2px;
      }
      .nera-close-btn:hover {
        color: #10b981;
        transform: scale(1.1);
      }
      .console-expanded-content {
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s;
      }
      .tactical-console.expanded .console-expanded-content {
        opacity: 1;
        visibility: visible;
      }
      .tactical-console.expanded::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: conic-gradient(
          from 0deg,
          transparent 0%,
          rgba(35, 116, 225, 0.4) 25%,
          rgba(35, 116, 225, 0.8) 50%,
          rgba(35, 116, 225, 0.4) 75%,
          transparent 100%
        );
        animation: rotateGlow 6s linear infinite;
        z-index: -2;
      }
      .tactical-console.expanded::after {
        content: "";
        position: absolute;
        inset: 2px;
        background: #1b1b1b;
        border-radius: inherit;
        z-index: -1;
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
        border-radius: 0;
        font-size: 15px;
        font-weight: 400;
        line-height: 1.6;
        outline: none;
        min-height: 80px;
        max-height: 350px;
        overflow-y: auto;
        padding: 4px 0;
        margin-bottom: 12px;
      }
      .payload-editor:empty:before {
        content: "What's the tactical plan today?";
        color: rgba(255, 255, 255, 0.2);
        pointer-events: none;
      }
      
      /* Sentiment Radar */
      .sentiment-radar {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 24px;
        padding: 12px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .radar-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .radar-label {
        font-size: 9px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.3);
        width: 24px;
        letter-spacing: 0.5px;
      }
      .radar-bar {
        flex: 1;
        height: 4px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 2px;
        overflow: hidden;
      }
      .radar-fill {
        height: 100%;
        width: 0%;
        background: #2374e1;
        transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: none;
      }
      .radar-item[data-type="pos"] .radar-fill { background: #10b981; box-shadow: none; }
      .radar-item[data-type="neg"] .radar-fill { background: #ef4444; box-shadow: none; }
      .radar-item[data-type="sar"] .radar-fill { background: #f59e0b; box-shadow: none; }
      .radar-item[data-type="ser"] .radar-fill { background: #6366f1; box-shadow: none; }

      .tactical-params {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 12px 0;
      }
      .param-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .param-item label {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .stealth-select {
        background: #2a2a2a;
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        font-size: 11px;
        padding: 2px 6px;
        outline: none;
        cursor: pointer;
      }
      .nera-checkbox {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .nera-checkbox input {
        accent-color: #2374e1;
        cursor: pointer;
      }
      .nera-checkbox span {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
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

      .suggestions-bar {
        padding: 8px 0;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 12px;
        background: transparent;
        pointer-events: auto;
      }
      .suggestion-group:first-child {
        flex: 0 0 calc(45% - 12px);
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .suggestion-group:last-child {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: flex-start;
      }
      
      .persona-mini {
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.3);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        position: relative;
      }
      .persona-mini.active {
        background: #2374e1;
        color: white;
        box-shadow: none;
      }
      .persona-mini svg { width: 16px; height: 16px; }

      .intent-mini {
        padding: 6px 12px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.04);
        color: rgba(255, 255, 255, 0.4);
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.02);
      }
      .intent-mini.active {
        background: #2374e1;
        color: white;
        box-shadow: none;
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
        box-shadow: none;
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
  }
};
