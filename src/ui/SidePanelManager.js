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
      customGroup: document.getElementById('customPersonaGroup'),
      customPromptInput: document.getElementById('customPersona'),
      toneSelect: document.getElementById('tone'),
      saveBtn: document.getElementById('saveConfig'),
      logContainer: document.getElementById('logContainer'),
      tabBtns: document.querySelectorAll('.tab-btn'),
      tabPanes: document.querySelectorAll('.tab-pane')
    };


    // Initialize custom select components
    this.customSelects = NeraSelect.createAll();

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
    const config = await StorageManager.get(['apiKey', 'persona', 'customPrompt', 'provider', 'stealthLevel', 'model', 'tone', 'style']);
    
    if (config.apiKey) this.elements.apiKeyInput.value = config.apiKey;
    if (config.provider) {
      this.elements.providerSelect.value = config.provider;
      this.updateApiKeyLabel(config.provider);
    }
    if (config.stealthLevel) {
      this.elements.stealthLevelSelect.value = config.stealthLevel;
    }
    if (config.persona) {
      this.elements.personaSelect.value = config.persona;
      this.toggleCustomGroup(config.persona);
    }
    if (config.customPrompt) this.elements.customPromptInput.value = config.customPrompt;
    if (config.tone) this.elements.toneSelect.value = config.tone;


    // Fetch models if we have an API key
    if (config.apiKey && config.provider) {
        await this.fetchModels(config.provider, config.apiKey, config.model);
    }

    // Sync custom selects after loading config
    this.customSelects.forEach(cs => {
        cs.updateTriggerText();
        cs.updateOptionsList();
    });
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

    this.elements.saveBtn.addEventListener('click', () => this.saveConfig());
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
    this.elements.customGroup.style.display = value === 'Custom' ? 'block' : 'none';
  },

  updateApiKeyLabel(value) {
    const labels = {
      'groq': 'Groq API Key (gsk_...)',
      'gemini': 'Gemini API Key',
      'openai': 'OpenAI API Key (sk-...)'
    };
    this.elements.apiKeyLabel.innerText = labels[value] || 'API Key';
  },

  async saveConfig() {
    const config = {
      apiKey: this.elements.apiKeyInput.value.trim(),
      provider: this.elements.providerSelect.value,
      model: this.elements.modelSelect.value,
      stealthLevel: this.elements.stealthLevelSelect.value,
      persona: this.elements.personaSelect.value,
      tone: this.elements.toneSelect.value,
      customPrompt: this.elements.customPromptInput.value.trim()
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
    
    let color = '#888';
    if (status === 'success') color = '#10b981';
    if (status === 'error') color = '#ef4444';
    if (status === 'ai') color = '#3b82f6';

    logEntry.innerHTML = `<span style="color: #444">[${time}]</span> <span style="color: ${color}">${text}</span>`;
    this.elements.logContainer.appendChild(logEntry);
    this.elements.logContainer.scrollTop = this.elements.logContainer.scrollHeight;
  }
};
