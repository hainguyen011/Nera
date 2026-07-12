/**
 * AIHub - Multi-Provider Orchestrator (With Sentiment Support)
 */
export const AIHub = {
  async callProvider(content, config, systemPrompt, tone = "natural", style = "casual") {
    const userPrompt = `TASK: Generate a high-quality Facebook comment.
    CONTEXT: "${content}"
    TONE: "${tone}" (e.g., witty, professional, supportive, sarcastic)
    STYLE: "${style}" (e.g., short, detailed, teen-code, formal)
    
    GUIDELINES:
    1. Make it sound like a real person, not a bot.
    2. Use appropriate emojis based on the tone.
    3. Keep it natural and engaging.
    
    OUTPUT_FORMAT: JSON ONLY. No preamble. No markdown.
    JSON_SCHEMA: { "comment": "string", "sentiment": { "pos": float, "neg": float, "sar": float, "ser": float } }`;

    const fullSystemPrompt = `${systemPrompt}\nCRITICAL: Respond ONLY with the raw JSON object. Do not say "Here is your JSON".`;

    let responseText = "";
    switch (config.provider) {
      case 'gemini':
        responseText = await this.callGemini(userPrompt, fullSystemPrompt, config.apiKey, config.model);
        break;
      case 'openai':
        responseText = await this.callOpenAI(userPrompt, fullSystemPrompt, config.apiKey, config.model);
        break;
      case 'groq':
      default:
        responseText = await this.callGroq(userPrompt, fullSystemPrompt, config.apiKey, config.model);
        break;
    }

    try {
      // 1. Extreme cleaning: Use Regex to find the JSON block
      let match = responseText.match(/\{[\s\S]*\}/);
      let jsonStr = match ? match[0] : "";

      // 2. JSON Repair: If it starts with { but doesn't end with }, it's likely truncated
      if (!jsonStr && responseText.trim().startsWith('{')) {
        jsonStr = responseText.trim();
        if (!jsonStr.endsWith('}')) {
          jsonStr += '"}'; // Quick dirty fix for truncated strings
          if (!jsonStr.includes('}')) jsonStr += '}';
        }
      }

      if (jsonStr) {
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
        try {
          return JSON.parse(jsonStr);
        } catch (innerError) {
          // Fallback: Precise field extraction using regex for "comment"
          const commentMatch = jsonStr.match(/"comment"\s*:\s*"([^"]*)"?|:?\s*"([^"]*)"?$/);
          const commentValue = commentMatch ? (commentMatch[1] || commentMatch[2]) : null;
          if (commentValue) {
            return { comment: commentValue, sentiment: { pos: 0.5, neg: 0, sar: 0, ser: 0 } };
          }
        }
      }

      // 3. Fallback: If AI returned plain text or a very broken structure
      let cleanText = responseText.replace(/```json|```|Here is the JSON requested:?|{ "comment": |{ "comment":| "sentiment":.*| "sentiment":.*/gi, "").trim();
      cleanText = cleanText.replace(/^"|"$/g, ''); // Remove wrapping quotes

      if (cleanText.length > 1) {
        return { comment: cleanText, sentiment: { pos: 0.5, neg: 0, sar: 0, ser: 0 } };
      }

      throw new Error("Empty or invalid AI response structure");
    } catch (e) {
      console.error("Critical AI Parse Error:", e, "Raw response:", responseText);
      return {
        comment: "[Tactical Error] AI response incomplete. Vui lòng thử lại.",
        sentiment: { pos: 0, neg: 0, sar: 0, ser: 1 }
      };
    }
  },

  async callRaw(userPrompt, systemPrompt, config, forceJson = false) {
    let responseText = "";
    switch (config.provider) {
      case 'gemini':
        responseText = await this.callGemini(userPrompt, systemPrompt, config.apiKey, config.model, forceJson);
        break;
      case 'openai':
        responseText = await this.callOpenAI(userPrompt, systemPrompt, config.apiKey, config.model, forceJson);
        break;
      case 'groq':
      default:
        responseText = await this.callGroq(userPrompt, systemPrompt, config.apiKey, config.model);
        break;
    }
    return responseText;
  },

  async callGroq(userPrompt, systemPrompt, apiKey, modelId) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId || "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" }
      })
    });
    return this.getChatCompletionText(response);
  },

  async callOpenAI(userPrompt, systemPrompt, apiKey, modelId, forceJson = true) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelId || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: forceJson ? { type: "json_object" } : undefined
      })
    });
    return this.getChatCompletionText(response);
  },

  async callGemini(userPrompt, systemPrompt, apiKey, modelId, forceJson = true) {
    const targetModel = modelId || "models/gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `SYSTEM: ${systemPrompt}\n\nUSER: ${userPrompt}${forceJson ? "\n\nIMPORTANT: START YOUR RESPONSE WITH {" : ""}` }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 5000
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Gemini link severed.");
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      // Check for safety blocks
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Payload blocked: ${data.promptFeedback.blockReason}`);
      }
      throw new Error("AI terminal returned no data.");
    }

    return data.candidates[0].content.parts[0].text.trim();
  },

  async getChatCompletionText(response) {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Lỗi kết nối tới AI Provider.");
    }
    const data = await response.json();
    return data.choices[0].message.content.trim();
  }
};
