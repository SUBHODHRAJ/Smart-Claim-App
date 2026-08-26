using System.Text;
using backend.Data;
using backend.Middleware;
using backend.Repositories;
using backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// SERVER PORT & BINDING (For Railway / Production / Localhost)
// ============================================================

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// ============================================================
// DATABASE
// ============================================================

var connectionString = GetDatabaseConnectionString(builder.Configuration);

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
    {
        options.UseMySql(
            connectionString,
            ServerVersion.AutoDetect(connectionString));
    });

// ============================================================
// CONTROLLERS
// ============================================================

builder.Services.AddControllers();

// ============================================================
// HTTP / CORS
// Read allowed origins from configuration / environment variable
// so it can accept the deployed frontend URL.
// ============================================================

var corsEnv = builder.Configuration["ALLOWED_CORS_ORIGINS"]
              ?? builder.Configuration["AllowedCorsOrigins"];

string[] allowedOrigins;

if (!string.IsNullOrWhiteSpace(corsEnv))
{
    allowedOrigins = corsEnv
        .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
else
{
    allowedOrigins = builder.Configuration
        .GetSection("AllowedCorsOrigins")
        .Get<string[]>()
        ?? new[]
        {
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:4173"   // vite preview
        };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        if (allowedOrigins.Length == 1 && allowedOrigins[0] == "*")
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

// ============================================================
// JWT AUTHENTICATION
// Environment variables: JWT_KEY, JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE, or Jwt section
// ============================================================

var jwtKey = builder.Configuration["JWT_KEY"]
             ?? builder.Configuration["JWT_SECRET"]
             ?? builder.Configuration["Jwt:Key"]
             ?? throw new InvalidOperationException("JWT Key is missing.");

var jwtIssuer = builder.Configuration["JWT_ISSUER"]
               ?? builder.Configuration["Jwt:Issuer"]
               ?? throw new InvalidOperationException("JWT Issuer is missing.");

var jwtAudience = builder.Configuration["JWT_AUDIENCE"]
                 ?? builder.Configuration["Jwt:Audience"]
                 ?? throw new InvalidOperationException("JWT Audience is missing.");

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)),

                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

// ============================================================
// REPOSITORIES
// ============================================================

builder.Services.AddScoped<
    IUserRepository,
    UserRepository>();

builder.Services.AddScoped<
    IClaimRepository,
    ClaimRepository>();

// ============================================================
// SERVICES
// ============================================================

builder.Services.AddScoped<AuthService>();

builder.Services.AddScoped<ClaimService>();

builder.Services.AddScoped<ValidationService>();

builder.Services.AddScoped<NotificationService>();

// ============================================================
// SWAGGER
// ============================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc(
        "v1",
        new OpenApiInfo
        {
            Title = "UPS Smart Claims API",
            Version = "v1",
            Description =
                "Smart Package Dispute & Claims Dashboard API"
        });

    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description =
                "Enter JWT token as: Bearer {token}"
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference =
                        new OpenApiReference
                        {
                            Type =
                                ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        });
});

// ============================================================
// BUILD APPLICATION
// ============================================================

var app = builder.Build();

// ============================================================
// DATABASE SEEDING
// ============================================================

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var dbContext =
        services.GetRequiredService<ApplicationDbContext>();

    await DbSeeder.SeedAsync(dbContext);
}

// ============================================================
// MIDDLEWARE ORDER (ORDER MATTERS)
//
// CORS must come before static files so that the
// Access-Control-Allow-Origin header is present on
// every response, including image file responses.
// Without this images will be blocked by browsers.
// ============================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}

// 1. Exception handler first
app.UseMiddleware<ExceptionMiddleware>();

// 2. CORS before everything that produces responses
app.UseCors("FrontendPolicy");

// 3. Ensure the uploads directory exists
var wwwrootPath = app.Environment.WebRootPath
                  ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");

var uploadsPath = Path.Combine(
    wwwrootPath,
    "uploads",
    "claims");

Directory.CreateDirectory(uploadsPath);

// 4. Serve wwwroot static files (CSS, JS, images, etc.)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(wwwrootPath),
    RequestPath = "",
    ContentTypeProvider = BuildContentTypeProvider(),
});

// 5. Authentication & Authorization
app.UseAuthentication();

app.UseAuthorization();

// 6. Controllers
app.MapControllers();

// ============================================================
// START APPLICATION
// ============================================================

app.Run();

// ============================================================
// HELPERS
// ============================================================

static string GetDatabaseConnectionString(IConfiguration configuration)
{
    var connStr = configuration.GetConnectionString("DefaultConnection")
                  ?? configuration["MYSQL_CONNECTION_STRING"]
                  ?? configuration["DEFAULT_CONNECTION"]
                  ?? configuration["ConnectionStrings:DefaultConnection"];

    if (string.IsNullOrWhiteSpace(connStr))
    {
        connStr = configuration["MYSQL_URL"]
                  ?? configuration["MYSQLPRIVATEURL"]
                  ?? configuration["MYSQL_PRIVATE_URL"]
                  ?? configuration["DATABASE_URL"];
    }

    if (string.IsNullOrWhiteSpace(connStr))
    {
        throw new InvalidOperationException("MySQL connection string is missing.");
    }

    if (connStr.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase) ||
        connStr.StartsWith("mysqli://", StringComparison.OrdinalIgnoreCase))
    {
        return ConvertMysqlUrlToConnectionString(connStr);
    }

    return connStr;
}

static string ConvertMysqlUrlToConnectionString(string mysqlUrl)
{
    var uri = new Uri(mysqlUrl);
    var userInfo = uri.UserInfo.Split(':');
    var user = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var host = uri.Host;
    var port = uri.Port > 0 ? uri.Port : 3306;
    var database = uri.AbsolutePath.TrimStart('/');

    return $"Server={host};Port={port};Database={database};Uid={user};Pwd={password};";
}

static FileExtensionContentTypeProvider BuildContentTypeProvider()
{
    var provider = new FileExtensionContentTypeProvider();

    // Ensure common image types are served correctly
    if (!provider.Mappings.ContainsKey(".jpg"))
        provider.Mappings[".jpg"] = "image/jpeg";

    if (!provider.Mappings.ContainsKey(".jpeg"))
        provider.Mappings[".jpeg"] = "image/jpeg";

    if (!provider.Mappings.ContainsKey(".png"))
        provider.Mappings[".png"] = "image/png";

    if (!provider.Mappings.ContainsKey(".webp"))
        provider.Mappings[".webp"] = "image/webp";

    if (!provider.Mappings.ContainsKey(".gif"))
        provider.Mappings[".gif"] = "image/gif";

    return provider;
}