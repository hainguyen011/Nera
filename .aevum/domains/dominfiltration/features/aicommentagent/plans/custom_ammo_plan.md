---
plan_name: custom_ammo_plan.md
domain: dominfiltration
feature: aicommentagent
version: "1.0.0"
status: in_progress
authors: ["Hawl (Hắc)"]
dependencies: ["ai_brain_integration_plan.md"]
---

# Plan: Custom Ammo (Custom Payloads) for Nera

::aevum-logo::

## 🎯 GOAL
Cho phép người dùng (Anh) tùy chỉnh "đạn" (system prompts/instructions) để Nera có thể thích ứng với nhiều kịch bản thâm nhập khác nhau.

## 🏗️ ARCHITECTURAL CONTEXT
- **Dynamic Prompt Injection**: Hệ thống sẽ ưu tiên các instruction tùy chỉnh từ người dùng trước các template mặc định.
- **Persistence Layer**: Lưu trữ cấu hình đạn trong `chrome.storage.local`.

## 🛠️ IMPLEMENTATION STEPS
- [x] **UI Update**: Thêm trường nhập Custom Prompt vào `popup.html`.
- [x] **Config Logic**: Cập nhật `popup.js` để handle dữ liệu mới.
- [x] **Prompt Engine**: Refactor `background.js` để tích hợp đạn custom vào Neural Core.
- [ ] **Multi-Provider Arsenal**: Hỗ trợ Groq, Gemini và OpenAI trong `popup.html` và `background.js`.

<!-- aevum_github_branch: feat/custom-ammo-plan -->