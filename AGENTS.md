# HIẾN PHÁP HỆ THỐNG CHỈ DẪN AI (AGENTS MASTER CONSTITUTION)
## Enterprise Contract Lifecycle Management (CLM) System
> **Single Source of Truth (SSOT)**: Toàn bộ các AI Agents (Claude Code, Cursor, Copilot, Gemini, Roo Code) và Developers bắt buộc phải tuân thủ nghiêm ngặt tài liệu này trước khi phân tích, sinh mã hoặc chỉnh sửa bất kỳ thành phần nào trong dự án.

---

## 1. TRIẾT LÝ PHÁT TRIỂN: SPEC-DRIVEN & AI-DRIVEN DEVELOPMENT

1. **Không code mò, không bịa đặt (No Hallucination)**:
   * AI không được tự ý sáng tác kiến trúc, cấu trúc thư mục mới, hoặc thêm các thư viện bên ngoài khi chưa có yêu cầu.
   * Mọi dòng code sinh ra phải bắt nguồn từ Tài liệu Đặc tả (Specs) có sẵn trong dự án:
     - Đặc tả cơ sở dữ liệu: `docs/database/database.sql`
     - Đặc tả yêu cầu phần mềm: `docs/requirements/`
     - Phân công công việc & Bounded Contexts: `docs/tasks/`
2. **Quy trình chuẩn khi AI thực hiện một Task (Standard Execution Workflow)**:
   * **Bước 1 (Analyze)**: Đọc file task tương ứng trong `docs/tasks/` và xem xét các layer liên quan.
   * **Bước 2 (Design)**: Định hình các thay đổi theo đúng phân tầng Clean Architecture.
   * **Bước 3 (Implement)**: Viết code sạch, không tạo file rác/boilerplate.
   * **Bước 4 (Test)**: Viết Unit Test xác minh logic nghiệp vụ (Domain / Application).
   * **Bước 5 (Commit)**: Đóng gói bằng Conventional Commits.

---

## 2. KIẾN TRÚC HỆ THỐNG: CLEAN ARCHITECTURE (.NET 9 / C# 13)

Cấu trúc Solution `backend/ContractManagement.sln` được phân tầng nghiêm ngặt:

```text
backend/ContractManagement.sln
├── src/
│   ├── ContractManagement.Domain/                 # [LÕI] Entities, Value Objects, Enums, Domain Exceptions, State Machine
│   ├── ContractManagement.Application/            # [NGHIỆP VỤ] DTOs, Use Cases, Interfaces, Services, ApiResponse<T>
│   ├── ContractManagement.Infrastructure/         # [HẠ TẦNG] EF Core 9, AppDbContext, SQL Server, MinIO/Storage, Background Jobs
│   └── ContractManagement.WebApi/                 # [GIAO TIẾP] REST Controllers, Middlewares, DI Setup, Swagger/OpenAPI
└── tests/
    └── ContractManagement.Application.UnitTests/  # [KIỂM THỬ] Unit tests (xUnit, FluentAssertions)
```

### Ranh Giới Giữa Các Tầng (Strict Layer Boundaries):
* **Domain Layer (Tuyệt đối cô lập)**:
  * CHỈ chứa C# thuần túy (POCO).
  * **CẤM**: Không tham chiếu bất kỳ project nào khác, không tham chiếu EF Core hay các package bên thứ ba (ngoại trừ System.ComponentModel.DataAnnotations cơ bản nếu cần).
  * Đóng gói toàn bộ logic State Machine và ràng buộc dữ liệu trực tiếp trong Entity.
* **Application Layer**:
  * Chỉ tham chiếu **Domain**.
  * Chứa DTOs, các Service/Command/Query Handlers, và các Interfaces trừu tượng (`IAppDbContext`, `ICurrentUserService`, `IStorageService`).
  * Không chứa chi tiết triển khai công nghệ (như SQL cụ thể, kết nối MinIO, v.v.).
* **Infrastructure Layer**:
  * Tham chiếu **Application** và **Domain**.
  * Triển khai cụ thể các interface từ Application: `AppDbContext` kế thừa `IAppDbContext`, cấu hình Fluent API, gọi SQL Server.
* **WebApi Layer (Presentation)**:
  * Tham chiếu **Infrastructure** và **Application**.
  * **Controllers phải mỏng (Thin Controllers)**: Chỉ nhận HTTP Request, gọi tầng Application/DbContext, và trả về kết quả chuẩn hóa `ApiResponse<T>`. Tuyệt đối không viết logic nghiệp vụ phức tạp trong Controller.

---

## 3. ĐẶC TẢ VÒNG ĐỜI HỢP ĐỒNG (CONTRACT STATE MACHINE)

Hợp đồng tuân theo 8 trạng thái bất biến từ `0` đến `7` (Enum `ContractStatus`):
* `Draft (0)`: Soạn thảo nháp.
* `PendingApproval (1)`: Đã trình duyệt, chờ cấp quản lý duyệt.
* `Approved (2)`: Đã duyệt, chuyển sang chờ các bên ký số.
* `Signed (3)`: Đã ký số thành công.
* `Active (4)`: Đang có hiệu lực pháp lý (khi đến ngày `EffectiveDate`).
* `Expiring (5)`: Sắp hết hạn (cảnh báo trước 30/15/7 ngày).
* `Renewed (6)`: Đã được gia hạn (thông qua phụ lục hợp đồng).
* `Terminated (7)`: Đã thanh lý hoặc chấm dứt hiệu lực trước hạn.

