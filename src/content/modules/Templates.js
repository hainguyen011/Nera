/**
 * Nera Content Templates - HTML Template Logic
 */
export const NeraTemplates = {
    getConsoleHTML(persona, intent) {
        return `
      <div class="nera-toggle-trigger">
        <span>Nera CMT</span>
      </div>
      
      <div class="nera-close-btn"></div>
      
      <div class="console-expanded-content">
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
