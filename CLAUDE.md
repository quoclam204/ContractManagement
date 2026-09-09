# Contract Management System (CLM) — Backend

> Hệ thống Quản lý Vòng đời Hợp đồng Doanh nghiệp.
> File này là **Constitution** (Bước 0) — mọi AI Agent và thành viên nhóm phải tuân theo khi sinh code.

## Project Context

Hệ thống CLM giúp doanh nghiệp số hóa toàn bộ vòng đời hợp đồng: soạn thảo, phê duyệt, ký kết, theo dõi thực thi, gia hạn/thanh lý. Bổ sung trợ lý AI đọc và phân tích hợp đồng, giảm rủi ro pháp lý.

Kiến trúc: **Modular Monolith** theo **Clean Architecture** — 4 project, phân chia 8 module theo folder bên trong mỗi tầng. Đội 5 người, tập trung backend .NET, mỗi sprint phải có ít nhất 1 flow end-to-end demo được.

## Tech Stack

- **.NET 10** / C# 14
- **ASP.NET Core Web API** — Controllers (thin) → Application Service/Use Case → Domain → Infrastructure
- **Entity Framework Core 10** + **SQL Server** (1 DbContext duy nhất: `ContractManagementDbContext`, phân chia module bằng folder/namespace)
- **MediatR** — **không bắt buộc**. Ưu tiên Application Service / Use Case class thuần (dễ trace, dễ debug). Thành viên quen MediatR/CQRS có thể dùng cho module của mình, miễn nhất quán trong module đó
- **FluentValidation** — request validation
- **Hangfire** — scheduled background jobs (quét hợp đồng sắp hết hạn)
- **RabbitMQ** — async messaging cho Notification và AI Analysis
- **Serilog + Seq** — structured logging + log tập trung
- **Correlation ID** — gắn xuyên suốt request/flow (kể cả qua RabbitMQ)
- **Health Checks** — cho API, DB, RabbitMQ, Storage
- **Storage abstraction** (`IStorageProvider`) — Dev: MinIO, Production: Azure Blob Storage
- **Signature abstraction** (`ISignatureProvider`) — MVP: Mock/OTP nội bộ, Stretch Goal: VNPT-CA/VNeID
- **xUnit + Testcontainers** — testing (SQL Server container thật, không dùng InMemory DB)

## Architecture

