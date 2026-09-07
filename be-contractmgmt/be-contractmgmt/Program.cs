using be_contractmgmt.Data;
using Microsoft.EntityFrameworkCore;

namespace be_contractmgmt
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration
                .GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(connectionString));

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                });

            // Đăng ký dịch vụ Workflow & Approval (Người 4)
            builder.Services.AddScoped<be_contractmgmt.Services.Workflow.Evaluator.IWorkflowConditionEvaluator, be_contractmgmt.Services.Workflow.Evaluator.WorkflowConditionEvaluator>();
            builder.Services.AddScoped<be_contractmgmt.Services.Workflow.IWorkflowService, be_contractmgmt.Services.Workflow.WorkflowService>();
            builder.Services.AddScoped<be_contractmgmt.Services.Workflow.IApprovalService, be_contractmgmt.Services.Workflow.ApprovalService>();

            // Đăng ký MediatR cho kiến trúc Event-Driven giữa các module
            builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}
