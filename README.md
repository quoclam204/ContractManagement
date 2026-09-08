# Enterprise Contract Lifecycle Management (CLM)

Hệ Thống Quản Lý Vòng Đời Hợp Đồng Doanh Nghiệp (CLM) - Nền tảng số hóa, quản lý mẫu biểu, quy trình phê duyệt đa cấp và tự động hóa theo dõi vòng đời hợp đồng.

---

## 🏛️ Kiến Trúc Hệ Thống (Clean Architecture)

Hệ thống được thiết kế theo tiêu chuẩn **Clean Architecture** (.NET 9 C# 13) kết hợp kiến trúc phân tầng (Bounded Context):

```text
ContractManagement/
├── backend/                                   # Solution Backend .NET 9
│   ├── ContractManagement.sln
│   ├── src/
│   │   ├── ContractManagement.Domain/         # Core Domain (Entities, Enums, State Machine)
│   │   ├── ContractManagement.Application/    # Use cases, DTOs, Business Interfaces, ApiResponse
│   │   ├── ContractManagement.Infrastructure/ # EF Core, AppDbContext, SQL Server, Persistence
│   │   └── ContractManagement.WebApi/         # REST API Controllers, Middlewares, Swagger
│   └── tests/
│       └── ContractManagement.Application.UnitTests/ # Unit Tests (xUnit, FluentAssertions)
├── frontend/                                  # Ứng dụng Web Client (React 19, TypeScript, Vite, Tailwind)
├── docs/                                      # Tài liệu dự án
│   ├── architecture/                          # Sơ đồ và tài liệu kiến trúc
│   ├── database/                              # database.sql và thiết kế CSDL
│   ├── requirements/                          # Tài liệu đặc tả yêu cầu (SRS)
│   ├── processes/                             # Quy chuẩn Git, Commit và Mẫu báo cáo hàng ngày
│   ├── tasks/                                 # Roadmap và phân công nhiệm vụ thành viên
│   └── git/                                   # Hướng dẫn tách Repository
├── CLAUDE.md                                  # Ngữ cảnh và quy chuẩn kỹ thuật cho AI
├── .cursorrules                               # Cấu hình quy tắc cho Cursor Editor
├── AGENTS.md                                  # Chỉ dẫn cho AI Agents
└── .gitignore                                 # Loại trừ tệp rác, build artifacts và caches
```

---

## 🚀 Khởi Chạy Dự Án (Quick Start)

### 1. Backend (.NET 9 Web API)

```bash
cd backend
dotnet restore
dotnet build
dotnet test
dotnet run --project src/ContractManagement.WebApi
```

Swagger UI truy cập tại: `https://localhost:7157/swagger` (hoặc cổng cấu hình trong `launchSettings.json`).

### 2. Frontend (React 19 + Vite)

```bash
cd frontend
npm install
npm run dev
```

Giao diện ứng dụng chạy tại: `http://localhost:5173`.

---

## 📋 Quy Chuẩn Kỹ Thuật (Engineering Standards)

1. **AI & Prompting Context**: Đọc kỹ [CLAUDE.md](CLAUDE.md) và [.cursorrules](.cursorrules) trước khi phát triển.
2. **Quy ước Commit**: Bắt buộc tuân thủ chuẩn **Conventional Commits** (Xem chi tiết tại [docs/processes/GIT_WORKFLOW_AND_COMMIT_GUIDE.md](docs/processes/GIT_WORKFLOW_AND_COMMIT_GUIDE.md)).
3. **Báo cáo hàng ngày**: Áp dụng mẫu tại [docs/processes/DAILY_REPORT_TEMPLATE.md](docs/processes/DAILY_REPORT_TEMPLATE.md).
4. **Hướng dẫn tách Repo**: Xem hướng dẫn tại [docs/git/SPLIT_REPO_GUIDE.md](docs/git/SPLIT_REPO_GUIDE.md).
