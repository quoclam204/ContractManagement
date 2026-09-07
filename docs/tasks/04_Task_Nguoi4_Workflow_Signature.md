# Nhiệm Vụ - Người 4 (Workflow, Approval Step, E-Signature)

## Workflow & Approval Module (Giao tiếp qua Event để tránh conflict)
- [x] Thiết kế entity: `WORKFLOW_DEFINITIONS`, `WORKFLOW_STEPS`, `APPROVAL_STEPS` (Schema `Workflow`).
- [x] Viết Use Cases cấu hình Workflow (định nghĩa các bước duyệt, điều kiện duyệt theo giá trị hợp đồng).
- [ ] Xử lý logic đệ trình duyệt hợp đồng (Submit) và ra quyết định duyệt (Approve/Reject).
- [ ] **Tránh conflict logic:** Không được inject hay gọi trực tiếp vào Service của Contract. Khi tiến trình duyệt hoàn tất (Pass) hoặc bị Từ chối (Reject), hãy dùng MediatR **publish ra sự kiện**: 
  - `WorkflowApprovedEvent(ContractId)` 
  - `WorkflowRejectedEvent(ContractId, Reason)`. 
  - Người 2 sẽ chịu trách nhiệm bắt event này để đổi trạng thái hợp đồng.

## Signature Module
- [ ] Thiết kế entity: `SIGNATURES` (Schema `Workflow`).
- [ ] Định nghĩa interface `ISignatureProvider`. Triển khai MVP: Ký điện tử nội bộ qua Mock hoặc OTP.
- [ ] Sau khi tất cả các bên đã ký thành công, tiếp tục publish event `ContractSignedEvent(ContractId)`.
- [ ] (Stretch Goal) Tích hợp ký số thật VNPT-CA/VNeID.

## Giao diện & Testing
- [ ] Phát triển UI trong route/thư mục được giao (VD: `/features/workflows`). Xây dựng màn hình cấu hình luồng duyệt và màn hình danh sách chờ duyệt.
- [ ] Unit Test cho Approval Workflow (logic duyệt đúng trình tự, nhánh rẽ điều kiện hoạt động đúng).