```
src/
  ContractManagement.Api/                    # Tầng Presentation — Controllers, Middleware, DI
    Controllers/
      Identity/                              # AuthController, UserController, DepartmentController
      Contract/                              # ContractController, ContractTypeController
      Partner/                               # PartnerController
      Workflow/                              # WorkflowController, ApprovalController
      Payment/                               # PaymentController
      Storage/                               # AttachmentController
      Notification/                          # NotificationController
      AI/                                    # AiAnalysisController
    Middleware/
      CorrelationIdMiddleware.cs
      ExceptionHandlingMiddleware.cs
    Program.cs
    appsettings.json

  ContractManagement.Application/            # Tầng Use Cases — Application Services, DTOs, Interfaces
    Common/
      Interfaces/                            # ICurrentUserService, IStorageProvider, ISignatureProvider
      DTOs/                                  # Shared DTOs (pagination, result pattern)
      Behaviors/                             # Validation pipeline (nếu dùng MediatR)
    Identity/
      DTOs/
      Interfaces/                            # IAuthService, ITokenService
      Services/                              # AuthService, UserService, DepartmentService
    Contract/
      DTOs/
      Interfaces/
      Services/                              # ContractService, ContractTypeService
    Partner/
      DTOs/
      Interfaces/
      Services/
    Workflow/
      DTOs/
      Interfaces/
      Services/                              # WorkflowService, ApprovalService
    Payment/
      DTOs/
      Interfaces/
      Services/
    Storage/
      DTOs/
      Interfaces/
      Services/
    Notification/
      DTOs/
      Interfaces/
      Services/
    AI/
      DTOs/
      Interfaces/
      Services/

  ContractManagement.Domain/                 # Tầng Core — Entities, Enums, Domain Events, Business Rules
    Common/
      BaseEntity.cs                          # Base class (Id, CreatedAt, UpdatedAt)
      IDomainEvent.cs
    Identity/
      Entities/                              # User, Department
      Enums/                                 # UserRole (Admin, Manager, Staff, Approver)
    Contract/
      Entities/                              # Contract, ContractType
      Enums/                                 # ContractStatus (Draft, PendingApproval, Approved, Signed, Active, Expiring, Renewed, Terminated)
      Events/                               # ContractSubmittedEvent, ContractApprovedEvent...
    Partner/
      Entities/                              # Partner
    Workflow/
      Entities/                              # WorkflowDefinition, WorkflowStep, ApprovalStep
      Enums/                                 # ApprovalDecision (Pending, Approved, Rejected)
    Payment/
      Entities/                              # Payment
      Enums/                                 # PaymentStatus (Pending, Paid, Overdue)
    Storage/
      Entities/                              # Attachment
    Signature/
      Entities/                              # Signature
      Enums/                                 # SignatureMethod (Mock, OTP, DigitalCA)
    Notification/
      Entities/                              # Notification
      Enums/                                 # NotificationType (ApprovalRequest, SignRequest, ExpiringSoon)
    AI/
      Entities/                              # AiAnalysisResult

  ContractManagement.Infrastructure/         # Tầng hạ tầng — EF Core, External Services, Messaging
    Persistence/
      ContractManagementDbContext.cs          # 1 DbContext duy nhất cho toàn bộ hệ thống
      Configurations/
        Identity/                            # UserConfiguration, DepartmentConfiguration
        Contract/                            # ContractConfiguration, ContractTypeConfiguration
        Partner/
        Workflow/
        Payment/
        Storage/
        Signature/
        Notification/
        AI/
      Migrations/
    Storage/
      MinioStorageProvider.cs                # IStorageProvider implementation
    Signature/
      MockSignatureProvider.cs               # ISignatureProvider — Mock/OTP
    Messaging/
      RabbitMqPublisher.cs                   # Publish events ra RabbitMQ
      Consumers/
        NotificationConsumer.cs              # Xử lý notification async
        AiAnalysisConsumer.cs                # Xử lý AI analysis async
    BackgroundJobs/
      ContractExpiryJob.cs                   # Hangfire job quét hợp đồng sắp hết hạn
    AI/
      AiContractAnalyzer.cs                  # Tích hợp Claude/GPT-4o API
    DependencyInjection.cs                   # Extension method đăng ký tất cả Infrastructure services

tests/
  ContractManagement.UnitTests/
    Identity/
    Contract/
    Workflow/
    ...
  ContractManagement.IntegrationTests/
    Fixtures/
    Identity/
    Contract/
    ...
```

### Layer Dependency Rules (Bắt buộc)

```
API Layer        → Application Layer, Infrastructure Layer (chỉ DI/composition root)
Application Layer → Domain Layer (CHỈ phụ thuộc tầng này)
Domain Layer     → Không phụ thuộc bất kỳ tầng/framework nào
Infrastructure   → Application Layer, Domain Layer
```

- **Domain Layer**: KHÔNG phụ thuộc EF Core, ASP.NET Core, hay bất kỳ framework nào. Chỉ chứa Entities, Value Objects, Enums, Domain Events, Business Rules.
- **Application Layer**: KHÔNG phụ thuộc Infrastructure. Định nghĩa Interfaces (Ports) để Infrastructure implement.
- **Infrastructure Layer**: Implement các Interfaces từ Application Layer. Chứa EF Core DbContext, RabbitMQ, MinIO, Hangfire, AI integration.
- **API Layer**: Controller mỏng — delegate toàn bộ logic cho Application Layer. Chỉ chứa DI setup, Middleware, và endpoint mapping.

### Data Flow (Luồng xử lý mặc định)

```
HTTP Request → Controller → Application Service / Use Case → Domain Entity → Infrastructure (DB/Queue/Storage) → Response DTO → HTTP Response
```

### Database

