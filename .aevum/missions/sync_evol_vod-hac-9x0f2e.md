
# GitHub Sync Mission: evol_vod-hac-9x0f2e

## Objective
Thực hiện đồng bộ hóa bản nghiên cứu này lên GitHub bằng bộ công cụ **GitHub MCP**. Không sử dụng REST API thủ công. Đảm bảo bàn giao công việc mượt mà cho Human Developer.

## Steps for Agent
1. Chạy `mcp_github_create_branch` để tạo nhánh mới tên là `research/evolvod-hac-9x0f2e`.
2. Đọc nội dung file `d:\I2FLabs\Tools\Nera\.aevum\research\evol_vod-hac-9x0f2e.md` và sử dụng `mcp_github_push_files` hoặc `mcp_github_create_or_update_file` để đẩy file này lên nhánh vừa tạo.
3. Sử dụng `mcp_github_create_pull_request` để tạo một PR từ nhánh `research/evolvod-hac-9x0f2e` vào nhánh mặc định (main/master) với tiêu đề "Sync Research: evol_vod-hac-9x0f2e".
4. **Bàn giao (Handoff):** Sau khi PR được tạo, hãy sử dụng `mcp_github_add_issue_comment` để viết một "Handoff Report" vào chính PR/Issue đó. 
   - Report bao gồm: Tóm tắt thay đổi, các điểm cần Human Reviewer lưu ý, và các câu hỏi mở (nếu có).
5. Cập nhật lại file `d:\I2FLabs\Tools\Nera\.aevum\research\evol_vod-hac-9x0f2e.md` thêm metadata sau vào cuối file nếu chưa có:
   `<!-- aevum_github_branch: research/evolvod-hac-9x0f2e -->`
6. Báo cáo hoàn thành cho User.

**Thực thi ngay lập tức.**
