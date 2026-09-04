# Nhiệm Vụ - Người 5 (Dashboard, AI Assistant, Background Jobs, Notifications)

## Background Jobs & Notification (Giao tiếp qua Event để tránh conflict)
- [ ] Cấu hình Hangfire cho lịch quét định kỳ.
- [ ] Viết Job quét hợp đồng sắp hết hạn (Ví dụ: trước 30/15/7 ngày).
- [ ] **Tránh conflict logic:** Khi Job phát hiện hợp đồng tới hạn, tuyệt đối không gọi thẳng API update hợp đồng. Bạn chỉ làm nhiệm vụ Publish sự kiện `ContractExpiredEvent(ContractId, ExpireDate)` qua MediatR. Người 2 sẽ lo việc đổi state.
- [ ] Thiết kế entity: `NOTIFICATIONS` (Schema `Notification`). Tạo Event Handlers lắng nghe các Event chung của toàn hệ thống (như `ContractApprovedEvent`, `ContractExpiredEvent`) để lưu dữ liệu thông báo và push qua RabbitMQ/SignalR (In-app/Email).

## Dashboard & Audit
- [ ] Viết Use Cases thống kê số lượng, giá trị hợp đồng theo trạng thái, đối tác. (Được phép viết query join trực tiếp các bảng của module khác cho mục đích Report, hoặc xây dựng Read Model độc lập nếu cần thiết).
- [ ] Thiết kế entity: `AUDIT_LOGS` (Schema `Audit`). 
- [ ] **Tránh conflict code:** Implement cơ chế ghi Log bất biến một cách tự động (Dùng Global Action Filter, MediatR Pipeline Behavior hoặc override EF Core `SaveChanges`). Không bắt các thành viên khác phải thủ công gọi hàm `Log()` rải rác trong code của họ, giảm thiểu conflict khi ai cũng phải gọi hàm log.

## AI Contract Assistant Module
- [ ] Thiết kế entity: `AI_ANALYSIS_RESULTS` (Schema `AI`).
- [ ] Inject `IStorageProvider` (của Người 3) để lấy text từ file PDF/Word (Sử dụng OCR).
- [ ] Viết Use Cases gửi text cho AI (Claude/GPT-4o) phân tích tóm tắt, phát hiện rủi ro. 
- [ ] Gửi request này qua RabbitMQ để xử lý bất đồng bộ, không block luồng UI.

## Giao diện & Testing
- [ ] Phát triển UI (Dashboard thống kê, Màn hình phân tích AI) trong thư mục độc lập (VD: `/features/dashboard`).
- [ ] Test độ chuẩn xác của Prompt AI.
