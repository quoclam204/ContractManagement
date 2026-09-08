# Hướng Dẫn Tách Repository Riêng Biệt (Frontend & Backend)

Khi mentor hoặc đồ án yêu cầu phân tách độc lập thành 2 repository GitHub riêng biệt (`ContractManagement-Backend` và `ContractManagement-Frontend`), thực hiện theo các bước dưới đây.

---

## Cách 1: Đẩy thành 2 Repo Độc Lập Mới (Khuyên dùng)

### Bước A: Tạo Repo cho Backend
1. Trên GitHub cá nhân hoặc Tổ chức (Organization), tạo repo mới: `ContractManagement-Backend`.
2. Mở terminal tại thư mục `backend/`:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "feat(init): scaffold clean architecture solution with .NET 9"
   git branch -M main
   git remote add origin https://github.com/quoclam204/ContractManagement-Backend.git
   git push -u origin main
   ```

### Bước B: Tạo Repo cho Frontend
1. Trên GitHub, tạo repo mới: `ContractManagement-Frontend`.
2. Mở terminal tại thư mục `frontend/` (hoặc `fe-contractmgmt/`):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "feat(init): initialize react vite typescript client"
   git branch -M main
   git remote add origin https://github.com/quoclam204/ContractManagement-Frontend.git
   git push -u origin main
   ```

---

## Cách 2: Sử Dụng Git Subtree / Submodule (Nếu muốn giữ 1 Umbrella Repo)
Trong trường hợp vẫn muốn giữ 1 Repo chung để quản lý tài liệu và các sub-project giống như Image 4 của anh Thịnh:
* Root repo đóng vai trò là Orchestration workspace.
* Khai báo `.gitmodules` trỏ tới 2 submodules `backend` và `frontend`.
