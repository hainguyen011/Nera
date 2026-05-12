
# GitHub Agent Review Mission: ai_brain_integration_plan

## Objective
Thực hiện đánh giá kỹ thuật (Peer Review) cho Pull Request #1 bằng **GitHub MCP**. Agent đóng vai trò là một Senior Reviewer để đảm bảo chất lượng code và tuân thủ kiến trúc Aevum.

## Steps for Agent
1. Sử dụng `mcp_github_get_pull_request_files` để xem danh sách file thay đổi trong PR #1.
2. Đọc nội dung các file thay đổi quan trọng bằng `mcp_github_get_file_contents`.
3. So sánh các thay đổi với bản kế hoạch gốc tại `d:\I2FLabs\Tools\Nera\.aevum\domains\dominfiltration\features\aicommentagent\plans\ai_brain_integration_plan.md`.
4. Thực hiện review dựa trên các tiêu chí:
   - Logic Integrity: Thuật toán có đúng đắn không?
   - Tech Debt Risk: Có tạo ra nợ kỹ thuật không?
   - Security Posture: Có lỗ hổng bảo mật nào không?
5. Sử dụng `mcp_github_create_pull_request_review` để gửi review lên GitHub.
   - Sử dụng template "AEVUM AGENT PEER REVIEW" (có thể tham khảo cấu trúc trong GitHubService.getPeerReviewTemplate).
   - Quyết định trạng thái: `APPROVE`, `REQUEST_CHANGES`, hoặc `COMMENT`.
6. Báo cáo kết quả review cho User.

**Thực thi ngay lập tức.**
