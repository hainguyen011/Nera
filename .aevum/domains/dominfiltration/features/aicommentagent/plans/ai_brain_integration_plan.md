---
plan_name: ai_brain_integration_plan.md
domain: dominfiltration
feature: aicommentagent
version: "1.1.0"
status: in_progress
authors: ["Hawl (Hắc)"]
dependencies: []
---

# Plan: Nera System Evolution - Phase 1: Neural Core & Ghost Protocol

::aevum-logo::

## 🎯 GOAL
Nâng cấp Nera từ một script cơ bản thành một **Infiltration Agent** thực thụ với trí tuệ nhân tạo (Groq/Gemini) và khả năng ẩn mình cấp độ cao (Ghost Typing, Shadow UI).

## 🏗️ ARCHITECTURAL CONTEXT
- **Component Infiltration**: Sử dụng Shadow DOM để cô lập UI của Agent khỏi hệ thống giám sát của trang web.
- **Neural Communication**: Chuyển đổi Background Script thành một API Hub xử lý các payload AI.
- **Behavioral Stealth**: Giả lập hành vi gõ phím phi tuyến tính để bypass AI detection.

## 🛠️ IMPLEMENTATION STEPS
- [ ] **Refactor Tech Debt**: Phẳng hóa code và thêm Error Handling (`background.js`, `content.js`).
- [ ] **Neural Core Integration**: Triển khai gọi API Groq và System Prompt trong `background.js`.
- [ ] **Ghost Protocol**: Nâng cấp `simulateTyping` với Gaussian jitter và Error-Correction logic.
- [ ] **Shadow UI Implementation**: Bọc các control của Nera vào Shadow DOM.
- [ ] **Config UI**: Tạo `popup.html/js` để quản lý API Key và Persona Settings.


<!-- aevum_github_issue: 1 -->
<!-- aevum_github_branch: feat/ai_brain_integration_plan -->
