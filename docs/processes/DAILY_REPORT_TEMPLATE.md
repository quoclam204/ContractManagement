# Mẫu Báo Cáo Tiến Độ Hàng Ngày (Daily Standup Report)

Áp dụng cho toàn bộ thành viên nhóm dự án Contract Management System. Báo cáo gửi lên nhóm chat hàng ngày trước **21:00**.

---

## 📌 Format Tin Nhắn Báo Cáo Chuẩn

```text
[BÁO CÁO TIẾN ĐỘ HÀNG NGÀY - DD/MM/YYYY]
Họ và tên: [Nguyễn Văn A]
Vai trò: [Người 2 - Contract, Template & State Machine]
Branch đang làm việc: [feat/person2-contract]

1. Hôm qua / Hôm nay đã hoàn thành:
   - [x] Tạo Clean Architecture layers cho Contract Module.
   - [x] API Tạo hợp đồng nháp (Draft) và validation ràng buộc dữ liệu (PR #12).
   - [x] Viết Unit test kiểm tra chuyển đổi trạng thái State Machine (Draft -> PendingApproval).

2. Kế hoạch ngày mai:
   - [ ] Tích hợp API Submit Approval với module Workflow của Người 4.
   - [ ] Tích hợp tải file đính kèm với MinIO Storage của Người 3.

3. Khó khăn / Vướng mắc (Blockers):
   - Không có (Hoặc: Cần Người 1 cấp mock JWT token quyền Approver để test phân quyền).

4. Link PR / Commit tham chiếu:
   - PR: https://github.com/quoclam204/ContractManagement/pull/12
   - Commit: feat(contract): implement draft creation and state machine transitions
```

---

## 💡 Lưu Ý Quan Trọng
* **Không báo cáo chung chung** (Ví dụ: *"Hôm nay em fix bug và chỉnh UI"* -> Bị từ chối).
* **Phải có bằng chứng kỹ thuật**: Gắn kèm link PR, mã Commit hoặc Unit Test kết quả.
* Nếu có khó khăn (Blocker), cần nêu rõ để Tech Lead hoặc thành viên liên quan hỗ trợ giải quyết ngay.