- **1 DbContext duy nhất**: `ContractManagementDbContext` — tất cả entity của mọi module đều được cấu hình trong cùng DbContext này.
- **SQL Server** — dùng schema `dbo` mặc định.
- **Migration**: CHỈ Lead (Người 1) được quyền chạy `Add-Migration`. Các thành viên khác tạo Entity class và Configuration, sau đó báo Lead gom migration.
- **Bảng dữ liệu**: `DEPARTMENTS`, `USERS`, `PARTNERS`, `WORKFLOW_DEFINITIONS`, `WORKFLOW_STEPS`, `CONTRACT_TYPES`, `CONTRACTS`, `APPROVAL_STEPS`, `SIGNATURES`, `PAYMENTS`, `ATTACHMENTS`, `AI_ANALYSIS_RESULTS`, `AUDIT_LOGS`, `NOTIFICATIONS`.

### 8 Bounded Contexts (Module theo folder)

Mỗi module là 1 thư mục bên trong mỗi tầng (Domain, Application, Infrastructure, Api), KHÔNG phải 1 project riêng:

| Module | Trách nhiệm | Bảng DB | Người phụ trách |
|---|---|---|---|
| **Identity** | Auth (JWT), RBAC, User, Department | USERS, DEPARTMENTS | Người 1 (Lead) |
| **Contract** | Contract CRUD, Contract Type & Template (versioning), State Machine | CONTRACTS, CONTRACT_TYPES | Người 2 |
| **Partner** | Quản lý đối tác/khách hàng | PARTNERS | Người 3 |
| **Payment** | Thanh toán theo đợt, công nợ | PAYMENTS | Người 3 |
| **Storage** | Upload file, versioning, IStorageProvider | ATTACHMENTS | Người 3 |
| **Workflow** | WorkflowDefinition/Step (config), ApprovalStep (runtime), Signature | WORKFLOW_DEFINITIONS, WORKFLOW_STEPS, APPROVAL_STEPS, SIGNATURES | Người 4 |
| **Notification** | Thông báo qua RabbitMQ consumer, email/in-app | NOTIFICATIONS | Người 5 |
| **AI** | AI Contract Assistant (Extract, Summary, Risk Analysis) | AI_ANALYSIS_RESULTS | Người 5 |

### State Machine hợp đồng

```
Draft → [Submit] → PendingApproval
PendingApproval → [Approve all steps] → Approved
PendingApproval → [Reject] → Draft
Approved → [Sign all parties] → Signed
Signed → [EffectiveDate reached] → Active
Active → [≤30 days to expiry] → Expiring
Expiring → [Renew] → Renewed → Active
Expiring/Active → [Terminate] → Terminated
```

### Module Communication

- Giữa các module trong cùng process: gọi trực tiếp qua Interface (inject Service từ module khác).
- Cho tác vụ async (Notification, AI Analysis): publish message qua **RabbitMQ**.
- **Outbox Pattern & Idempotent Consumer**: là Should Have, không bắt buộc MVP. MVP có thể publish trực tiếp sau commit, consumer check trạng thái trước khi xử lý.

## Coding Standards

- **C# 14 features** — primary constructors, collection expressions, records, pattern matching
- **File-scoped namespaces** — luôn luôn
- **`var` cho kiểu rõ ràng** — dùng explicit type khi kiểu không rõ từ context
- **Naming**: PascalCase cho public members, `_camelCase` cho private fields, suffix `Async` cho async methods
- **Namespace**: `ContractManagement.[Layer].[Module]` (ví dụ: `ContractManagement.Domain.Contract.Entities`)
- **Không dùng regions** — tuyệt đối
- **Không comment code hiển nhiên** — chỉ comment "tại sao", không comment "cái gì"
- **Internal by default** — Services, Handlers, Consumers dùng `internal` khi có thể

## Commands

