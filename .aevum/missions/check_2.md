
# GitHub Check Mission: architecture_refactor_v1_plan

## Objective
Kiểm tra trạng thái phê duyệt (Approval) của PR/Issue liên quan đến kế hoạch này bằng **GitHub MCP**.

## Steps for Agent
1. Sử dụng `mcp_github_get_pull_request_status`, `mcp_github_get_issue` hoặc `mcp_github_get_pull_request_reviews` với Issue/PR number là `2` để xem tiến trình review.
2. Kiểm tra xem có label `approved` hoặc có Review nào đánh giá "APPROVED" hay không.
3. Nếu đã được duyệt: 
   - Đọc và phân tích các comment của Human Reviewer.
   - Cập nhật file `d:\I2FLabs\Tools\Nera\.aevum\domains\dominfiltration\features\aicommentagent\plans\architecture_refactor_v1_plan.md` thêm dòng metadata `<!-- aevum_status: approved -->` vào cuối file nếu chưa có.
4. Báo cáo tình hình Review cho User.

**Thực thi ngay lập tức.**
