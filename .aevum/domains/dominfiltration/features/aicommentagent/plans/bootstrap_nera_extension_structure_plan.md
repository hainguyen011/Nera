# Plan: Bootstrap_Nera_Extension_Structure

## Goal
Xây dựng bộ khung nền tảng cho Chrome Extension Nera, tập trung vào khả năng bóc tách DOM linh hoạt và tích hợp AI để tự động comment.

## User Review Required
> [!IMPORTANT]
> Cần xác định các trang web mục tiêu cụ thể (Facebook, X, LinkedIn, v.v.) để tối ưu hóa bộ nhận diện Selector. Hiện tại tôi sẽ triển khai theo hướng Heuristic (nhận diện theo đặc điểm chung).

## Proposed Changes

### [Chrome Extension Core]
#### [NEW] [manifest.json](file:///d:/Anton/vibe-resources/Nera/manifest.json)
- Khai báo Manifest v3.
- Cấp quyền `storage`, `activeTab`, `scripting`.
- Cấu hình `content_scripts` và `background`.

#### [NEW] [background.js](file:///d:/Anton/vibe-resources/Nera/background.js)
- Xử lý API calls tới AI model (để bảo mật API Key).
- Quản lý trạng thái bật/tắt của Extension.

#### [NEW] [content.js](file:///d:/Anton/vibe-resources/Nera/content.js)
- **DOM Infiltrator**: MutationObserver để phát hiện post mới.
- **Content Extractor**: Thu thập dữ liệu text từ post.
- **Action Performer**: Thực hiện simulate typing và clicking để comment.

#### [NEW] [popup.html](file:///d:/Anton/vibe-resources/Nera/popup.html)
- Giao diện điều khiển (On/Off, Tone selection cho AI).

## Steps
- [ ] Thiết lập `manifest.json`.
- [ ] Xây dựng `background.js` với cơ chế message passing.
- [ ] Triển khai `content.js` với module nhận diện bài viết (Post Detection).
- [ ] Tạo giao diện `popup.html` tối giản nhưng hiện đại.

## Verification Plan
- Load extension vào Chrome (`chrome://extensions`).
- Kiểm tra khả năng nhận diện post container trên một số trang social media.
- Test luồng gửi data từ Content Script về Background.


<!-- aevum_github_issue: 3 -->
<!-- aevum_github_branch: feat/bootstrap_nera_extension_structure_plan -->