```bash
# Build toàn bộ solution
dotnet build

# Chạy API (development)
dotnet run --project src/ContractManagement.Api

# Chạy toàn bộ test
dotnet test

# Chạy test cho project cụ thể
dotnet test tests/ContractManagement.UnitTests
dotnet test tests/ContractManagement.IntegrationTests

# Thêm EF Migration (CHỈ Lead chạy)
dotnet ef migrations add [Name] \
  --project src/ContractManagement.Infrastructure \
  --startup-project src/ContractManagement.Api \
  --context ContractManagementDbContext

# Áp dụng migrations
dotnet ef database update \
  --project src/ContractManagement.Infrastructure \
  --startup-project src/ContractManagement.Api \
  --context ContractManagementDbContext

# Format check
dotnet format --verify-no-changes
```

## Anti-patterns (KHÔNG được sinh code vi phạm)

- **KHÔNG** tạo nhiều DbContext (1 DbContext duy nhất cho toàn bộ hệ thống, phân chia bằng folder/namespace)
- **KHÔNG** tách module thành project riêng — phân chia module bằng folder bên trong mỗi tầng
- **KHÔNG** dùng `DateTime.Now` — inject `TimeProvider` hoặc `IDateTimeProvider`
- **KHÔNG** tạo `new HttpClient()` — dùng `IHttpClientFactory`
- **KHÔNG** dùng `async void` — luôn trả về `Task`
- **KHÔNG** block với `.Result` hoặc `.Wait()` — dùng `await`
- **KHÔNG** trả về Domain Entity từ API — luôn map sang Response DTO
- **KHÔNG** đặt business logic trong Controller — Controller chỉ gọi Application Service
- **KHÔNG** dùng InMemory database cho test — dùng Testcontainers với SQL Server container thật
- **KHÔNG** catch `Exception` chung — catch kiểu cụ thể, để global handler xử lý phần còn lại
- **KHÔNG** dùng string interpolation trong log — dùng structured logging template (`Log.Information("Processing {ContractId}", id)`)
- **KHÔNG** cho phép sửa hợp đồng đã ký (Signed/Active) — mọi thay đổi phải qua phụ lục (Addendum)
- **KHÔNG** tự ý chạy `Add-Migration` — chỉ Lead (Người 1) mới được chạy migration

## Workflow

- **Plan first** — lập kế hoạch trước khi code cho task phức tạp (3+ bước hoặc liên quan kiến trúc)
- **Verify before done** — chạy `dotnet build` và `dotnet test` sau khi thay đổi
- **Fix bugs autonomously** — khi có bug, tự điều tra và sửa
- **Stop and re-plan** — nếu implementation đi sai hướng, DỪNG LẠI và lập kế hoạch lại
- **1 flow demo mỗi sprint** — mỗi sprint (2 tuần) phải có ít nhất 1 flow end-to-end (có UI tối thiểu) demo được

## Testing Strategy

Ưu tiên cao nhất (phải test trước):
1. **State Machine hợp đồng** — kiểm thử mọi transition hợp lệ và không hợp lệ
2. **Approval Workflow** — kiểm thử luồng duyệt nhiều cấp, approve/reject
3. **Authorization (RBAC)** — kiểm thử phân quyền, người không có quyền không truy cập được
4. **Integration Test với DB** — Testcontainers chạy SQL Server container thật

## Phạm vi ưu tiên

| Nhóm | Hạng mục |
|---|---|
| **Must Have** | Auth/RBAC · Contract CRUD + State Machine · Workflow (config + runtime) · E-signature Mock/OTP · Upload & storage abstraction · Hangfire cảnh báo hết hạn · Notification cơ bản · AI: Extract + Summary + Risk · Audit log · Unit/Integration test cho State Machine, Approval Workflow, Authorization |
| **Should Have** | Outbox Pattern & Idempotent Consumer · Versioning Template & Workflow (snapshot) · Dashboard/báo cáo nâng cao · Health Check endpoint |
| **Stretch Goal** | VNPT-CA/VNeID · AI Q&A · AI so sánh hợp đồng · OpenTelemetry · Tách module thành Microservices |

## Docker Compose (Development)

```yaml
services:
  sqlserver-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=SecretPassword123!
    ports: ["1433:1433"]
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]
  seq:
    image: datalust/seq:latest
    environment:
      - ACCEPT_EULA=Y
    ports: ["5341:80"]
```
