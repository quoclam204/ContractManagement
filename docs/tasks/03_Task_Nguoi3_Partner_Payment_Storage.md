# Nhiệm Vụ - Người 3 (Partner, Payment, Attachment, Storage)

## Core Interfaces (Làm sớm)
- [ ] Định nghĩa và publish interface `IStorageProvider` (UploadFile, GetFileUrl) ngay trong **Ngày 1**. Điều này giúp Người 2 (đính kèm hợp đồng) và Người 5 (lấy file cho AI) có interface để Mock và code tiếp mà không cần chờ bạn hoàn thiện logic upload thực tế.

## Partner/Customer Module
- [ ] Thiết kế entity: `PARTNERS` (Đặt trong Schema `Partner`).
- [ ] Viết Use Cases CRUD cho Đối tác/Khách hàng. Cung cấp API nội bộ (hoặc Service) để Module Contract có thể query thông tin Partner.

## Payment Module
- [ ] Thiết kế entity: `PAYMENTS` (Đặt trong Schema `Payment`).
- [ ] Viết Use Cases tạo và quản lý các đợt thanh toán theo hợp đồng (Liên kết qua `ContractId`).

## Attachment & Storage Module
- [ ] Thiết kế entity: `ATTACHMENTS` (Đặt trong Schema `Storage`).
- [ ] Triển khai ruột cho `IStorageProvider` sử dụng MinIO (Dev) / Azure Blob Storage (Production).
- [ ] Viết Use Cases Upload file đính kèm, quản lý versioning của file (PDF/Word).

## Giao diện & Testing
- [ ] Phát triển UI trong route/thư mục được giao (VD: `/features/partners`, `/features/payments`). Không can thiệp vào router gốc.
- [ ] Viết Integration Test cho luồng upload và tải file từ Storage (Testcontainers).