> [!CAUTION]
> **Quy Tắc Chuyển Đổi Trạng Thái**:
> Tuyệt đối không gán trạng thái tự do bằng code như `contract.Status = ContractStatus.Approved;`.
> Mọi thay đổi trạng thái bắt buộc phải thông qua các Domain Method đã được đóng gói kiểm tra điều kiện trong [Contract.cs](file:///d:/project/ContractManagement/backend/src/ContractManagement.Domain/Entities/Contract.cs):
> `SubmitForApproval()`, `MarkAsApproved()`, `MarkAsRejected()`, `MarkAsSigned()`, `Activate()`, `MarkAsExpiring()`, `MarkAsRenewed()`, `Terminate()`.

---

## 4. QUY CHUẨN VIẾT CODE & THIẾT KẾ API

### 1. Chuẩn C# / .NET
* **Đặt tên (Naming Conventions)**:
  * `PascalCase`: Classes, Records, Interfaces (`IContractService`), Methods, Properties, Enums.
  * `camelCase`: Biến cục bộ, tham số hàm.
  * `_camelCase`: Private fields (ví dụ: `private readonly AppDbContext _context;`).
* **Bất đồng bộ (Async/Await)**:
  * Mọi thao tác I/O (Database, Network, File) **bắt buộc** dùng `async/await` và truyền `CancellationToken cancellationToken = default`.
* **Định dạng phản hồi API chuẩn (Standard ApiResponse)**:
  * Mọi API endpoint thành công hoặc thất bại nên trả về cấu trúc đồng nhất:
    ```csharp
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();
    }
    ```
* **Không sinh code rác (Zero Boilerplate Tolerance)**:
  * Tuyệt đối không sinh ra hoặc để lại các file template thừa như `WeatherForecast.cs`, `Class1.cs`, hay các comment sáo rỗng.

### 2. Chuẩn Frontend (React 19, TypeScript, Tailwind CSS)
* Đặt trong thư mục `frontend/`.
* Cấu trúc module hóa theo tính năng (Feature-based folder structure):
  `frontend/src/features/{feature_name}/components/`, `services/`, `types.ts`.
* Giao diện phong cách Enterprise B2B SaaS hiện đại, clean, không lạm dụng emoji, dùng icon từ `lucide-react`.

---

## 5. QUY CHUẨN GIT COMMIT (CONVENTIONAL COMMITS)

Mọi commit từ AI hoặc Developer phải tuân theo đúng định dạng:

```text
<type>(<scope>): <mô tả ngắn bằng tiếng Anh ở thể mệnh lệnh, chữ thường, không chấm cuối>

[Chi tiết thay đổi nếu có]
```

### Các Types hợp lệ:
* `feat`: Thêm tính năng mới (ví dụ: `feat(contract): implement submit draft for approval`)
* `fix`: Sửa lỗi hệ thống (ví dụ: `fix(auth): correct token validation timestamp`)
* `refactor`: Tái cấu trúc mã nguồn không làm đổi tính năng (ví dụ: `refactor(domain): encapsulate status transitions inside contract entity`)
* `test`: Bổ sung hoặc cập nhật unit/integration test (ví dụ: `test(contract): add unit tests for state machine transitions`)
* `style`: Chỉnh sửa UI, format code, css (ví dụ: `style(ui): improve contract list table responsiveness`)
* `docs`: Cập nhật tài liệu (ví dụ: `docs: update agent constitution and system guidelines`)
* `chore`: Cập nhật cấu hình, build script, dependencies (ví dụ: `chore: purge build caches and update ignore rules`)

---

## 6. DANH MỤC TÀI LIỆU DỰ ÁN CẦN TRA CỨU

Khi cần ngữ cảnh chi tiết, AI hãy đọc trực tiếp các tài liệu sau:
* **Tài liệu CSDL**: [docs/database/database.sql](file:///d:/project/ContractManagement/docs/database/database.sql)
* **Quy trình báo cáo**: [docs/processes/DAILY_REPORT_TEMPLATE.md](file:///d:/project/ContractManagement/docs/processes/DAILY_REPORT_TEMPLATE.md)
* **Quy chuẩn Git & Commit**: [docs/processes/GIT_WORKFLOW_AND_COMMIT_GUIDE.md](file:///d:/project/ContractManagement/docs/processes/GIT_WORKFLOW_AND_COMMIT_GUIDE.md)
* **Tách Repo (FE & BE)**: [docs/git/SPLIT_REPO_GUIDE.md](file:///d:/project/ContractManagement/docs/git/SPLIT_REPO_GUIDE.md)
* **Phân công nhiệm vụ theo vai trò**:
  - Người 1 (Lead, Core, Auth): `docs/tasks/01_Task_Nguoi1_Lead_Core.md`
  - Người 2 (Contract, Template, State Machine): `docs/tasks/02_Task_Nguoi2_Contract.md`
  - Người 3 (Partner, Payment, MinIO Storage): `docs/tasks/03_Task_Nguoi3_Partner_Payment_Storage.md`
  - Người 4 (Workflow Phê duyệt, Ký số Mock): `docs/tasks/04_Task_Nguoi4_Workflow_Signature.md`
  - Người 5 (Dashboard KPI, AI Background Job): `docs/tasks/05_Task_Nguoi5_Dashboard_AI_Job.md`
