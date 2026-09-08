# Quy Chuẩn Git Workflow & Conventional Commits

Tài liệu hướng dẫn quy chuẩn làm việc với Git và quy ước đặt tên Commit Message cho toàn bộ thành viên dự án CLM.

---

## 1. Quy Chuẩn Commit Message (Conventional Commits)

Format chuẩn:
```text
<type>(<scope>): <mô tả ngắn bằng tiếng Anh, thể mệnh lệnh, không viết hoa chữ đầu, không chấm cuối>

[Thân commit chi tiết - Tùy chọn]
```

### Bảng các Types được chấp nhận:

| Type | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `feat` | Thêm tính năng mới | `feat(contract): implement submit contract for approval` |
| `fix` | Sửa lỗi hệ thống | `fix(auth): handle expired jwt token gracefully` |
| `refactor` | Tái cấu trúc mã nguồn (không đổi logic/tính năng) | `refactor(domain): separate contract entity into aggregate root` |
| `style` | Thay đổi định dạng code, UI styling | `style(ui): align table columns and improve badge contrast` |
| `test` | Thêm hoặc sửa Unit/Integration tests | `test(contract): add tests for invalid status transition` |
| `docs` | Thay đổi tài liệu | `docs: add clean architecture diagram and setup guide` |
| `chore` | Cập nhật cấu hình, build tool, dependencies | `chore: update ef core packages to version 9.0` |

### Các quy tắc bắt buộc:
1. **Không commit tiếng Việt không dấu hoặc cảm tính**:
   * ❌ `style: lam giao dien dep 10/10`
   * ❌ `update code`
   * ❌ `fix bug`
   * ✅ `feat(contract): add contract rejection flow with audit comment`
2. **Commit nhỏ và có ý nghĩa**: Mỗi commit giải quyết một đơn vị công việc hoàn chỉnh (atomic commit).

---

## 2. Quy Trình Phân Nhánh (Branching Strategy)

* `main`: Nhánh production. Chỉ Lead mới có quyền merge vào nhánh này thông qua Pull Request (PR).
* `develop`: Nhánh tích hợp chung.
* `feat/<tên-tính-năng>`: Nhánh làm tính năng mới của từng thành viên.
  * Ví dụ: `feat/person2-contract-crud`, `feat/person1-auth-jwt`.
* `fix/<tên-lỗi>`: Nhánh sửa lỗi cấp tốc.

### Quy trình tạo PR:
1. Kéo code mới nhất từ nhánh `develop`: `git pull origin develop`.
2. Chạy test cục bộ đảm bảo `0 errors, 0 failed tests`.
3. Tạo Pull Request trên GitHub, tag Lead hoặc người phụ trách vào Review.
4. Sau khi được Approve ít nhất 1 người, mới tiến hành Merge.
