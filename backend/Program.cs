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
else if (!builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://0.0.0.0:8080");
}

// ============================================================
// DATABASE
// ============================================================

using var startupLoggerFactory = LoggerFactory.Create(logBuilder => logBuilder.AddConsole());
var startupLogger = startupLoggerFactory.CreateLogger("DatabaseSetup");

var connectionString = GetDatabaseConnectionString(builder.Configuration, startupLogger);

builder.Services.AddDbContext<ApplicationDbContext>(
    options =>
    {
        options.UseMySql(
            connectionString,
            new MySqlServerVersion(new Version(8, 0, 36)),
            mySqlOptions =>
            {
                mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);
            });
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
// ASYNC DATABASE SEEDING & MIGRATION WITH RETRY
// Non-blocking background initialization so Kestrel starts
// listening on TCP port 0.0.0.0 immediately.
// ============================================================

_ = Task.Run(async () =>
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    int maxRetries = 5;
    int delaySeconds = 5;

    for (int retry = 1; retry <= maxRetries; retry++)
    {
        try
        {
            logger.LogInformation("Attempting database migration and seeding (Attempt {Retry}/{MaxRetries})...", retry, maxRetries);
            var dbContext = services.GetRequiredService<ApplicationDbContext>();
            await DbSeeder.SeedAsync(dbContext);
            logger.LogInformation("Database migration and seeding completed successfully.");
            break;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database migration/seeding attempt {Retry}/{MaxRetries} failed: {Message}", retry, maxRetries, ex.Message);
            if (retry == maxRetries)
            {
                logger.LogError(ex, "All {MaxRetries} database migration/seeding attempts failed. Application will continue serving requests.", maxRetries);
            }
            else
            {
                logger.LogInformation("Waiting {DelaySeconds} seconds before retry...", delaySeconds);
                await Task.Delay(TimeSpan.FromSeconds(delaySeconds));
            }
        }
    }
});

// ============================================================
// MIDDLEWARE ORDER (ORDER MATTERS)
//
// CORS must come before static files so that the
// Access-Control-Allow-Origin header is present on
// every response, including image file responses.
// Without this images will be blocked by browsers.
// ============================================================

// Enable Swagger in all environments (including Railway Production)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "UPS Smart Claims API v1");
    c.RoutePrefix = "swagger";
});

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

// Root URL redirect to Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger"));

// 6. Controllers
app.MapControllers();

// ============================================================
// START APPLICATION
// ============================================================

app.Run();

// ============================================================
// HELPERS
// ============================================================

static string GetDatabaseConnectionString(IConfiguration configuration, ILogger logger)
{
    // Strategy 1: Check Railway's individual MySQL environment variables
    var host = configuration["MYSQLHOST"] ?? configuration["MYSQL_HOST"];
    var portStr = configuration["MYSQLPORT"] ?? configuration["MYSQL_PORT"] ?? "3306";
    var user = configuration["MYSQLUSER"] ?? configuration["MYSQL_USER"];
    var password = configuration["MYSQLPASSWORD"] ?? configuration["MYSQL_PASSWORD"];
    var database = configuration["MYSQLDATABASE"] ?? configuration["MYSQL_DATABASE"];

    if (!string.IsNullOrWhiteSpace(host) && !string.IsNullOrWhiteSpace(user) && !string.IsNullOrWhiteSpace(database))
    {
        int port = int.TryParse(portStr, out var p) ? p : 3306;
        logger.LogInformation("Database Config: Using Railway individual environment variables (Host: {Host}, Port: {Port}, DB: {Database}, User: {User}).",
            host, port, database, MaskString(user));

        return $"Server={host};Port={port};Database={database};Uid={user};Pwd={password ?? ""};AllowPublicKeyRetrieval=True;SslMode=Preferred;";
    }

    // Strategy 2: Check direct connection string variables
    var connStr = configuration.GetConnectionString("DefaultConnection")
                  ?? configuration["MYSQL_CONNECTION_STRING"]
                  ?? configuration["DEFAULT_CONNECTION"]
                  ?? configuration["ConnectionStrings:DefaultConnection"];

    // Strategy 3: Check MySQL URL environment variables
    if (string.IsNullOrWhiteSpace(connStr))
    {
        connStr = configuration["MYSQL_URL"]
                  ?? configuration["MYSQLPRIVATEURL"]
                  ?? configuration["MYSQL_PRIVATE_URL"]
                  ?? configuration["DATABASE_URL"];
    }

    if (string.IsNullOrWhiteSpace(connStr))
    {
        throw new InvalidOperationException("MySQL connection string is not configured. Please set MYSQLHOST/MYSQLUSER/MYSQLDATABASE, MYSQL_URL, or ConnectionStrings__DefaultConnection.");
    }

    if (connStr.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase) ||
        connStr.StartsWith("mysqli://", StringComparison.OrdinalIgnoreCase))
    {
        return ParseMysqlUrl(connStr, logger);
    }

    LogDiagnosticConnStrInfo(connStr, logger);
    return connStr;
}

