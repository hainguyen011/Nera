
# GitHub Sync Mission: handle_dom_recycling_and_lazy_load_persistence_plan

## Objective
Thực hiện đồng bộ hóa bản kế hoạch này lên GitHub bằng bộ công cụ **GitHub MCP**. Không sử dụng REST API thủ công. Đảm bảo bàn giao công việc mượt mà cho Human Developer.

## Steps for Agent
1. Chạy `mcp_github_create_branch` để tạo nhánh mới tên là `feat/handle-dom-recycling-and-lazy-load-persistence-plan`.
2. Đọc nội dung file `d:\I2FLabs\Tools\Nera\.aevum\domains\dominfiltration\features\stealth-infiltration-protocol\plans\handle_dom_recycling_and_lazy_load_persistence_plan.md` và sử dụng `mcp_github_push_files` hoặc `mcp_github_create_or_update_file` để đẩy file này lên nhánh vừa tạo.
3. Sử dụng `mcp_github_create_pull_request` để tạo một PR từ nhánh `feat/handle-dom-recycling-and-lazy-load-persistence-plan` vào nhánh mặc định (main/master) với tiêu đề "Sync Plan: handle_dom_recycling_and_lazy_load_persistence_plan".
4. **Bàn giao (Handoff):** Sau khi PR được tạo, hãy sử dụng `mcp_github_add_issue_comment` để viết một "Handoff Report" vào chính PR/Issue đó. 
   - Report bao gồm: Tóm tắt thay đổi, các điểm cần Human Reviewer lưu ý, và các câu hỏi mở (nếu có).
5. Cập nhật lại file `d:\I2FLabs\Tools\Nera\.aevum\domains\dominfiltration\features\stealth-infiltration-protocol\plans\handle_dom_recycling_and_lazy_load_persistence_plan.md` thêm metadata sau vào cuối file nếu chưa có:
   `<!-- aevum_github_branch: feat/handle-dom-recycling-and-lazy-load-persistence-plan -->`
6. Báo cáo hoàn thành cho User.

**Thực thi ngay lập tức.**
