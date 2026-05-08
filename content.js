/**
 * Nera Content Script - The Infiltrator
 * Phụ trách bóc tách DOM và tương tác với UI.
 */

class NeraInfiltrator {
  constructor() {
    this.observedPosts = new Set();
    this.init();
  }

  init() {
    console.log("Nera Infiltrator is scanning the network...");
    this.observeDOM();
  }

  observeDOM() {
    const observer = new MutationObserver((mutations) => {
      this.scanForPosts();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    this.scanForPosts();
  }

  scanForPosts() {
    // Heuristic: Tìm các container có khả năng là bài post
    // Facebook: role="article", X: [data-testid="tweet"], LinkedIn: .feed-shared-update-v2
    const selectors = [
      'div[role="article"]',
      'article[data-testid="tweet"]',
      '.feed-shared-update-v2',
      '.post-container' // Placeholder cho các trang khác
    ];

    selectors.forEach(selector => {
      const posts = document.querySelectorAll(selector);
      posts.forEach(post => {
        if (!this.observedPosts.has(post)) {
          this.injectNeraControl(post);
          this.observedPosts.add(post);
        }
      });
    });
  }

  injectNeraControl(postElement) {
    // Tiêm một nút "Nera Analyze" vào mỗi bài post
    const actionGroup = postElement.querySelector('[role="group"], .feed-shared-social-action-bar, [data-testid="reply"]');
    if (!actionGroup || postElement.querySelector('.nera-analyze-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'nera-analyze-btn';
    btn.innerText = '⚡ Nera AI';
    btn.style.cssText = `
      background: #00ff41;
      color: #000;
      border: none;
      border-radius: 4px;
      padding: 4px 8px;
      margin: 4px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 0 5px #00ff41;
    `;

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleAnalyze(postElement, btn);
    };

    actionGroup.appendChild(btn);
  }

  async handleAnalyze(postElement, btn) {
    btn.innerText = '⌛ Analyzing...';
    btn.style.opacity = '0.5';

    // Trích xuất text từ post
    const textContent = postElement.innerText;
    
    // Gửi yêu cầu phân tích về background
    chrome.runtime.sendMessage({
      type: "ANALYZE_POST",
      content: textContent
    }, (response) => {
      if (response && response.success) {
        this.performComment(postElement, response.comment);
        btn.innerText = '✅ Done';
      } else {
        btn.innerText = '❌ Error';
      }
    });
  }

  performComment(postElement, commentText) {
    console.log("Nera is attempting to comment:", commentText);
    
    // Tìm khung input comment
    const commentInput = postElement.querySelector('div[role="textbox"], textarea, input[type="text"]');
    if (commentInput) {
      commentInput.focus();
      
      // Giả lập gõ phím chân thực
      this.simulateTyping(commentInput, commentText);
    }
  }

  simulateTyping(element, text) {
    let i = 0;
    const typeNextChar = () => {
      if (i < text.length) {
        const char = text.charAt(i);
        const event = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: char,
          inputType: 'insertText'
        });
        
        // Cập nhật giá trị tùy theo loại element
        if (element.tagName === 'DIV') {
          element.innerText += char;
        } else {
          element.value += char;
        }
        
        element.dispatchEvent(event);
        i++;
        setTimeout(typeNextChar, Math.random() * 100 + 50); // Delay ngẫu nhiên 50-150ms
      } else {
        console.log("Typing completed. Manual submission required or automated click.");
      }
    };
    
    typeNextChar();
  }
}

new NeraInfiltrator();
