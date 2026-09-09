using System.Globalization;
using System.Text.RegularExpressions;
using ContractManagement.Application.Workflow.Interfaces;

namespace ContractManagement.Application.Workflow.Services;

/// <summary>
/// Triển khai bộ thẩm định biểu thức điều kiện giá trị hợp đồng
/// Hỗ trợ: >=, <=, >, <, ==, =, !=, <> và kết hợp điều kiện bằng AND
/// Ví dụ: "Value >= 500000000", "Value >= 100000000 AND Value < 500000000"
/// </summary>
public class WorkflowConditionEvaluator : IWorkflowConditionEvaluator
{
    private static readonly Regex ConditionRegex = new(
        @"^\s*(?:(?:Value|ContractValue)\s*)?(>=|<=|>|<|==|=|!=|<>)\s*([0-9_,\.]+)\s*$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled
    );

    public bool TryValidate(string? expression, out string? errorMessage)
    {
        errorMessage = null;

        if (string.IsNullOrWhiteSpace(expression))
            return true; // Rỗng coi như hợp lệ (luồng mặc định không điều kiện)

        var parts = SplitConditions(expression);
        if (parts.Length == 0)
        {
            errorMessage = "Biểu thức điều kiện không có nội dung.";
            return false;
        }

        foreach (var part in parts)
        {
            var match = ConditionRegex.Match(part);
            if (!match.Success)
            {
                errorMessage = $"Cú pháp điều kiện không hợp lệ tại: '{part.Trim()}'. Cú pháp mẫu: 'Value >= 500000000' hoặc 'Value >= 100M AND Value < 500M'.";
                return false;
            }

            var numberStr = CleanNumberString(match.Groups[2].Value);
            if (!decimal.TryParse(numberStr, NumberStyles.Any, CultureInfo.InvariantCulture, out _))
            {
                errorMessage = $"Giá trị số '{match.Groups[2].Value}' trong điều kiện không hợp lệ.";
                return false;
            }
        }

        return true;
    }

    public bool Evaluate(string? expression, decimal contractValue)
    {
        if (string.IsNullOrWhiteSpace(expression))
            return true; // Không có điều kiện thì áp dụng cho mọi giá trị

        var parts = SplitConditions(expression);
        if (parts.Length == 0)
            return true;

        foreach (var part in parts)
        {
            var match = ConditionRegex.Match(part);
            if (!match.Success)
                return false; // Nếu cú pháp sai thì không khớp

            var op = match.Groups[1].Value;
            var numberStr = CleanNumberString(match.Groups[2].Value);

            if (!decimal.TryParse(numberStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var targetValue))
                return false;

            var satisfied = op switch
            {
                ">=" => contractValue >= targetValue,
                "<=" => contractValue <= targetValue,
                ">"  => contractValue > targetValue,
                "<"  => contractValue < targetValue,
                "==" or "=" => contractValue == targetValue,
                "!=" or "<>" => contractValue != targetValue,
                _ => false
            };

            if (!satisfied)
                return false;
        }

        return true;
    }

    private static string[] SplitConditions(string expression)
    {
        return Regex.Split(expression, @"\s+(?:AND|&&)\s+", RegexOptions.IgnoreCase)
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .ToArray();
    }

    private static string CleanNumberString(string raw)
    {
        // Loại bỏ dấu phân cách hàng nghìn (dấu gạch dưới hoặc phẩy nếu có)
        return raw.Replace("_", "").Replace(",", "");
    }
}
