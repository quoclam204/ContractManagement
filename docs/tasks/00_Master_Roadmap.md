# Master Roadmap - Hệ Thống Quản Lý Hợp Đồng Doanh Nghiệp (CLM)

Tiến độ tổng quan của dự án theo 4 Phase và mức độ ưu tiên.

## Các giai đoạn (Phases)
- [ ] **Phase 1 (Tuần 1-2): Nền tảng & CRUD cơ bản**
  - [ ] Thiết lập Modular Monolith skeleton, DB Migration.
  - [ ] Hoàn thiện User/Auth/RBAC.
  - [ ] Hoàn thiện CRUD Partner, Contract Type & Template.
  - [ ] Tích hợp API FE-BE: Đăng nhập -> Tạo hợp đồng nháp từ Template.
- [ ] **Phase 2 (Tuần 3-4): Vòng đời hợp đồng**
  - [ ] Hoàn thiện CRUD Contract đầy đủ.
  - [ ] Triển khai State Machine cho Contract.
  - [ ] Upload file/versioning qua IStorageProvider.
  - [ ] Tích hợp API FE-BE: Trình duyệt hợp đồng -> Approve/Reject.
- [ ] **Phase 3 (Tuần 5-6): Workflow, Ký số & AI**
  - [ ] Cấu hình Workflow (Definition/Step).
  - [ ] Tích hợp chữ ký điện tử (Mock/OTP).
  - [ ] Tích hợp AI Contract Assistant (Extract/Summary/Risk) qua RabbitMQ.
  - [ ] Tích hợp API FE-BE: Approved -> Ký (Mock) -> Active, Upload lấy phân tích AI.
- [ ] **Phase 4 (Tuần 7-8): Dashboard, Audit, Đóng gói**
  - [ ] Hoàn thiện Dashboard & Report.
  - [ ] Audit Trail & Notification.
  - [ ] Docker hóa (API, FE, SQL Server, MinIO, RabbitMQ, Seq).
  - [ ] Kiểm thử E2E vòng đời hợp đồng đầy đủ.

## Mức độ ưu tiên
- [ ] **Must Have**: Auth/RBAC, Contract CRUD + State Machine, Workflow, E-signature Mock, Upload storage, Hangfire, AI cơ bản, Audit log, Unit/Integration Test cho Core.
- [ ] **Should Have**: Outbox Pattern, Idempotent Consumer, Versioning Template/Workflow, Dashboard nâng cao, Health Check.
- [ ] **Stretch Goal**: VNPT-CA/VNeID, AI Q&A, AI so sánh hợp đồng, OpenTelemetry, Tách Microservices.
