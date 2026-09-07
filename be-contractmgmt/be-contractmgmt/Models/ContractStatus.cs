namespace be_contractmgmt.Models;

/// <summary>
/// Trạng thái vòng đời hợp đồng (8 trạng thái từ 0 đến 7)
/// </summary>
public enum ContractStatus : byte
{
    Draft = 0,              // Soạn thảo nháp
    PendingApproval = 1,    // Chờ phê duyệt (đã trình duyệt)
    Approved = 2,           // Đã phê duyệt (chờ ký)
    Signed = 3,             // Đã ký số
    Active = 4,             // Đang có hiệu lực
    Expiring = 5,           // Sắp hết hạn (cảnh báo trước 30/15/7 ngày)
    Renewed = 6,            // Đã gia hạn (thông qua phụ lục)
    Terminated = 7          // Đã thanh lý / chấm dứt hiệu lực
}
