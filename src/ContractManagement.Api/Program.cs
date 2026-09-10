using ContractManagement.Application.Notification.Interfaces;
using ContractManagement.Application.Workflow.Interfaces;
using ContractManagement.Application.Workflow.Services;
using ContractManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Controllers & OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHealthChecks();

// Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ContractManagementDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString))
    {
        options.UseSqlServer(connectionString);
    }
});

builder.Services.AddScoped<IWorkflowDbContext>(sp => sp.GetRequiredService<ContractManagementDbContext>());
builder.Services.AddScoped<INotificationDbContext>(sp => sp.GetRequiredService<ContractManagementDbContext>());

// MediatR
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(WorkflowService).Assembly);
});

// Workflow Module Services
builder.Services.AddScoped<IWorkflowConditionEvaluator, WorkflowConditionEvaluator>();
builder.Services.AddScoped<IWorkflowService, WorkflowService>();
builder.Services.AddScoped<IApprovalService, ApprovalService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapHealthChecks("/health");

app.MapControllers();

app.Run();