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
// DATABASE
// ============================================================

var connectionString =
    builder.Configuration.GetConnectionString(
        "DefaultConnection");

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
// Read allowed origins from configuration so it is not
// hardcoded for localhost in production.
// ============================================================

var allowedOrigins =
    builder.Configuration
        .GetSection("AllowedCorsOrigins")
        .Get<string[]>()
    ?? new[]
    {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:4173"   // vite preview
    };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ============================================================
// JWT AUTHENTICATION
// ============================================================

var jwtSettings =
    builder.Configuration.GetSection("Jwt");

var jwtKey =
    jwtSettings["Key"]
    ?? throw new InvalidOperationException(
        "JWT Key is missing.");

var jwtIssuer =
    jwtSettings["Issuer"]
    ?? throw new InvalidOperationException(
        "JWT Issuer is missing.");

var jwtAudience =
    jwtSettings["Audience"]
    ?? throw new InvalidOperationException(
        "JWT Audience is missing.");

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
var uploadsPath = Path.Combine(
    app.Environment.ContentRootPath,
    "wwwroot",
    "uploads",
    "claims");

Directory.CreateDirectory(uploadsPath);

// 4. Serve wwwroot static files (CSS, JS, etc.)
//    Default UseStaticFiles() serves from wwwroot/
//    This already covers /uploads/claims/** since
//    they are inside wwwroot.
app.UseStaticFiles(new StaticFileOptions
{
    // Enable serving of all files including images
    ContentTypeProvider = BuildContentTypeProvider(),
    // Do NOT set OnPrepareResponse here — CORS middleware
    // already added the correct headers above.
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