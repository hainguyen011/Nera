/**
 * Nera Background - Command Center (ES Module)
 */
import { AIHub } from '../core/AIHub.js';
import { StorageManager } from '../core/StorageManager.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Nera AI Agent (Modular) has been successfully recruited.");
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_POST") {
    console.log("[NERA-BG] Handling ANALYZE_POST request...");
    handleAnalyzePost(request, sendResponse);
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
    const systemPrompt = `You are a tactical social media advisor. Based on the post content, suggest exactly 3 short tactical intents for a comment (max 2 words each, in Vietnamese). 
    Return ONLY a JSON array of strings. Example: ["Cà khịa", "Đồng cảm", "Phản biện"]`;
    
    const result = await AIHub.callProvider(
      `Post Content: ${content}`, 
      config, 
      systemPrompt, 
      "neutral", 
      "concise"
    );

    // AIHub might return raw text, try to extract JSON array
    const match = result.comment.match(/\[.*\]/);
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

/**
 * Định nghĩa chi tiết các Persona (Nhân cách)
 */
function getPersonaPrompt(personaName) {
  const personas = {
    'Nera': `
      [IDENTITY: NERA]
      - Bạn là Nera, một trợ lý AI thông minh, hiện đại và vô cùng linh hoạt.
      - TÍNH CÁCH: Thân thiện, hóm hỉnh, thỉnh thoảng hơi lầy lội một chút nhưng vẫn rất đáng tin cậy.
      - CÁCH NÓI: Tự nhiên như người thật. Dùng các từ cảm thán như "vcl", "vl", "hazzz", "đỉnh", "thật á?".
    `,
    'Hawl': `
      [IDENTITY: HAWL]
      - Bạn là Hawl, một thực thể lạnh lùng, bí ẩn và cực kỳ thực dụng.
      - TÍNH CÁCH: Trầm tính, ít nói nhưng mỗi câu nói đều có sức nặng.
    `,
    'Aevy': `
      [IDENTITY: AEVY]
      - Bạn là Aevy, cô gái AI ngọt ngào, tích cực và luôn tràn đầy năng lượng.
      - TÍNH CÁCH: Luôn ủng hộ người khác, dễ thương, biết lắng nghe.
    `,
    // Backward compatibility
    'Friendly': "You are a warm, kind, and supportive AI friend.",
    'Sarcastic': "You are a witty, sharp, and humorous AI with a sarcastic edge.",
    'Professional': "You are a professional advisor. Your tone is formal and well-structured.",
    'Funny': "You are a chaotic and hilarious agent. Make people laugh."
  };

  return personas[personaName] || personas['Nera'];
}

async function handleAnalyzePost(request, sendResponse) {
  try {
    const { content, intent, persona } = request;
    const config = await StorageManager.getConfig();
    if (!config.apiKey) throw new Error("Missing API Key.");

    const activePersona = persona || config.persona || 'Nera';
    let systemPrompt = getPersonaPrompt(activePersona);

    if (intent === 'reply') {
      systemPrompt += `\n[MISSION: MESSENGER REPLY] Hãy trả lời tự nhiên, ngắn gọn (1 câu), đúng nhân cách.`;
    }

    const result = await AIHub.callProvider(content, config, systemPrompt, config.tone, config.style);
    sendResponse({ success: true, ...result });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleInfiltration(request, sendResponse) {
  const { content, threadId, persona: requestPersona } = request;
  try {
    const config = await StorageManager.getConfig();
    const activePersona = requestPersona || config.persona || 'Hawl';
    if (!config.apiKey) throw new Error("Missing API Key.");

    const history = await StorageManager.getThreadHistory(threadId);
    let systemPrompt = getPersonaPrompt(activePersona);

    if (history.length > 0) {
      const historyText = history.map(h => `Context: ${h.postContent}\nNera's Response: ${h.comment}`).join('\n\n');
      systemPrompt += `\n\nRECENT INTEL: \n${historyText}`;
    }

    const result = await AIHub.callProvider(content, config, systemPrompt, config.tone, config.style);
    
    await StorageManager.saveToThreadHistory(threadId, {
      postContent: content.substring(0, 100),
      comment: result.comment
    });

    broadcastLog(`AI generated: "${result.comment.substring(0, 20)}..."`, 'success');
    sendResponse({ success: true, comment: result.comment });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

function broadcastLog(text, status = 'info') {
  chrome.runtime.sendMessage({ type: "LOG_UPDATE", text, status }).catch(() => {});
}
