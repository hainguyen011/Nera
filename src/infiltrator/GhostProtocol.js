/**
 * GhostProtocol - Human-like Interaction Simulation
 */
export const GhostProtocol = {
  async simulateTyping(element, text) {
    element.focus();
    
    for (let i = 0; i < text.length; i++) {
      // Giả lập lỗi gõ phím ngẫu nhiên (1% cơ hội)
      if (Math.random() < 0.01) {
        const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        this.dispatchKey(element, randomChar);
        await this.delay(50, 150);
        this.dispatchKey(element, 'Backspace');
        await this.delay(100, 200);
      }

      this.dispatchKey(element, text[i]);
      
      // Độ trễ ngẫu nhiên giữa các phím (Gaussian-like)
      const delay = this.getTypingDelay();
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Gửi sự kiện 'change' và 'input' để trang web nhận biết có dữ liệu mới
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },

  dispatchKey(element, key) {
    const opts = { key, bubbles: true };
    element.dispatchEvent(new KeyboardEvent('keydown', opts));
    element.dispatchEvent(new KeyboardEvent('keypress', opts));
    
    if (key === 'Backspace') {
      if (element.value) element.value = element.value.slice(0, -1);
      else if (element.innerText) element.innerText = element.innerText.slice(0, -1);
    } else {
      if (element.value !== undefined) element.value += key;
      else if (element.innerText !== undefined) element.innerText += key;
    }
    
    element.dispatchEvent(new KeyboardEvent('keyup', opts));
  },

  getTypingDelay() {
    const base = 100;
    const jitter = Math.random() * 150;
    return base + jitter;
  },

  delay(min, max) {
    return new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min));
  }
};
