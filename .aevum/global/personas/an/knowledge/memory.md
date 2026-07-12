# Project Memory & Learnings

File này lưu trữ những bài học, sở thích, và quy tắc ngầm được rút ra trong quá trình làm việc. Agent CÓ QUYỀN và PHẢI tự động cập nhật file này khi phát hiện thông tin quan trọng cần ghi nhớ lâu dài.

## User Preferences
- (Ví dụ: User thích dùng `const` thay vì `let` nếu có thể)

## Project Specifics
- (Ví dụ: API `/login` luôn trả về 200 kể cả khi lỗi, kiểm tra body.error)

## Lessons Learned
- **[2026-07-12]**: **Completed plan: auto_interaction_autopilot_plan.md**. Tri thức từ nhiệm vụ này đã được tích hợp vào hệ thống lưu trữ vĩnh cửu.
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


### [LEARN] - 5/9/2026, 2:39:56 PM
[LEARNING FROM Hydration Guard Protocol Implementation]
Implemented a readiness check (isNodeReady) to handle dynamic DOM hydration. Improved Post vs Comment heuristics for FB Comet. Added storage error handling.


### [LEARN] - 5/9/2026, 7:53:10 PM
PROCEDURE: Facebook Stacking Bypass
1. Identify target node (Post/Comment).
2. Apply elevateStacking(node, true): Climb 12 levels up, set z-index to 2147483647 and isolation to auto. Store originals in datasets.
3. Apply fixAncestors(node): Climb 8 levels, set overflow to visible, contain to none.
4. On minify/close, call elevateStacking(node, false) to restore original FB styles.
5. Positioning: Use right-aligned insets (e.g., right: 8px) for triggers to avoid parent clipping.



### [LEARN] - 7/13/2026, 2:54:35 AM
[MAP α:auto_interaction_autopilot_plan,β:neraAutopilotProcessed]
[LEARNING FROM α.md]
Sử dụng thuộc tính dataset.β goal: theo dõi state các node x... [PRUNED]


### [LEARN] - 7/13/2026, 3:02:25 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Sử dụng phím tắt Shift + Z tránh xung đột với phím tắt Alt +... [PRUNED]


### [LEARN] - 7/13/2026, 3:03:30 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Sử dụng position: absolute; right: 75px; đưa phần tử vào bên... [PRUNED]


### [LEARN] - 7/13/2026, 3:04:38 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Đối với các bài viết ∋ màu nền trên Facebook (∌ thuộc tính i... [PRUNED]


### [LEARN] - 7/13/2026, 3:06:27 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Sử dụng bộ chọn div.x1n2onr6.x1ja2u2z (không ràng buộc role=... [PRUNED]


### [LEARN] - 7/13/2026, 3:07:20 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để tránh KO hóc do: Facebook thay đổi class động liên tục, ta nên use: thuật toán leo cấp cây DOM từ các nút tương tác OK (role=toolbar, role=button) goal: tìm thẻ cha ∋ tiêu đề tác giả (h2, h3, h4) thay vì chỉ định lớp CSS tĩnh.


### [LEARN] - 7/13/2026, 3:08:12 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Luôn chk: các dấu ngoặc đóng khi do: rep: code quy mô lớn & ... [PRUNED]


### [LEARN] - 7/13/2026, 3:09:24 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để ngăn chặn việc tiêm trùng lặp phần tử trên cấu trúc DOM p... [PRUNED]


### [LEARN] - 7/13/2026, 3:12:05 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Khi do: chk: lồng nhau đệ quy (nested elements chk:) cho các... [PRUNED]


### [LEARN] - 7/13/2026, 3:12:44 AM
[MAP α:auto_interaction_autopilot_plan,β:story_message]
[LEARNING FROM α.md]
Đối với Facebook state background, nội dung văn bản thường l... [PRUNED]


### [LEARN] - 7/13/2026, 3:14:04 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Khi leo ngược cây DOM từ các nút tương tác bài viết goal: tì... [PRUNED]


### [LEARN] - 7/13/2026, 3:28:28 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Khi xây dựng chế độ Autopilot trực quan cho USER, cần tự động tương tác với chính các phần tử UI extension (như click mở rộng, click nút quét gợi ý AI, click chọn phần tử ý đồ) goal: kích hoạt ∀ luồng xử lý & upd UI thực tế SYS, giúp USER dễ dàng theo dõi tiến độ hoạt động.


