# Module Boundaries

## Overview
The Contract Management System is organized as a Modular Monolith with eight distinct bounded contexts/modules. Each module maintains clear boundaries and is organized as **folders** within each layer (Domain, Application, Infrastructure, Api) — NOT as separate projects.

## Bounded Contexts

### 1. Identity (Người 1 — Lead)
**Responsibility**: User authentication (JWT), authorization (RBAC), roles, permissions, user & department management
**Key Concepts**: Users, Departments, Roles (Admin/Manager/Staff/Approver), JWT Tokens, Sessions
**Tables**: `USERS`, `DEPARTMENTS`
**Boundaries**: 
- Foundational module — does not depend on any other module
- Provides `ICurrentUserService` (lấy User đang đăng nhập) thật sớm để các module khác dùng
- Provides `IAuthService`, `ITokenService` for JWT authentication
- Manages user lifecycle and RBAC access control
- Does NOT know about contracts, workflows, or business processes

### 2. Contract (Người 2)
**Responsibility**: Contract creation, CRUD management, lifecycle state machine, contract type & template management (with versioning)
**Key Concepts**: Contracts, Contract Types, Templates (versioned), State Machine (Draft→PendingApproval→Approved→Signed→Active→Expiring→Renewed/Terminated)
**Tables**: `CONTRACTS`, `CONTRACT_TYPES`
**Boundaries**:
- Owns the contract entity and its lifecycle state machine
- Owns contract type and template management (with `TemplateVersion`)
- Records `TemplateVersionUsed` at contract creation time (snapshot — template changes don't affect existing contracts)
- Coordinates with Workflow for approval processes (via interface)
- Interacts with Partner for counterparty information (via interface)
- Works with Payment for financial aspects (via interface)
- Uses Storage for contract document attachments (via `IStorageProvider`)
- Does NOT own workflow logic or approval steps

### 3. Workflow (Người 4)
**Responsibility**: Workflow configuration (WorkflowDefinition/WorkflowStep — config), Approval execution (ApprovalStep — runtime), E-signature via SignatureProvider abstraction
**Key Concepts**: WorkflowDefinition (versioned), WorkflowSteps, ApprovalSteps (runtime snapshots), Signatures (Mock/OTP/CA)
**Tables**: `WORKFLOW_DEFINITIONS`, `WORKFLOW_STEPS`, `APPROVAL_STEPS`, `SIGNATURES`
**Boundaries**:
- Tách rõ **cấu hình** (WorkflowDefinition/WorkflowStep) khỏi **dữ liệu thực thi** (ApprovalStep)
- ApprovalStep snapshot WorkflowDefinition version tại thời điểm contract submit — thay đổi config sau không ảnh hưởng hợp đồng đang xử lý
- Manages approval chains for contracts (multi-level approval)
- Handles E-signature via `ISignatureProvider` abstraction:
  - MVP: Mock Signature / OTP nội bộ
  - Stretch Goal: VNPT-CA / VNeID
- Coordinates with Notification for approval/sign alerts (via RabbitMQ)
- Does NOT own contract data — operates on contracts through interfaces

### 4. Partner (Người 3)
**Responsibility**: Partner/vendor/customer management and relationship tracking
**Key Concepts**: Partners, Vendors, Customers, Tax Code, Representative, Contact info
**Tables**: `PARTNERS`
**Boundaries**:
- Manages partner entities and relationship data
- Provides partner information to Contract module (via interface)
- Does NOT manage specific contract instances
- Independent of financial transactions (Payment module handles that)

### 5. Payment (Người 3)
**Responsibility**: Payment tracking, billing schedules, installment management per contract
**Key Concepts**: Payment installments (đợt thanh toán), DueDate, Status (Pending/Paid/Overdue)
**Tables**: `PAYMENTS`
**Boundaries**:
- Tracks payment installments linked to contracts
- Manages payment status transitions (Pending → Paid / Overdue)
- Works with Contract for payment terms
- Does NOT manage contract lifecycle

### 6. Storage / Attachment (Người 3)
**Responsibility**: File storage, document management, versioning via `IStorageProvider` abstraction
**Key Concepts**: Attachments, File versioning, Upload/Download, Storage abstraction
**Tables**: `ATTACHMENTS`
**Boundaries**:
- Provides storage services to all other modules via `IStorageProvider`
- Dev/local: MinIO (`MinioStorageProvider`)
- Production: Azure Blob Storage (hoặc S3-compatible khác)
- Manages file lifecycle, versioning, and metadata
- Does NOT interpret file content (AI module handles analysis)
- Provides secure upload/download URLs

### 7. Notification (Người 5)
**Responsibility**: Alerting, messaging, and communication delivery — async via RabbitMQ
**Key Concepts**: Notifications (in-app), Email alerts, Notification types (ApprovalRequest/SignRequest/ExpiringSoon)
**Tables**: `NOTIFICATIONS`
**Boundaries**:
- Delivers notifications triggered by other modules via RabbitMQ consumer
- Manages in-app notification list (read/unread status)
- Handles email delivery for critical alerts
- Does NOT determine when to notify — triggered by events from other modules
- Idempotent Consumer (Should Have) — tránh gửi trùng notification khi message bị redeliver

### 8. AI (Người 5)
**Responsibility**: AI-powered contract analysis — extract, summarize, risk detection
**Key Concepts**: AI Analysis Results, Summary, Extracted fields, Risk flags
**Tables**: `AI_ANALYSIS_RESULTS`
**Boundaries**:
- Analyzes contract documents from Storage module
- MVP scope:
  - Tóm tắt nội dung hợp đồng
  - Trích xuất: loại hợp đồng, giá trị, ngày ký, ngày hết hạn, các bên
  - Phát hiện điều khoản rủi ro
- Stretch Goal:
  - Q&A trên nội dung hợp đồng
  - So sánh 2 phiên bản hợp đồng
- Processes async via RabbitMQ consumer — does NOT block main request flow
- Stores results in `AI_ANALYSIS_RESULTS`, displayed as risk cards on contract detail page
- Integrates with Claude/GPT-4o API
- Idempotent Consumer (Should Have) — tránh phân tích trùng khi message bị redeliver

### Cross-Cutting: Audit Trail
**Tables**: `AUDIT_LOGS`
- NOT owned by any specific module — cross-cutting concern
- Ghi log bất biến mọi thao tác Create/Update/Approve/Sign/Terminate
- Implemented via EF Core interceptor hoặc middleware
- Lưu `DataSnapshot` (JSON) ghi lại trạng thái trước/sau thay đổi

## Module Interaction Principles

### Communication Patterns
1. **Direct Interface Call (Synchronous)**: Trong cùng process, module gọi nhau qua Interface được inject qua DI. Ví dụ: `ContractService` gọi `IPartnerService` để lấy thông tin đối tác
2. **RabbitMQ (Asynchronous)**: Cho tác vụ không cần phản hồi tức thì. Hai flow chính:
   - **Approval → Notification**: Khi hợp đồng được approve/reject → publish message → NotificationConsumer gửi thông báo
   - **Upload → AI Analysis**: Khi upload file hợp đồng → publish message → AiAnalysisConsumer phân tích
3. **Hangfire Job (Scheduled)**: `ContractExpiryJob` quét hằng ngày → publish notification messages cho hợp đồng sắp hết hạn (30/15/7 ngày)

### Dependency Rules Between Modules
- Modules should depend only on interfaces, not implementations
- Prefer event-driven communication (RabbitMQ) over direct dependencies cho cross-module side effects
- Avoid circular dependencies between modules
- Higher-level modules (Workflow) can coordinate lower-level modules (Contract, Identity)

### Data Ownership
Each module owns its data exclusively:
- Identity owns user and role data (`USERS`, `DEPARTMENTS`)
- Contract owns contract instances and types (`CONTRACTS`, `CONTRACT_TYPES`)
- Workflow owns workflow definitions, steps, approval runtime, and signatures (`WORKFLOW_DEFINITIONS`, `WORKFLOW_STEPS`, `APPROVAL_STEPS`, `SIGNATURES`)
- Partner owns partner entity data (`PARTNERS`)
- Payment owns payment installment data (`PAYMENTS`)
- Storage owns file metadata and storage locations (`ATTACHMENTS`)
- Notification owns notification records and delivery status (`NOTIFICATIONS`)
- AI owns analysis results (`AI_ANALYSIS_RESULTS`)
- Audit Trail (`AUDIT_LOGS`) is cross-cutting — shared infrastructure

## Physical Organization
Modules are organized as **folders within each layer**, NOT as separate projects:

```
src/
  ContractManagement.Domain/
    Identity/
      Entities/User.cs, Department.cs
      Enums/UserRole.cs
    Contract/
      Entities/Contract.cs, ContractType.cs
      Enums/ContractStatus.cs
      Events/ContractSubmittedEvent.cs
    Partner/
    Workflow/
    Payment/
    Storage/
    Signature/
    Notification/
    AI/

  ContractManagement.Application/
    Identity/
      DTOs/, Interfaces/, Services/
    Contract/
      DTOs/, Interfaces/, Services/
    ...

  ContractManagement.Infrastructure/
    Persistence/
      ContractManagementDbContext.cs    ← 1 DbContext duy nhất
      Configurations/
        Identity/UserConfiguration.cs
        Contract/ContractConfiguration.cs
        ...
    Storage/MinioStorageProvider.cs
    Signature/MockSignatureProvider.cs
    Messaging/Consumers/
    BackgroundJobs/

  ContractManagement.Api/
    Controllers/
      Identity/AuthController.cs
      Contract/ContractController.cs
      ...
```

This physical organization reinforces the logical boundaries and makes it clear which code belongs to which module, while keeping the solution simple with only 4 projects.
