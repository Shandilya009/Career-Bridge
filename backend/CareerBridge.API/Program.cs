using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using CareerBridge.Infrastructure.Persistence;
using CareerBridge.Application.Interfaces;
using CareerBridge.Infrastructure.Repositories;
using CareerBridge.Infrastructure.Authentication;
using CareerBridge.API.Middleware;
using CareerBridge.Infrastructure.Seeding;
using Serilog;
using AspNetCoreRateLimit;
using System.Reflection;

// ─── Serilog Configuration ────────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/careerbridge-.log", rollingInterval: RollingInterval.Day)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "CareerBridge")
    .CreateLogger();

try
{
    Log.Information("Starting CareerBridge API");

    var builder = WebApplication.CreateBuilder(args);

    // Use Serilog
    builder.Host.UseSerilog();

    // ─── CORS ─────────────────────────────────────────────────────────────────
    builder.Services.AddCors(o => o.AddPolicy("AllowFrontend", p =>
        p.SetIsOriginAllowed(origin => true)
         .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

    // ─── Rate Limiting ────────────────────────────────────────────────────────
    builder.Services.AddMemoryCache();
    builder.Services.Configure<IpRateLimitOptions>(options =>
    {
        options.EnableEndpointRateLimiting = true;
        options.StackBlockedRequests = false;
        options.HttpStatusCode = 429;
        options.RealIpHeader = "X-Real-IP";
        options.GeneralRules = new List<RateLimitRule>
        {
            new RateLimitRule
            {
                Endpoint = "*/api/auth/*",
                Period = "1m",
                Limit = 5
            },
            new RateLimitRule
            {
                Endpoint = "*",
                Period = "1m",
                Limit = 100
            }
        };
    });
    builder.Services.AddSingleton<IIpPolicyStore, MemoryCacheIpPolicyStore>();
    builder.Services.AddSingleton<IRateLimitCounterStore, MemoryCacheRateLimitCounterStore>();
    builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
    builder.Services.AddSingleton<IProcessingStrategy, AsyncKeyLockProcessingStrategy>();

    // ─── Controllers + Swagger ────────────────────────────────────────────────
    builder.Services.AddControllers()
        .ConfigureApiBehaviorOptions(options =>
        {
            // Customize validation error response
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState
                    .Where(e => e.Value?.Errors.Count > 0)
                    .ToDictionary(
                        kvp => kvp.Key,
                        kvp => kvp.Value?.Errors.Select(e => e.ErrorMessage).ToArray() ?? Array.Empty<string>()
                    );

                var correlationId = context.HttpContext.Items["CorrelationId"]?.ToString() ?? Guid.NewGuid().ToString();

                var result = new
                {
                    statusCode = 400,
                    message = "Validation failed",
                    correlationId,
                    errors
                };

                return new BadRequestObjectResult(result);
            };
        });
    
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo 
        { 
            Title = "CareerBridge API", 
            Version = "v1",
            Description = "Production-ready Placement Portal API with comprehensive features",
            Contact = new OpenApiContact
            {
                Name = "CareerBridge Team",
                Email = "support@careerbridge.com"
            }
        });
        
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name   = "Authorization",
            In     = ParameterLocation.Header,
            Type   = SecuritySchemeType.ApiKey,
            Scheme = "Bearer",
            Description = "Enter: Bearer {your JWT token}"
        });
        
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {{
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }});

        // Include XML comments
        var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
        {
            c.IncludeXmlComments(xmlPath);
        }
    });

    // ─── MongoDB ──────────────────────────────────────────────────────────────
    builder.Services.AddSingleton<MongoDbContext>();

    // ─── Repositories ─────────────────────────────────────────────────────────
    builder.Services.AddScoped<IUserRepository,         UserRepository>();
    builder.Services.AddScoped<IStudentRepository,      StudentRepository>();
    builder.Services.AddScoped<IRecruiterRepository,    RecruiterRepository>();
    builder.Services.AddScoped<IJobRepository,          JobRepository>();
    builder.Services.AddScoped<IApplicationRepository,  ApplicationRepository>();
    builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
    builder.Services.AddScoped<IInterviewRepository,    InterviewRepository>();

    // ─── Services ─────────────────────────────────────────────────────────────
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddScoped<DatabaseSeeder>();

    // ─── JWT Auth ─────────────────────────────────────────────────────────────
    var jwtKey = builder.Configuration["JwtSettings:SecretKey"]!;
    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(o =>
        {
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey         = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey)),
                ValidateIssuer           = false,
                ValidateAudience         = false,
                RoleClaimType            = System.Security.Claims.ClaimTypes.Role
            };
        });
    builder.Services.AddAuthorization();

    // ─── Health Checks ────────────────────────────────────────────────────────
    builder.Services.AddHealthChecks()
        .AddMongoDb(
            mongodbConnectionString: builder.Configuration["MongoDbSettings:ConnectionString"]!,
            name: "mongodb",
            timeout: TimeSpan.FromSeconds(5));

    // ─── Static files for uploads ─────────────────────────────────────────────
    builder.Services.AddDirectoryBrowser();

    var app = builder.Build();

    // ─── Middleware Pipeline ──────────────────────────────────────────────────
    
    // Correlation ID (first)
    app.UseMiddleware<CorrelationIdMiddleware>();

    // Security Headers
    app.UseMiddleware<SecurityHeadersMiddleware>();

    // Error Handling
    app.UseMiddleware<ErrorHandlingMiddleware>();

    // Request Logging
    app.UseSerilogRequestLogging();

    // CORS must be early in the pipeline
    app.UseCors("AllowFrontend");

    // Rate Limiting
    app.UseIpRateLimiting();

    // Swagger
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "CareerBridge API v1");
        c.RoutePrefix = "swagger";
    });

    // Health Checks
    app.MapHealthChecks("/health");
    app.MapHealthChecks("/health/ready");
    app.MapHealthChecks("/health/live");

    // Static file serving for uploads
    var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
    Directory.CreateDirectory(uploadsPath);
    
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads"
    });
    
    app.UseStaticFiles();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    // ─── Database Seeding Endpoint (Development Only) ────────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.MapPost("/api/seed-database", async (DatabaseSeeder seeder) =>
        {
            try
            {
                await seeder.SeedAsync(clearExisting: false);
                return Results.Ok(new { message = "Database seeded successfully" });
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Error seeding database");
                return Results.Problem("Error seeding database: " + ex.Message);
            }
        }).WithTags("Development");
    }

    Log.Information("CareerBridge API started successfully");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

