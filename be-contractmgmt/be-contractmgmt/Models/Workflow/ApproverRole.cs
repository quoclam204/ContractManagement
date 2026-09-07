namespace be_contractmgmt.Models.Workflow;

/// <summary>
/// Vai trò người duyệt: 0=Admin, 1=Manager (Trưởng phòng), 2=Staff (Nhân viên), 3=Approver
/// Khớp với giá trị role trong bảng USERS và CHECK constraint của WORKFLOW_STEPS
/// </summary>
public enum ApproverRole : byte
{
    Admin = 0,
    Manager = 1,
    Staff = 2,
    Approver = 3
}
