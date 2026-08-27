using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.DTOs;
using backend.Models;
using backend.Repositories;
using Microsoft.IdentityModel.Tokens;
namespace backend.Services;

public class AuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request)
    {
        if (request == null)
        {
            throw new ArgumentException("Request body is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ArgumentException("Password is required.");
        }

        var email = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.EmailExistsAsync(email))
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                request.Password),
            Role = "Customer",
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.CreateAsync(user);

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(
        LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null)
        {
            return null;
        }

        var passwordValid = BCrypt.Net.BCrypt.Verify(
            request.Password,
            user.PasswordHash);

        if (!passwordValid)
        {
            return null;
        }

        return GenerateAuthResponse(user);
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _userRepository.GetByIdAsync(userId);
    }

    private AuthResponse GenerateAuthResponse(User user)
    {
        var key = _configuration["JWT_KEY"]
                  ?? _configuration["JWT_SECRET"]
                  ?? _configuration["Jwt:Key"]
                  ?? throw new InvalidOperationException(
                      "JWT Key is not configured.");

        var issuer = _configuration["JWT_ISSUER"]
                     ?? _configuration["Jwt:Issuer"]
                     ?? throw new InvalidOperationException(
                         "JWT Issuer is not configured.");

        var audience = _configuration["JWT_AUDIENCE"]
                       ?? _configuration["Jwt:Audience"]
                       ?? throw new InvalidOperationException(
                           "JWT Audience is not configured.");

        var expirationMinutes =
            int.TryParse(
                _configuration["JWT_EXPIRATION_MINUTES"] ?? _configuration["Jwt:ExpirationMinutes"],
                out var minutes)
                ? minutes
                : 120;

        var expiresAt = DateTime.UtcNow.AddMinutes(
            expirationMinutes);

        var claims = new List<System.Security.Claims.Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),

            new(
                ClaimTypes.Name,
                user.Name),

            new(
                ClaimTypes.Email,
                user.Email),

            new(
                ClaimTypes.Role,
                user.Role)
        };

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key));

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        var tokenString =
            new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResponse
        {
            UserId = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            Token = tokenString,
            ExpiresAt = expiresAt
        };
    }
}