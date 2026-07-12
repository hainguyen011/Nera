/**
 * SidePanelManager - UI Logic Orchestrator
 */
import { StorageManager } from '../core/StorageManager.js';
import { NeraSelect } from './components/NeraSelect.js';

export const SidePanelManager = {
  elements: {},
  customSelects: [],

  init() {
    this.elements = {
      apiKeyInput: document.getElementById('apiKey'),
      apiKeyLabel: document.getElementById('apiKeyLabel'),
      providerSelect: document.getElementById('provider'),
      modelSelect: document.getElementById('model'),
      modelGroup: document.getElementById('modelGroup'),
      stealthLevelSelect: document.getElementById('stealthLevel'),
      personaSelect: document.getElementById('persona'),
      customGroup: document.getElementById('customGroup'),
      customPromptInput: document.getElementById('customPrompt'),
      toneSelect: document.getElementById('tone'),
      saveBtn: document.getElementById('saveConfig'),
      logContainer: document.getElementById('logContainer'),
      tabBtns: document.querySelectorAll('.tab-btn'),
      tabPanes: document.querySelectorAll('.tab-pane'),
      toggleAutopilotBtn: document.getElementById('toggleAutopilot'),
      autopilotIcon: document.getElementById('autopilotIcon'),
      autopilotText: document.getElementById('autopilotText'),
      
      // Forge Elements
      agentNameInput: document.getElementById('agentName'),
      missionDirectiveInput: document.getElementById('missionDirective'),
      targetAudienceSelect: document.getElementById('targetAudience'),
      slangLevelSelect: document.getElementById('slangLevel'),
      formalitySelect: document.getElementById('formality'),
      lengthLimitSelect: document.getElementById('lengthLimit'),
      saveProfileBtn: document.getElementById('saveProfileBtn'),
      profileList: document.getElementById('profileList')
    };


    // Initialize custom select components for all dropdowns
    this.customSelects = NeraSelect.createAll('select');

    this.initTabs();
    this.loadConfig();
    this.attachListeners();
    this.initMessageListener();
    this.initStorageListener();
  },


  initTabs() {
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        
        // Update Buttons
        this.elements.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update Panes
        this.elements.tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === target) pane.classList.add('active');
        });
      });
    });
  },

  async loadConfig() {
    const config = await StorageManager.get(['apiKey', 'persona', 'customPrompt', 'provider', 'stealthLevel', 'model', 'tone', 'style', 'autopilotActive']);
    
    if (config.apiKey && this.elements.apiKeyInput) this.elements.apiKeyInput.value = config.apiKey;
    if (config.provider && this.elements.providerSelect) {
      this.elements.providerSelect.value = config.provider;
      this.updateApiKeyLabel(config.provider);
    }
    if (config.stealthLevel && this.elements.stealthLevelSelect) {
      this.elements.stealthLevelSelect.value = config.stealthLevel;
    }
    if (config.persona && this.elements.personaSelect) {
      this.elements.personaSelect.value = config.persona;
      this.toggleCustomGroup(config.persona);
    }
    if (config.customPrompt && this.elements.customPromptInput) {
      this.elements.customPromptInput.value = config.customPrompt;
    }
    if (config.tone && this.elements.toneSelect) {
      this.elements.toneSelect.value = config.tone;
    }

    // Update Autopilot Button UI
    this.updateAutopilotUI(!!config.autopilotActive);

    // Fetch models if we have an API key
    if (config.apiKey && config.provider) {
        await this.fetchModels(config.provider, config.apiKey, config.model);
    }

    // Sync custom selects after loading config
    this.customSelects.forEach(cs => {
        cs.updateTriggerText();
        cs.updateOptionsList();
    });

    this.renderProfiles(config.agentProfiles || [], config.activeProfileId);
  },

  attachListeners() {
    this.elements.personaSelect.addEventListener('change', () => {
      this.toggleCustomGroup(this.elements.personaSelect.value);
    });

    this.elements.providerSelect.addEventListener('change', () => {
      const provider = this.elements.providerSelect.value;
      const apiKey = this.elements.apiKeyInput.value;
      this.updateApiKeyLabel(provider);
      if (apiKey) this.fetchModels(provider, apiKey);
    });

    this.elements.apiKeyInput.addEventListener('blur', () => {
      const provider = this.elements.providerSelect.value;
      const apiKey = this.elements.apiKeyInput.value;
      if (apiKey) this.fetchModels(provider, apiKey);
    });

    if (this.elements.saveBtn) {
      this.elements.saveBtn.addEventListener('click', () => this.saveConfig());
    }

    if (this.elements.toggleAutopilotBtn) {
      this.elements.toggleAutopilotBtn.addEventListener('click', async () => {
        const config = await StorageManager.get(['autopilotActive']);
        const nextState = !config.autopilotActive;
        await StorageManager.set({ autopilotActive: nextState });
        this.updateAutopilotUI(nextState);
        this.addLog(nextState ? "Autopilot Mode ENGAGED. Scanning feed..." : "Autopilot Mode DISENGAGED.", nextState ? "success" : "warning");
      });
    }
    
    // Forge Listeners
    if (this.elements.saveProfileBtn) {
      this.elements.saveProfileBtn.addEventListener('click', () => this.saveProfile());
    }
  },

  async fetchModels(provider, apiKey, selectedModel = null) {
    if (!apiKey) return;

    this.addLog(`Fetching models for ${provider.toUpperCase()}...`, 'info');
    this.elements.modelGroup.style.display = 'block';
    
    try {
        let models = [];
        if (provider === 'groq') {
            const res = await fetch('https://api.groq.com/openai/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await res.json();
            models = data.data.map(m => m.id);
        } else if (provider === 'openai') {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            const data = await res.json();
            models = data.data.map(m => m.id);
        } else if (provider === 'gemini') {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const data = await res.json();
            // Gemini models starting with 'models/' and supporting generateContent
            models = data.models
                .filter(m => m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);
        }

        // Update native select
        this.elements.modelSelect.innerHTML = '';
        models.forEach(modelId => {
            const opt = document.createElement('option');
            opt.value = modelId;
            opt.innerText = modelId;
            if (selectedModel && modelId === selectedModel) opt.selected = true;
            this.elements.modelSelect.appendChild(opt);
        });

        // Refresh custom select UI
        const modelCustomSelect = this.customSelects.find(cs => cs.nativeSelect.id === 'model');
        if (modelCustomSelect) {
            modelCustomSelect.refresh();
        }

        this.addLog(`Loaded ${models.length} models successfully.`, 'success');
    } catch (err) {
        this.addLog(`Failed to load models: ${err.message}`, 'error');
    }
  },

  initMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "LOG_UPDATE") {
        this.addLog(message.text, message.status);
      }
      if (message.type === "SENTIMENT_UPDATE") {
        this.updateRadar(message.data);
      }
    });
  },
  initStorageListener() {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.persona) {
          this.elements.personaSelect.value = changes.persona.newValue;
          this.toggleCustomGroup(changes.persona.newValue);
          
          // Sync custom selects
          this.customSelects.forEach(cs => {
            if (cs.nativeSelect.id === 'persona') {
              cs.updateTriggerText();
              cs.updateOptionsList();
            }
          });
        }
        if (changes.autopilotActive) {
          this.updateAutopilotUI(!!changes.autopilotActive.newValue);
        }
      }
    });
  },

  updateRadar(data) {
    const fields = ['pos', 'neg', 'sar', 'ser'];
    fields.forEach(field => {
      const val = Math.round((data[field] || 0) * 100);
      const bar = document.getElementById(`bar-${field}`);
      const stat = document.getElementById(`stat-${field}`);
      if (bar) bar.style.width = `${val}%`;
      if (stat) stat.innerText = `${val}%`;
    });
  },

  toggleCustomGroup(value) {
    if (this.elements.customGroup) {
      this.elements.customGroup.style.display = value === 'Custom' ? 'block' : 'none';
    }
  },

  updateAutopilotUI(isActive) {
    if (!this.elements.toggleAutopilotBtn) return;
    if (isActive) {
      this.elements.toggleAutopilotBtn.style.background = '#ef4444';
      this.elements.autopilotText.innerText = 'Stop Autopilot';
      this.elements.autopilotIcon.innerHTML = '<rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>';
    } else {
      this.elements.toggleAutopilotBtn.style.background = '#2563eb';
      this.elements.autopilotText.innerText = 'Start Autopilot';
      this.elements.autopilotIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';
    }
  },

  updateApiKeyLabel(value) {
    const labels = {
      'groq': 'Groq API Key (gsk_...)',
      'gemini': 'Gemini API Key',
      'openai': 'OpenAI API Key (sk-...)'
    };
    if (this.elements.apiKeyLabel) {
      this.elements.apiKeyLabel.innerText = labels[value] || 'API Key';
    }
  },

  async saveConfig() {
    if (!this.elements.apiKeyInput || !this.elements.saveBtn) {
      console.error("[NERA] Cannot save: Critical UI elements missing.");
      return;
    }

    const config = {
      apiKey: this.elements.apiKeyInput.value.trim(),
      provider: this.elements.providerSelect ? this.elements.providerSelect.value : 'groq',
      model: this.elements.modelSelect ? this.elements.modelSelect.value : '',
      stealthLevel: this.elements.stealthLevelSelect ? this.elements.stealthLevelSelect.value : 'standard',
      persona: this.elements.personaSelect ? this.elements.personaSelect.value : 'Hawl',
      tone: this.elements.toneSelect ? this.elements.toneSelect.value : 'neutral',
      customPrompt: this.elements.customPromptInput ? this.elements.customPromptInput.value.trim() : ''
    };

    if (!config.apiKey) {
      alert("Hệ thống yêu cầu API Key để hoạt động.");
      return;
    }

    await StorageManager.setConfig(config);

    this.elements.saveBtn.innerText = 'CONFIGURATION SYNCED';
    this.elements.saveBtn.style.background = '#ffffff';
    this.elements.saveBtn.style.color = '#000000';
    
    setTimeout(() => {
      this.elements.saveBtn.innerText = 'Save & Synchronize';
      this.elements.saveBtn.style.background = '#ededed';
    }, 2000);
  },

  addLog(text, status = 'info') {
    const logEntry = document.createElement('div');
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let color = '#ccc'; // Brighter default
    if (status === 'success') color = '#34d399'; // Brighter green
    if (status === 'error') color = '#f87171'; // Brighter red
    if (status === 'ai') color = '#60a5fa'; // Brighter blue
    if (status === 'info') color = '#94a3b8'; // Tactical slate

    logEntry.innerHTML = `<span style="color: rgba(255,255,255,0.2)">[${time}]</span> <span style="color: ${color}">${text}</span>`;
    this.elements.logContainer.appendChild(logEntry);
    this.elements.logContainer.scrollTop = this.elements.logContainer.scrollHeight;
  },

  async saveProfile() {
    if (!this.elements.agentNameInput) return;
    
    const name = this.elements.agentNameInput.value.trim();
    if (!name) {
        this.addLog("Agent name required for deployment.", "error");
        return;
    }

    const profile = {
        id: Date.now().toString(),
        name: name,
        mission: this.elements.missionDirectiveInput ? this.elements.missionDirectiveInput.value.trim() : '',
        target: this.elements.targetAudienceSelect ? this.elements.targetAudienceSelect.value : 'general',
        slang: this.elements.slangLevelSelect ? this.elements.slangLevelSelect.value : 'none',
        formality: this.elements.formalitySelect ? this.elements.formalitySelect.value : 'natural',
        length: this.elements.lengthLimitSelect ? this.elements.lengthLimitSelect.value : 'medium'
    };

    const config = await StorageManager.getConfig();
    const profiles = config.agentProfiles || [];
    
    // Check for existing profile with same name and update if found, otherwise add new
    const existingIndex = profiles.findIndex(p => p.name === name);
    if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
    } else {
        profiles.push(profile);
    }

    await StorageManager.set({ agentProfiles: profiles, activeProfileId: profile.id });
    this.renderProfiles(profiles, profile.id);
    this.addLog(`Agent [${name}] forged and commissioned.`, "success");
    
    this.elements.saveProfileBtn.innerText = "FORGED";
    setTimeout(() => this.elements.saveProfileBtn.innerText = "SAVE", 2000);
  },

  renderProfiles(profiles, activeId) {
    if (!this.elements.profileList) return;
    this.elements.profileList.innerHTML = '';
    
    if (profiles.length === 0) {
        this.elements.profileList.innerHTML = '<div style="color: #444; font-size: 11px; font-style: italic;">No agents forged yet.</div>';
        return;
    }

    profiles.forEach(p => {
        const item = document.createElement('div');
        item.style.cssText = `
            background: ${p.id === activeId ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.02)'};
            border: 1px solid ${p.id === activeId ? 'var(--primary)' : 'var(--border)'};
            border-radius: 8px;
            padding: 10px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s;
        `;

        item.innerHTML = `
            <div style="flex: 1;">
                <div style="font-size: 12px; font-weight: 600; color: ${p.id === activeId ? 'var(--primary)' : 'var(--text)'}">${p.name}</div>
                <div style="font-size: 9px; color: var(--text-muted);">${p.target} | ${p.formality}</div>
            </div>
            <button class="delete-profile" data-id="${p.id}" style="background: transparent; border: none; color: #f87171; cursor: pointer; padding: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;

        item.onclick = (e) => {
            if (e.target.closest('.delete-profile')) return;
            this.activateProfile(p);
        };

        const delBtn = item.querySelector('.delete-profile');
        delBtn.onclick = async (e) => {
            e.stopPropagation();
            await this.deleteProfile(p.id);
        };

        this.elements.profileList.appendChild(item);
    });
  },

  async activateProfile(profile) {
    this.elements.agentNameInput.value = profile.name;
    this.elements.missionDirectiveInput.value = profile.mission || '';
    this.elements.targetAudienceSelect.value = profile.target;
    this.elements.slangLevelSelect.value = profile.slang;
    this.elements.formalitySelect.value = profile.formality;
    this.elements.lengthLimitSelect.value = profile.length;

    // Update custom selects
    this.customSelects.forEach(cs => {
        if (['targetAudience', 'slangLevel', 'formality', 'lengthLimit'].includes(cs.nativeSelect.id)) {
            cs.refresh();
        }
    });

    await StorageManager.set({ activeProfileId: profile.id });
    const config = await StorageManager.getConfig();
    this.renderProfiles(config.agentProfiles || [], profile.id);
    this.addLog(`Agent [${profile.name}] active.`, "info");
  },

  async deleteProfile(id) {
    const config = await StorageManager.getConfig();
    const profiles = (config.agentProfiles || []).filter(p => p.id !== id);
    const activeId = config.activeProfileId === id ? null : config.activeProfileId;
    
    await StorageManager.set({ agentProfiles: profiles, activeProfileId: activeId });
    this.renderProfiles(profiles, activeId);
    this.addLog("Agent decommissioned.", "warning");
  }
};
