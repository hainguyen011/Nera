# Project Memory & Learnings

File này lưu trữ những bài học, sở thích, và quy tắc ngầm được rút ra trong quá trình làm việc. Agent CÓ QUYỀN và PHẢI tự động cập nhật file này khi phát hiện thông tin quan trọng cần ghi nhớ lâu dài.

## User Preferences
- (Ví dụ: User thích dùng `const` thay vì `let` nếu có thể)

## Project Specifics
- (Ví dụ: API `/login` luôn trả về 200 kể cả khi lỗi, kiểm tra body.error)

## Lessons Learned
- [YYYY-MM-DD]: Lỗi XYZ xảy ra do xung đột thư viện A và B.     


### [LEARN] - 5/8/2026, 11:45:11 PM
IMPORTANT: As of May 2026, the default model for Gemini in the Nera project must always be 'models/gemini-2.5-flash'. The previous model 'gemini-1.5-flash' is deprecated and no longer distributed. Always use 2.5-flash for all AIHub operations unless explicitly overridden by user config.


### [LEARN] - 5/9/2026, 11:15:51 AM
[DESIGN_PATTERN] Sequential Expansion: For complex injected UI in content scripts, always expand Width first (0.3s), then Height (0.3s-0.4s with 0.3s delay). This 'L-shaped' motion prevents content jumping and provides a premium 'tactical' feel. Collapsing should reverse the order (Height first, then Width).


### [LEARN] - 5/9/2026, 11:15:57 AM
[LEARNING FROM Refine Tactical Interface UI]
Successfully moved to a 'Ghost Bar' architecture. The UI is now non-intrusive by default and uses sequential CSS transitions for high-fidelity state changes. Technical debt check: Ensure Shadow DOM styles remain isolated as Facebook DOM continues to evolve.


### [LEARN] - 5/9/2026, 12:56:27 PM
[LEARNING FROM Expand Tactical Console UI with Sentiment Radar and Stealth Controls]
Expanding modular UI components in a Shadow DOM requires precise CSS and event binding. Using 'getRootNode()' is effective for accessing sibling elements within the shadow root from event listeners. Persisting state (like Stealth Level) directly from the field UI improves UX significantly compared to a separate settings page.
