/**
 * Humanizer - Mô phỏng hành vi và ngôn ngữ tự nhiên của con người
 */
export const Humanizer = {
  /**
   * Tạo lỗi đánh máy thông minh dựa trên bàn phím QWERTY
   */
  applyIntelligentTypos(text, rate = 0.05) {
    if (rate <= 0) return text;
    
    const qwertyNeighbors = {
      'a': 'qwsz', 's': 'awedxz', 'd': 'serfcx', 'f': 'drtgvc', 'g': 'ftyhbv',
      'h': 'gyujnb', 'j': 'huikmn', 'k': 'jiol', 'l': 'kop',
      'q': 'wa', 'w': 'qeas', 'e': 'wrsd', 'r': 'etdfg', 't': 'ryfgh',
      'y': 'tughj', 'u': 'yihjk', 'i': 'uojkl', 'o': 'ipkl', 'p': 'ol',
      'z': 'asx', 'x': 'zsdc', 'c': 'xdfv', 'v': 'cfgb', 'b': 'vghn',
      'n': 'bhjm', 'm': 'njk'
    };

    let result = "";
    for (let i = 0; i < text.length; i++) {
      const char = text[i].toLowerCase();
      if (qwertyNeighbors[char] && Math.random() < rate) {
        const neighbors = qwertyNeighbors[char];
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Giữ nguyên hoa/thường
        result += text[i] === text[i].toUpperCase() ? randomNeighbor.toUpperCase() : randomNeighbor;
      } else {
        result += text[i];
      }
    }
    return result;
  },

  /**
   * Chèn tiếng lóng (slang) tự nhiên dựa trên ngữ cảnh tiếng Việt
   */
  injectNaturalSlang(text, slangLevel = 'none') {
    if (slangLevel === 'none') return text;

    const fillerWords = ["nè", "á", "nhỉ", "ghê", "đó", "vậy", "ha", "thế"];
    const emphasisWords = {
        'low': ["thực sự", "khá là"],
        'medium': ["đỉnh", "cháy", "xịn"],
        'high': ["vcl", "vãi", "clm", "đm", "cháy phố"]
    };

    let modified = text;

    // 1. Thêm từ đệm ở cuối câu (30% cơ hội)
    if (Math.random() < 0.3 && !/[?!.]$/.test(text)) {
      const randomFiller = fillerWords[Math.floor(Math.random() * fillerWords.length)];
      modified = modified.replace(/([a-zA-Z])$/, `$1 ${randomFiller}`);
    }

    // 2. Chèn từ nhấn mạnh (tùy theo slangLevel)
    if (slangLevel !== 'none' && Math.random() < 0.4) {
      const options = emphasisWords[slangLevel] || emphasisWords['low'];
      const randomSlang = options[Math.floor(Math.random() * options.length)];
      
      // Chèn vào sau các từ như "rất", "quá", "thật"
      const targets = ["rất", "quá", "thật", "hơi"];
      for (const target of targets) {
        if (modified.includes(target)) {
           modified = modified.replace(target, `${target} ${randomSlang}`);
           break;
        }
      }
    }

    return modified;
  },

  /**
   * Tính toán độ trễ hành vi (ms) dựa trên độ dài văn bản
   * Giả lập thời gian đọc (200ms/từ) và thời gian gõ (150ms/ký tự)
   */
  calculateHumanDelay(text) {
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;
    
    const readTime = wordCount * 250; // 250ms per word
    const typeTime = charCount * 120; // 120ms per char
    
    // Thêm yếu tố ngẫu nhiên (suy nghĩ)
    const thinkingTime = 2000 + Math.random() * 5000;
    
    let totalDelay = readTime + typeTime + thinkingTime;
    
    // Giới hạn trong khoảng 5s - 25s
    return Math.min(Math.max(totalDelay, 5000), 25000);
  },

  /**
   * Làm mượt emoji (không để AI dùng quá máy móc)
   */
  humanizeEmojis(text, density = 'natural') {
    if (density === 'none') return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    if (density === 'heavy') {
        return text + " 🔥🔥🔥💯";
    }
    
    return text; // Giữ nguyên nếu là natural
  }
};
