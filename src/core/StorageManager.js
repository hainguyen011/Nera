/**
 * StorageManager - Centralized Persistence Layer
 */
export const StorageManager = {
  async getConfig() {
    return await chrome.storage.local.get(['apiKey', 'persona', 'customPrompt', 'provider', 'tone', 'style', 'agentProfiles', 'activeProfileId', 'autopilotActive']);
  },

  async setConfig(config) {
    return await chrome.storage.local.set(config);
  },

  async get(keys) {
    return await chrome.storage.local.get(keys);
  },

  async set(data) {
    return await chrome.storage.local.set(data);
  },

  async getThreadHistory(threadId) {
    const key = `hist_${threadId}`;
    const result = await chrome.storage.local.get(key);
    return result[key] || [];
  },

  async saveToThreadHistory(threadId, entry) {
    const key = `hist_${threadId}`;
    const history = await this.getThreadHistory(threadId);
    history.push({ ...entry, timestamp: Date.now() });
    // Keep only last 10 entries to avoid bloat
    const limitedHistory = history.slice(-10);
    await chrome.storage.local.set({ [key]: limitedHistory });
  }
};