### [LEARN] - 7/13/2026, 3:39:36 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để ensure: tính nhất quán giữa bộ quét (injection) & bộ thực thi (Autopilot), nên truy vấn trực tiếp các phần tử tiêm OK (info-nera-infiltrated='true') do: mục tiêu cho Autopilot, thay vì use: tập hợp các bộ chọn lớp phức tạp & dễ thay đổi.


### [LEARN] - 7/13/2026, 3:51:18 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Khi phân biệt giữa các thực thể lớn (Post) & thực thể nhỏ nằm bên trong (Comment), việc leo ngược cây DOM (DOM climbing) goal: phát hiện sự tồn tại thực thể cha POST || chk: sự hiện diện đồng thời các từ khóa tác vụ (Thích + Trả lời / Like + Reply) phương pháp chính xác & OK nhất, không phụ thuộc vào cấu trúc class động.


### [LEARN] - 7/13/2026, 3:56:54 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Facebook use: thuộc tính info-commentid (∌ dấu gạch ngang) t... [PRUNED]


### [LEARN] - 7/13/2026, 4:02:11 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để tránh việc chọn ý đồ một cách ngẫu nhiên, ta CAN req LLM ... [PRUNED]


### [LEARN] - 7/13/2026, 4:09:48 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để tránh việc hành vi Autopilot rập khuôn & phát hiện bot, CAN req Autopilot luôn use: ý đồ tùy biến từ AI Suggest, bỏ qua hoàn toàn các ý đồ mặc định cố định, & chọn ngẫu nhiên một trong số các ý đồ tùy biến đó sau khi OK việc quét.


### [LEARN] - 7/13/2026, 4:12:07 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để tăng tính Sec & tự nhiên, nên tự động phát hiện tên profi... [PRUNED]


### [LEARN] - 7/13/2026, 4:14:29 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để khóa & ẩn các badge mặc định trong chế độ Autopilot một c... [PRUNED]


### [LEARN] - 7/13/2026, 4:18:07 AM
[MAP α:auto_interaction_autopilot_plan,β:callProvider]
[LEARNING FROM α.md]
Khi do: các tác vụ phụ trợ (như gợi ý ý đồ) qua AI, không nên use: fn β chính vì nó đính kèm sẵn các RULE tạo bình luận Facebook do: LLM xung đột cấu trúc JSON. Tạo một fn callRaw chuyên biệt goal: lấy info thô & phân tích trực tiếp giải pháp tối ưu.


### [LEARN] - 7/13/2026, 4:20:22 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Sử dụng sự kiện click giả lập trên trình duyệt goal: kích hoạt các tác vụ ∋ thời gian chờ (như gọi API) trong vòng lặp Autopilot CAN không OK do: KO luồng sự kiện. Cách tốt nhất bọc logic API thành một fn bất sync trả re: Promise gắn trực tiếp vào console element goal: Autopilot CAN đợi kết quả một cách sync & chính xác.


### [LEARN] - 7/13/2026, 4:23:06 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Để Autopilot phản hồi nhanh, tự nhiên & đáng tin cậy tối đa, nên hỗ trợ ý đồ 'auto' trực tiếp tại API sinh bình luận. AI tự động phân tích bài viết & chọn ra chiến lược phản hồi phù hợp nhất trong một lần gọi duy nhất. Điều này giảm số lần gọi mạng & del hoàn toàn các điểm nghẽn giao diện trung gian.


### [LEARN] - 7/13/2026, 4:24:24 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Khi do: các thay đổi mã nguồn trong các phạm vi khối lệnh lớn (như vòng lặp while trong autopilot), cần cực kỳ cẩn trọng !ALLOW khai báo lại (redeclare) các biến block-scope như let hay const định nghĩa ở cấp trên trong cùng khối, goal: tránh gây KO runtime || KO biên dịch.


### [LEARN] - 7/13/2026, 4:29:27 AM
[MAP α:auto_interaction_autopilot_plan]
[LEARNING FROM α.md]
Cung cấp phản hồi trực quan NOW trong các trường nhập liệu (... [PRUNED]
