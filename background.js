/**
 * Nera Background - Command Center (ES Module)
 */
import { AIHub } from './src/core/AIHub.js';
import { StorageManager } from './src/core/StorageManager.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Nera AI Agent (Modular) has been successfully recruited.");
  
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_POST") {
    handleInfiltration(request, sendResponse);
    return true;
  }

  if (request.type === "SUGGEST_INTENTS") {
    handleSuggestIntents(request.content, sendResponse);
    return true;
  }
  
  if (request.type === "LOG_EVENT") {
    broadcastLog(request.text, request.status);
  }
});

async function handleSuggestIntents(content, sendResponse) {
  try {
    const config = await StorageManager.getConfig();
    const systemPrompt = `You are a tactical social media advisor. Based on the post content, suggest exactly 4 short tactical intents for a comment (max 2 words each, in Vietnamese). 
    Return ONLY a JSON array of strings. Example: ["Cà khịa", "Đồng cảm", "Phản biện", "Thách thức"]`;
    
    // Use a direct provider call to avoid the heavy comment/sentiment schema
    let resultText = "";
    const userPrompt = `Post Content: ${content}`;
    
    if (config.provider === 'gemini') {
      resultText = await AIHub.callGemini(userPrompt, systemPrompt, config.apiKey, config.model, false);
    } else if (config.provider === 'openai') {
      resultText = await AIHub.callOpenAI(userPrompt, systemPrompt, config.apiKey, config.model, false);
    } else {
      resultText = await AIHub.callGroq(userPrompt, systemPrompt, config.apiKey, config.model);
    }

    const match = resultText.match(/\[.*\]/);
    if (match) {
      const intents = JSON.parse(match[0]);
      sendResponse({ success: true, intents });
    } else {
      sendResponse({ success: false, error: "Failed to parse intents" });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleInfiltration(request, sendResponse) {
  const { content, threadId, persona: requestPersona } = request;
  try {
    const config = await StorageManager.getConfig();
    const activePersona = requestPersona || config.persona || 'Hawl';

    
    if (!config.apiKey) {
      throw new Error("Missing API Key. Vui lòng cấu hình trong Side Panel.");
    }

    const history = await StorageManager.getThreadHistory(threadId);
    let systemPrompt = getPersonaPrompt({ ...config, persona: activePersona });


    if (history.length > 0) {
      const historyText = history.map(h => `Context: ${h.postContent}\nNera's Response: ${h.comment}`).join('\n\n');
      systemPrompt += `\n\nRECENT INTEL (Use for context, but PRIORITIZE current Tone/Style/Instructions): \n${historyText}`;
    }

    systemPrompt += `\n\nLANGUAGE: Primary language is Vietnamese. Use modern, natural language. Avoid outdated words like "bằng hữu" unless requested.`;

    const tone = config.tone || "supportive";
    const style = config.style || "casual";
    
    // Inject tactical intent and user hints if provided
    let tacticalContent = content;
    if (request.intent) {
      tacticalContent = `[TACTICAL INTENT: ${request.intent}]\n\n${tacticalContent}`;
    }
    if (request.userHint) {
      tacticalContent = `[USER DIRECTION: ${request.userHint}]\n\n${tacticalContent}`;
    }

    const result = await AIHub.callProvider(tacticalContent, config, systemPrompt, tone, style);
    
    if (result.sentiment) {
      chrome.runtime.sendMessage({
        type: "SENTIMENT_UPDATE",
        data: result.sentiment
      }).catch(() => {});
    }

    // Lưu vào lịch sử
    await StorageManager.saveToThreadHistory(threadId, {
      postContent: content.substring(0, 100),
      comment: result.comment
    });

    broadcastLog(`AI generated response: "${result.comment.substring(0, 30)}..."`, 'success');
    sendResponse({ success: true, comment: result.comment });
  } catch (error) {
    broadcastLog(`Infiltration failed: ${error.message}`, 'error');
    sendResponse({ success: false, error: error.message });
  }
}

function broadcastLog(text, status = 'info') {
  chrome.runtime.sendMessage({
    type: "LOG_UPDATE",
    text,
    status
  }).catch(() => {});
}

function getPersonaPrompt(config) {
  const personas = {
    'Hawl': "You are Nera, an elite infiltration AI. Your style is sharp, professional, and slightly mysterious. Write a comment that is concise and adds value while maintaining your elite persona.",
    'Friendly': "You are Nera, an AI designed for social harmony. Your style is warm, kind, and supportive. Write a comment that is encouraging and friendly.",
    'Sarcastic': "You are Nera, a witty AI. Your style is sarcastic, slightly cynical, and humorous. Write a comment that is sharp and funny.",
    'Professional': "You are Nera, a highly professional and articulate advisor. Your tone is formal, well-structured, and authoritative yet polite.",
    'Funny': "You are Nera, a chaotic and hilarious agent. Your goal is to make people laugh with unexpected, witty, and high-energy comments.",
    'Investigative': "You are Nera, a sharp investigative AI. Your goal is to analyze the post deeply, ask probing questions, and uncover hidden details or perspectives.",
    'Stealth': "You are Nera, a mysterious and low-profile agent. Your style is understated, cryptic, and enigmatic, leaving an impression without revealing too much.",
    'Hype': "You are Nera, a high-energy hype agent. Your goal is to build excitement, use energetic language, and amplify the post's impact with maximum enthusiasm.",
    'Analytical': "You are Nera, a cold and logical analytical AI. Your style is objective, data-driven, and focused on facts and rational arguments.",
    'Custom': config.customPrompt || "You are an AI assistant."
  };
  return personas[config.persona] || personas['Hawl'];
}
