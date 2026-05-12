/**
 * Nera Background - Command Center (ES Module)
 */
import { AIHub } from '../core/AIHub.js';
import { StorageManager } from '../core/StorageManager.js';
import { Humanizer } from '../core/Humanizer.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log("Nera AI Agent (Modular) has been successfully recruited.");
  
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

  // Create Context Menu for selection
  chrome.contextMenus.create({
    id: "nera-analyze-selection",
    title: chrome.i18n.getMessage("ctxAnalyzeSelection") || "NERA: Analyze Selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "nera-analyze-selection") {
    const selectedText = info.selectionText;
    // Notify side panel
    chrome.runtime.sendMessage({
      type: "ANALYZE_SELECTION",
      content: selectedText,
      tabId: tab.id
    }).catch(() => {
      // Side panel might be closed, that's okay
    });
  }
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

    // Inject Agent Forge Profile Directives
    let activeProfile = null;
    if (config.agentProfiles && config.activeProfileId) {
      activeProfile = config.agentProfiles.find(p => p.id === config.activeProfileId);
      if (activeProfile) {
        systemPrompt += `\n\n[AGENT FORGE MISSION DATA]`;
        systemPrompt += `\n- CALLSIGN: ${activeProfile.name}`;
        if (activeProfile.mission) systemPrompt += `\n- PRIMARY MISSION: ${activeProfile.mission}`;
        systemPrompt += `\n- TARGET AUDIENCE: ${activeProfile.target}`;
        systemPrompt += `\n- SLANG LEVEL: ${activeProfile.slang}`;
        systemPrompt += `\n- FORMALITY: ${activeProfile.formality}`;
        systemPrompt += `\n- LENGTH LIMIT: ${activeProfile.length}`;
        
        // NEW FORGE ENHANCEMENTS
        if (activeProfile.vocabulary) systemPrompt += `\n- VOCABULARY/KEYWORDS: Use these frequently: ${activeProfile.vocabulary}`;
        if (activeProfile.bannedWords) systemPrompt += `\n- BANNED KEYWORDS: NEVER use these: ${activeProfile.bannedWords}`;
        if (activeProfile.ctaStrategy && activeProfile.ctaStrategy !== 'none') {
          systemPrompt += `\n- CTA STRATEGY: End your comment with a ${activeProfile.ctaStrategy} to drive engagement.`;
        }
        if (activeProfile.emojiUsage) systemPrompt += `\n- EMOJI DENSITY: ${activeProfile.emojiUsage}`;
        
        if (activeProfile.traits) {
          systemPrompt += `\n- PERSONALITY MATRIX: Humor(${activeProfile.traits.humor}%); Sarcasm(${activeProfile.traits.sarcasm}%); Empathy(${activeProfile.traits.empathy}%)`;
        }

        systemPrompt += `\n\n[HUMANIZATION DIRECTIVE]`;
        systemPrompt += `\n- Be conversational. Mention a small detail from the post to sound authentic.`;
        systemPrompt += `\n- Avoid generic "Great post!" style.`;
        systemPrompt += `\n- If appropriate, share a short fake personal anecdote or relate to the author's situation.`;

        systemPrompt += `\n\nSTRICT INSTRUCTION: Overwrite default persona behavior with these Forge directives where they conflict.`;
      }
    }


    if (history.length > 0) {
      const historyText = history.map(h => `Context: ${h.postContent}\nNera's Response: ${h.comment}`).join('\n\n');
      systemPrompt += `\n\nRECENT INTEL (Use for context, but PRIORITIZE current Tone/Style/Instructions): \n${historyText}`;
    }

    // AUTOMATIC LANGUAGE PRIORITIZATION
    const browserLang = chrome.i18n.getUILanguage();
    const targetLang = (activeProfile && activeProfile.targetLanguage && activeProfile.targetLanguage !== 'auto') 
      ? activeProfile.targetLanguage 
      : browserLang;
    
    systemPrompt += `\n\n[LANGUAGE CONFIGURATION]`;
    systemPrompt += `\n- PRIMARY LANGUAGE: ${targetLang}`;
    systemPrompt += `\n- BROWSER LOCALE: ${browserLang}`;
    systemPrompt += `\n- INSTRUCTION: Respond naturally in the PRIMARY LANGUAGE. If the post content is in a different language that you understand, you may adapt your tone but maintain the PRIMARY LANGUAGE for the response unless it makes more sense to be bilingual.`;
    
    if (targetLang.startsWith('vi')) {
      systemPrompt += `\n- VIETNAMESE SPECIFIC: Use modern, natural language. Avoid outdated words like "bằng hữu" unless requested.`;
    }

    const mode = request.postData?.mode || 'POST';
    const author = request.postData?.author || 'Unknown';
    
    if (mode === 'COMMENT') {
      systemPrompt += `\n\n[TACTICAL SITUATION: REPLY TO COMMENT]`;
      systemPrompt += `\n- You are DIRECTLY replying to a specific comment made by "${author}".`;
      systemPrompt += `\n- Focus on the content of their specific comment.`;
      systemPrompt += `\n- Keep it conversational, address their point, and be concise.`;
    } else {
      systemPrompt += `\n\n[TACTICAL SITUATION: NEW POST COMMENT]`;
      systemPrompt += `\n- You are commenting on a main post by "${author}".`;
    }

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
    
    // HUMANIZER POST-PROCESSING
    let finalComment = result.comment;
    if (activeProfile && activeProfile.humanize) {
      broadcastLog(`i18n:logHumanizing:${activeProfile.slang}`, 'info');
      finalComment = Humanizer.injectNaturalSlang(finalComment, activeProfile.slang);
      finalComment = Humanizer.applyIntelligentTypos(finalComment, activeProfile.typoRate || 0.02);
      finalComment = Humanizer.humanizeEmojis(finalComment, activeProfile.emojiUsage);
      
      const delayMs = Humanizer.calculateHumanDelay(finalComment);
      broadcastLog(`i18n:logSimulatingBehavior:${Math.round(delayMs/1000)}`, 'info');
      await new Promise(r => setTimeout(r, delayMs));
    }

    if (result.sentiment) {
      chrome.runtime.sendMessage({
        type: "SENTIMENT_UPDATE",
        data: result.sentiment
      }).catch(() => {});
    }

    // Lưu vào lịch sử
    await StorageManager.saveToThreadHistory(threadId, {
      postContent: content.substring(0, 100),
      comment: finalComment
    });

    broadcastLog({ key: "logAiResponse", params: [finalComment.substring(0, 30)] }, 'success');
    sendResponse({ success: true, comment: finalComment });
  } catch (error) {
    broadcastLog({ key: "logInfiltrationFailed", params: [error.message] }, 'error');
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
    'Custom': config.customPrompt || "You are an AI assistant."
  };
  return personas[config.persona] || personas['Hawl'];
}
