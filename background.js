/**
 * Nera Background Service Worker
 * Xử lý các tác vụ ngầm và API calls.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log("Nera AI Agent has been successfully recruited.");
});

// Lắng nghe yêu cầu từ Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "ANALYZE_POST") {
    // Giả lập xử lý AI (Sẽ tích hợp API thực tế sau)
    analyzeWithAI(request.content)
      .then(comment => sendResponse({ success: true, comment }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Giữ channel mở cho async response
  }
});

async function analyzeWithAI(content) {
  // TODO: Tích hợp Groq/Gemini API
  // Tạm thời trả về comment mẫu dựa trên nội dung
  console.log("Analyzing content:", content);
  return `Đây là một góc nhìn rất thú vị! Cảm ơn bạn đã chia sẻ về "${content.substring(0, 20)}..."`;
}
