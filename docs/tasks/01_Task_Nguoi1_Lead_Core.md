# Nhiệm Vụ - Người 1 (Lead, Core, Auth)

## Thiết lập & Kiến trúc (Constitution)
- [ ] Chốt và setup cấu trúc thư mục Clean Architecture theo chuẩn Bounded Context (Modular Monolith) để cô lập code, tránh conflict giữa các thành viên.
- [ ] Khởi tạo solution .NET 10. Thiết lập EF Core: Tạo `ContractManagementDbContext` (1 DbContext duy nhất). **Quy định DB: Chỉ Lead (Người 1) được quyền gom code Entity và chạy `Add-Migration` định kỳ. Các thành viên khác chỉ tạo Entity class và Configuration, tuyệt đối không tự chạy migration để tránh hỏng lịch sử DB.**
- [ ] Setup **MediatR** làm nền tảng cho Event-Driven (Pub/Sub) giữa các module để giảm kết dính logic. Định nghĩa các base interface `IDomainEvent`.
- [ ] Cấu hình CI/CD cơ bản, cấu hình Docker Compose (SQL Server, RabbitMQ, Seq, MinIO).
- [ ] Cấu hình Serilog, Seq, Correlation ID, Health Checks.

## Identity & Auth Module (Được ưu tiên làm trước)
- [ ] Thiết kế entity: `USERS`, `DEPARTMENTS`. 
- [ ] Cung cấp Interface `ICurrentUserService` (lấy User ID đang đăng nhập) thật sớm để các thành viên khác có cái dùng khi lưu dữ liệu.
- [ ] Tích hợp JWT Authentication.
- [ ] Thiết lập phân quyền RBAC (Admin / Manager / Staff / Approver).
- [ ] Viết Use Cases / Services cho Đăng nhập, Quản lý User, Quản lý Department.

## Giao diện (UI) & Phân quyền
- [ ] Thiết lập khung Layout gốc cho Frontend (Main Router, Sidebar Menu, Base Layout).
- [ ] **Quy định UI:** Phân bổ các không gian làm việc (Router, Folder) cụ thể cho từng người (VD: Người 2 code ở thư mục `/src/features/contracts`). Các thành viên chỉ code trong thư mục của mình.
- [ ] Phát triển UI demo flow đăng nhập / phân quyền.

## Testing & Support
- [ ] Unit Test cho luồng Authorization (RBAC).
- [ ] Hỗ trợ review code, kiểm soát PR và Merge vào nhánh chính (Đứng ra giải quyết conflict nếu các nhánh dẫm lên nhau).
