using ContractManagement.Application.Workflow.Services;
using Xunit;

namespace ContractManagement.UnitTests.Workflow;

public class WorkflowConditionEvaluatorTests
{
    private readonly WorkflowConditionEvaluator _evaluator = new();

    [Theory]
    [InlineData("Value >= 500000000", true)]
    [InlineData("ContractValue < 100000000", true)]
    [InlineData("Value >= 100000000 AND Value < 500000000", true)]
    [InlineData("Value == 50000000", true)]
    [InlineData("", true)]
    [InlineData(null, true)]
    [InlineData("InvalidExpression", false)]
    [InlineData("Value >> 500", false)]
    public void TryValidate_ReturnsExpectedValidity(string? expression, bool expectedValid)
    {
        var isValid = _evaluator.TryValidate(expression, out var errorMessage);

        Assert.Equal(expectedValid, isValid);
        if (!expectedValid)
        {
            Assert.NotNull(errorMessage);
        }
    }

    [Theory]
    [InlineData("Value >= 500000000", 600000000, true)]
    [InlineData("Value >= 500000000", 500000000, true)]
    [InlineData("Value >= 500000000", 400000000, false)]
    [InlineData("Value >= 100000000 AND Value < 500000000", 250000000, true)]
    [InlineData("Value >= 100000000 AND Value < 500000000", 500000000, false)]
    [InlineData("Value >= 100000000 AND Value < 500000000", 50000000, false)]
    [InlineData(null, 1000000000, true)]
    [InlineData("", 1000000000, true)]
    public void Evaluate_ReturnsExpectedResult(string? expression, decimal contractValue, bool expected)
    {
        var result = _evaluator.Evaluate(expression, contractValue);

        Assert.Equal(expected, result);
    }
}
