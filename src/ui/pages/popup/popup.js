/**
 * Nera Popup Logic - Configuration Manager
 */

document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const providerSelect = document.getElementById('provider');
  const personaSelect = document.getElementById('persona');
  const customGroup = document.getElementById('customGroup');
  const customPromptInput = document.getElementById('customPrompt');
  const saveBtn = document.getElementById('saveBtn');

  // Load existing config
  const config = await chrome.storage.local.get(['apiKey', 'persona', 'customPrompt', 'provider']);
  if (config.apiKey) apiKeyInput.value = config.apiKey;
  if (config.provider) {
    providerSelect.value = config.provider;
    updateApiKeyLabel(config.provider);
  }
  if (config.persona) {
    personaSelect.value = config.persona;
    toggleCustomGroup(config.persona);
  }
  if (config.customPrompt) customPromptInput.value = config.customPrompt;

  // Toggle custom group visibility
  personaSelect.addEventListener('change', () => {
    toggleCustomGroup(personaSelect.value);
  });

  providerSelect.addEventListener('change', () => {
    updateApiKeyLabel(providerSelect.value);
  });

  function toggleCustomGroup(value) {
    customGroup.style.display = value === 'Custom' ? 'block' : 'none';
  }

  function updateApiKeyLabel(value) {
    const labels = {
      'groq': 'Groq API Key (gsk_...)',
      'gemini': 'Gemini API Key',
      'openai': 'OpenAI API Key (sk-...)'
    };
    apiKeyLabel.innerText = labels[value] || 'API Key';
  }

  // Save config
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const provider = providerSelect.value;
    const persona = personaSelect.value;
    const customPrompt = customPromptInput.value.trim();

    if (!apiKey) {
      alert("Please enter a valid API Key.");
      return;
    }

    await chrome.storage.local.set({
      apiKey,
      provider,
      persona,
      customPrompt
    });

    saveBtn.innerText = 'SAVED';
    saveBtn.style.background = '#4CAF50';
    
    setTimeout(() => {
      saveBtn.innerText = 'SAVE CONFIGURATION';
      saveBtn.style.background = '#00ff41';
    }, 2000);
  });
});
