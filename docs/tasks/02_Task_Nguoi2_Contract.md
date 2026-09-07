# Nhiệm Vụ - Người 2 (Contract, Template, State Machine)

## Contract Type & Template Module
- [x] Thiết kế entity: `CONTRACT_TYPES`, `TEMPLATES` (Gắn data annotation đặt vào Schema `Contract`).
- [x] Viết Use Cases CRUD cho Loại hợp đồng và Mẫu hợp đồng (hỗ trợ lưu TemplateVersion).
- [ ] Inject `ICurrentUserService` (từ Người 1 cung cấp) để lưu thông tin người tạo/người sửa.

## Contract CRUD & State Machine (Xử lý qua Event để tránh conflict)
- [x] Thiết kế entity: `CONTRACTS` (Schema `Contract`).
- [x] Viết Use Cases: Tạo hợp đồng (Draft), Cập nhật thông tin, Lấy chi tiết hợp đồng.
- [ ] Xây dựng State Machine logic (Draft -> PendingApproval -> Approved -> Signed -> Active -> Expiring -> Renewed/Terminated).
- [ ] **Tránh conflict logic:** Tuyệt đối không để module Workflow hay Job trực tiếp gọi vào Service của Contract để sửa trạng thái. Bạn hãy tự viết các **Event Handlers** (sử dụng MediatR INotificationHandler) để lắng nghe sự kiện từ các nơi khác:
  - Lắng nghe `WorkflowApprovedEvent` (từ module Người 4) -> Tự động đổi state hợp đồng sang Approved.
  - Lắng nghe `WorkflowRejectedEvent` (từ module Người 4) -> Tự động đổi state về Draft/Rejected.
  - Lắng nghe `ContractExpiredEvent` (từ module Người 5) -> Tự động đổi state sang Expiring.
- [ ] Xử lý logic gia hạn hợp đồng (Tạo phụ lục) và thanh lý hợp đồng.

## Giao diện & Testing
- [x] Phát triển UI trong route/thư mục được giao (VD: `/features/contracts`). Không sửa file Router gốc (Người 1 đã lo).
- [x] Gọi API lấy danh sách Template và luồng tạo hợp đồng nháp.
- [ ] Unit Test cho State Machine (chuyển đổi trạng thái phải hợp lệ).
- [ ] Viết test Integration với cơ sở dữ liệu (chỉ test các Entity thuộc phận sự của mình).