static string ParseMysqlUrl(string mysqlUrl, ILogger logger)
{
    try
    {
        var raw = mysqlUrl;
        int schemeEnd = raw.IndexOf("://", StringComparison.Ordinal);
        if (schemeEnd >= 0)
        {
            raw = raw.Substring(schemeEnd + 3);
        }

        int queryIdx = raw.IndexOf('?');
        if (queryIdx >= 0)
        {
            raw = raw.Substring(0, queryIdx);
        }

        int atIdx = raw.LastIndexOf('@');
        string userInfo = "";
        string hostPortDb = raw;

        if (atIdx >= 0)
        {
            userInfo = raw.Substring(0, atIdx);
            hostPortDb = raw.Substring(atIdx + 1);
        }

        string user = "";
        string password = "";
        if (!string.IsNullOrEmpty(userInfo))
        {
            int colonIdx = userInfo.IndexOf(':');
            if (colonIdx >= 0)
            {
                user = Uri.UnescapeDataString(userInfo.Substring(0, colonIdx));
                password = Uri.UnescapeDataString(userInfo.Substring(colonIdx + 1));
            }
            else
            {
                user = Uri.UnescapeDataString(userInfo);
            }
        }

        int slashIdx = hostPortDb.IndexOf('/');
        string hostPort = hostPortDb;
        string database = "";

        if (slashIdx >= 0)
        {
            hostPort = hostPortDb.Substring(0, slashIdx);
            database = Uri.UnescapeDataString(hostPortDb.Substring(slashIdx + 1));
        }

        string host = hostPort;
        int port = 3306;

        int portColonIdx = hostPort.LastIndexOf(':');
        if (portColonIdx >= 0)
        {
            host = hostPort.Substring(0, portColonIdx);
            string portStr = hostPort.Substring(portColonIdx + 1);
            if (int.TryParse(portStr, out var p))
            {
                port = p;
            }
        }

        logger.LogInformation("Database Config: Parsed MySQL URL (Host: {Host}, Port: {Port}, DB: {Database}, User: {User}).",
            host, port, database, MaskString(user));

        return $"Server={host};Port={port};Database={database};Uid={user};Pwd={password};AllowPublicKeyRetrieval=True;SslMode=Preferred;";
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to parse MYSQL_URL. Falling back to default URI parser.");
        var uri = new Uri(mysqlUrl);
        var userInfo = uri.UserInfo.Split(new[] { ':' }, 2);
        var user = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var host = uri.Host;
        var port = uri.Port > 0 ? uri.Port : 3306;
        var database = uri.AbsolutePath.TrimStart('/');

        return $"Server={host};Port={port};Database={database};Uid={user};Pwd={password};AllowPublicKeyRetrieval=True;SslMode=Preferred;";
    }
}

static string MaskString(string input)
{
    if (string.IsNullOrEmpty(input)) return "";
    if (input.Length <= 2) return "**";
    return input.Substring(0, 2) + "***";
}

static void LogDiagnosticConnStrInfo(string connectionString, ILogger logger)
{
    try
    {
        var builder = new System.Data.Common.DbConnectionStringBuilder { ConnectionString = connectionString };
        var host = builder.ContainsKey("server") ? builder["server"] : (builder.ContainsKey("host") ? builder["host"] : "unknown");
        var port = builder.ContainsKey("port") ? builder["port"] : "3306";
        var db = builder.ContainsKey("database") ? builder["database"] : "unknown";
        var user = builder.ContainsKey("uid") ? builder["uid"] : (builder.ContainsKey("user") ? builder["user"] : (builder.ContainsKey("user id") ? builder["user id"] : "unknown"));

        logger.LogInformation("Database Config: Connection string loaded (Host: {Host}, Port: {Port}, DB: {Database}, User: {User}).",
            host, port, db, MaskString(user?.ToString() ?? ""));
    }
    catch
    {
        logger.LogInformation("Database Config: Connection string loaded.");
    }
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