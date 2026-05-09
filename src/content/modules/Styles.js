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
      .nera-control { 
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        margin-top: 25px;
        overflow: visible;
        pointer-events: none;
        z-index: 10000;
        font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      }
      .tactical-console {
        position: sticky;
        top: 80px;
        left: 15px;
        width: 85px; 
        height: 36px; 
        margin-top: 15px;
        pointer-events: auto;
        background: #1b1b1b;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        /* COLLAPSE SEQUENCE: Height first (0.3s), then Width (starts at 0.3s) */
        transition: height 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    width 0.3s cubic-bezier(0.16, 1, 0.3, 1) 0.3s,
                    border-radius 0.3s ease;
        z-index: 10000;
      }
      .tactical-console.expanded {
        width: calc(100% - 30px);
        height: auto;
        min-height: 180px; 
        border-radius: 16px;
        /* EXPAND SEQUENCE: Width first (0.3s), then Height (starts at 0.3s) */
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                    height 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s,
                    border-radius 0.3s ease;
      }
      .nera-toggle-trigger {
        position: absolute;
        top: 0;
        left: 0;
        width: 85px; 
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #10b981;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        z-index: 100;
        transition: all 0.3s;
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
    }
};
