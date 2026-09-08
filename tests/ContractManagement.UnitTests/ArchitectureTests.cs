using NetArchTest.Rules;
using System.Reflection;
using Xunit;

namespace ContractManagement.UnitTests;

public class ArchitectureTests
{
    private readonly Assembly _domainAssembly;
    private readonly Assembly _applicationAssembly;
    private readonly Assembly _infrastructureAssembly;
    private readonly Assembly _apiAssembly;

    public ArchitectureTests()
    {
        _domainAssembly = Assembly.Load("ContractManagement.Domain");
        _applicationAssembly = Assembly.Load("ContractManagement.Application");
        _infrastructureAssembly = Assembly.Load("ContractManagement.Infrastructure");
        _apiAssembly = Assembly.Load("ContractManagement.Api");
    }

    [Fact]
    public void Domain_Layer_Should_Not_Depend_On_Outer_Layers()
    {
        var result = Types.InAssembly(_domainAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "ContractManagement.Application",
                "ContractManagement.Infrastructure",
                "ContractManagement.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, GetFailureMessage(result));
    }

    [Fact]
    public void Application_Layer_Should_Not_Depend_On_Outer_Layers()
    {
        var result = Types.InAssembly(_applicationAssembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "ContractManagement.Infrastructure",
                "ContractManagement.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, GetFailureMessage(result));
    }

    [Fact]
    public void Infrastructure_Layer_Should_Not_Depend_On_Api()
    {
        var result = Types.InAssembly(_infrastructureAssembly)
            .ShouldNot()
            .HaveDependencyOn("ContractManagement.Api")
            .GetResult();

        Assert.True(result.IsSuccessful, GetFailureMessage(result));
    }

    [Fact]
    public void Api_Layer_Should_Not_Be_Depended_On_By_Other_Layers()
    {
        var applicationResult = Types.InAssembly(_applicationAssembly)
            .ShouldNot()
            .HaveDependencyOn("ContractManagement.Api")
            .GetResult();

        var domainResult = Types.InAssembly(_domainAssembly)
            .ShouldNot()
            .HaveDependencyOn("ContractManagement.Api")
            .GetResult();

        var infrastructureResult = Types.InAssembly(_infrastructureAssembly)
            .ShouldNot()
            .HaveDependencyOn("ContractManagement.Api")
            .GetResult();

        Assert.True(applicationResult.IsSuccessful, GetFailureMessage(applicationResult));
        Assert.True(domainResult.IsSuccessful, GetFailureMessage(domainResult));
        Assert.True(infrastructureResult.IsSuccessful, GetFailureMessage(infrastructureResult));
    }

    private static string GetFailureMessage(TestResult result)
    {
        if (result.FailingTypes == null || result.FailingTypes.Count == 0)
            return "Test failed but no failing types reported";

        return string.Join(
            "\n",
            result.FailingTypes.Select(t => t.FullName));
    }
}