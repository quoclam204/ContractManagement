namespace be_contractmgmt.Services.Workflow.Evaluator;

/// <summary>
/// Interface kiểm tra cú pháp và đánh giá biểu thức điều kiện phê duyệt theo giá trị hợp đồng
/// </summary>
public interface IWorkflowConditionEvaluator
{
    /// <summary>
    /// Kiểm tra biểu thức có hợp lệ về mặt cú pháp hay không
    /// </summary>
    /// <param name="expression">Biểu thức điều kiện, ví dụ: "Value >= 500000000"</param>
    /// <param name="errorMessage">Thông báo lỗi nếu biểu thức không hợp lệ</param>
    /// <returns>True nếu hợp lệ hoặc rỗng, False nếu cú pháp sai</returns>
    bool TryValidate(string? expression, out string? errorMessage);

    /// <summary>
    /// Đánh giá giá trị hợp đồng có thỏa mãn biểu thức điều kiện hay không
    /// </summary>
    /// <param name="expression">Biểu thức điều kiện (nếu null hoặc rỗng mặc định coi như thỏa mãn)</param>
    /// <param name="contractValue">Giá trị hợp đồng</param>
    /// <returns>True nếu thỏa mãn điều kiện, False nếu không thỏa mãn</returns>
    bool Evaluate(string? expression, decimal contractValue);
}
