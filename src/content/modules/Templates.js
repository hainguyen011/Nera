/**
 * Nera Content Templates - HTML Template Logic
 */
export const NeraTemplates = {
    getConsoleHTML(persona, intent, mode = 'POST') {
        const label = mode === 'COMMENT' ? 'NERA REPLY' : 'NERA POST';
        return `
      <div class="nera-toggle-trigger">
        <span>${label}</span>
      </div>
      
      <div class="nera-close-btn"></div>
      
      <div class="console-expanded-content">
        <div class="console-body">
          <div class="payload-editor" contenteditable="true"></div>
          
          <div class="suggestions-bar">
            <div class="suggestion-group">
              <span class="persona-mini" title="Hawl (Elite)" data-persona="Hawl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <span class="persona-mini" title="Friendly" data-persona="Friendly">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </span>
              <span class="persona-mini" title="Sarcastic" data-persona="Sarcastic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8"/><path d="M8 8l8 8"/></svg>
              </span>
              <span class="persona-mini" title="Professional" data-persona="Professional">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </span>
              <span class="persona-mini" title="Funny" data-persona="Funny">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
              </span>
              <span class="persona-mini" title="Investigative" data-persona="Investigative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <span class="persona-mini" title="Stealth" data-persona="Stealth">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </span>
              <span class="persona-mini" title="Hype" data-persona="Hype">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.5-1 1-4c1.5 0 3 .5 4 1.5l1 1"/><path d="M15 16v5c-3 0-4-1-4-1s-1-1.5-1.5-4l1-1c1 1 2.5 2.5 4 2.5z"/></svg>
              </span>
              <span class="persona-mini" title="Analytical" data-persona="Analytical">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </span>
              <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1); margin: 0 4px;"></div>
            </div>
            
            <div class="suggestion-group">
              ${mode === 'COMMENT' ? `
                <div class="intent-mini active" data-intent="agree">Đồng ý</div>
                <div class="intent-mini" data-intent="expand">Bổ sung</div>
                <div class="intent-mini" data-intent="question">Hỏi lại</div>
                <div class="intent-mini" data-intent="humor">Hài hước</div>
                <div class="intent-mini" data-intent="thanks">Cảm ơn</div>
                <div class="intent-mini" data-intent="challenge">Phản biện</div>
              ` : `
                <div class="intent-mini active" data-intent="agree">Đồng ý</div>
                <div class="intent-mini" data-intent="disagree">Phản đối</div>
                <div class="intent-mini" data-intent="tease">Trêu chọc</div>
                <div class="intent-mini" data-intent="empathize">Đồng cảm</div>
                <div class="intent-mini" data-intent="ask">Hỏi cách</div>
                <div class="intent-mini" data-intent="confirm">Xác nhận</div>
                <div class="intent-mini" data-intent="cta">Kêu gọi</div>
              `}
              <div class="intent-mini" data-intent="suggest" style="background: rgba(${mode === 'COMMENT' ? '0, 200, 83' : '35, 116, 225'}, 0.1); color: ${mode === 'COMMENT' ? '#00e676' : '#2374e1'};">AI Suggest</div>
            </div>
          </div>
        </div>
        </div>
        <div class="console-footer">
          <div style="display: flex; align-items: center;">
            <button class="btn-refresh" title="Reset Console">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
            </button>
            <div class="tactical-badges">
              <div class="badge badge-persona">${persona}</div>
              <div class="badge badge-intent">${intent}</div>
            </div>
          </div>

          <button class="btn-primary" id="nera-main-action">
            <span>Synthesize</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </button>
        </div>
      </div>
    `;
    },

    getScanningOverlay() {
        return `<div class="nera-scanning-line"></div><div class="nera-scanning-text">Analyzing Target</div>`;
    }
};
