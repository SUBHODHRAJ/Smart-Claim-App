using System.Security.Cryptography;
using backend.DTOs;
using backend.Models;
using backend.Repositories;

namespace backend.Services;

public class ClaimService
{
    private readonly IClaimRepository _claimRepository;
    private readonly ValidationService _validationService;
    private readonly NotificationService _notificationService;
    private readonly IUserRepository _userRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<ClaimService> _logger;

    public ClaimService(
        IClaimRepository claimRepository,
        ValidationService validationService,
        NotificationService notificationService,
        IUserRepository userRepository,
        IWebHostEnvironment environment,
        ILogger<ClaimService> logger)
    {
        _claimRepository = claimRepository;
        _validationService = validationService;
        _notificationService = notificationService;
        _userRepository = userRepository;
        _environment = environment;
        _logger = logger;
    }

    // ============================================================
    // CREATE CLAIM
    // ============================================================

    public async Task<ClaimResponse> CreateClaimAsync(
        CreateClaimRequest request,
        int customerId)
    {
        if (string.IsNullOrWhiteSpace(request.PackageId))
        {
            throw new ArgumentException(
                "Package ID is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Description))
        {
            throw new ArgumentException(
                "Claim description is required.");
        }

        if (request.ClaimAmount <= 0)
        {
            throw new ArgumentException(
                "Claim amount must be greater than zero.");
        }

        if (!_validationService.IsValidDamageType(
                request.DamageType))
        {
            throw new ArgumentException(
                "Invalid damage type.");
        }
        if (!_validationService.IsValidClaimAmount(
                request.ClaimAmount))
        {
            throw new ArgumentException(
                "Claim amount must be greater than $0 and cannot exceed $100,000.");
        }
        var priority =
            _validationService.CalculatePriority(
                request.ClaimAmount,
                request.DamageType);

        var validationStatus =
            _validationService.DetermineValidationStatus(
                request.ClaimAmount);

        var status =
            request.ClaimAmount > 500
                ? "SeniorAgentReview"
                : "Pending";

        var claim = new Claim
        {
            ClaimNumber = GenerateClaimNumber(),
            PackageId = request.PackageId.Trim(),
            CustomerId = customerId,
            Description = request.Description.Trim(),
            DamageType = request.DamageType.Trim(),
            ClaimAmount = request.ClaimAmount,
            Priority = priority,
            Status = status,
            ValidationStatus = validationStatus,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _claimRepository.CreateAsync(claim);

        await _claimRepository.AddHistoryAsync(
            new ClaimHistory
            {
                ClaimId = claim.Id,
                PreviousStatus = "None",
                NewStatus = status,
                ChangedBy = customerId,
                Comment = "Claim submitted by customer.",
                ChangedAt = DateTime.UtcNow
            });

        if (status == "SeniorAgentReview")
        {
            await _notificationService
                .CreateStatusNotificationAsync(
                    claim,
                    $"Claim {claim.ClaimNumber} has been submitted and requires Senior Agent Review.",
                    "SeniorReview");
        }
        else
        {
            await _notificationService
                .CreateStatusNotificationAsync(
                    claim,
                    $"Claim {claim.ClaimNumber} has been successfully submitted.",
                    "ClaimCreated");
        }

        return MapToResponse(claim);
    }

    // ============================================================
    // CUSTOMER CLAIMS
    // ============================================================

    public async Task<List<ClaimResponse>> GetCustomerClaimsAsync(
        int customerId)
    {
        var claims =
            await _claimRepository.GetCustomerClaimsAsync(
                customerId);

        return claims
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<ClaimResponse?> GetClaimForCustomerAsync(
        int claimId,
        int customerId)
    {
        var claim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        if (claim == null ||
            claim.CustomerId != customerId)
        {
            return null;
        }

        return MapToResponse(claim);
    }

    // ============================================================
    // AGENT CLAIMS
    // ============================================================

public async Task<List<ClaimResponse>> GetAgentClaimsAsync(
    string? status,
    string? priority,
    string? damageType,
    DateTime? fromDate = null,
    DateTime? toDate = null,
    string? search = null)
{
    var claims =
        await _claimRepository.GetAgentClaimsAsync(
            status,
            priority,
            damageType,
            fromDate,
            toDate,
            search);

    return claims
        .Select(MapToResponse)
        .ToList();
}
    public async Task<ClaimStatistics> GetStatisticsAsync()
    {
        return await _claimRepository
            .GetStatisticsAsync();
    }

    public async Task<ClaimResponse?> GetClaimForAgentAsync(
        int claimId)
    {
        var claim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        if (claim == null)
        {
            return null;
        }

        return MapToResponse(claim);
    }

    // ============================================================
    // APPROVE CLAIM
    // ============================================================

    public async Task<ClaimResponse?> ApproveClaimAsync(
        int claimId,
        int agentId,
        string comment)
    {
        var claim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        if (claim == null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(comment))
        {
            throw new ArgumentException(
                "Approval comment is required.");
        }

        if (claim.Status == "Approved" ||
            claim.Status == "Rejected")
        {
            throw new InvalidOperationException(
                "This claim has already been decided.");
        }

        // --------------------------------------------------------
        // Get the actual agent from database.
        // --------------------------------------------------------

        var agent =
            await _userRepository.GetByIdAsync(agentId);

        if (agent == null)
        {
            throw new UnauthorizedAccessException(
                "Agent account could not be found.");
        }

        // --------------------------------------------------------
        // Claims above $500 require Senior Agent.
        // --------------------------------------------------------

        if (claim.ClaimAmount > 500 &&
            !string.Equals(
                agent.Role,
                "SeniorAgent",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "This claim requires Senior Agent Review.");
        }

        var previousStatus = claim.Status;

        claim.Status = "Approved";
        claim.AgentComment = comment.Trim();
        claim.AssignedAgentId = agentId;
        claim.UpdatedAt = DateTime.UtcNow;

        await _claimRepository.UpdateAsync(claim);

        await _claimRepository.AddHistoryAsync(
            new ClaimHistory
            {
                ClaimId = claim.Id,
                PreviousStatus = previousStatus,
                NewStatus = "Approved",
                ChangedBy = agentId,
                Comment = comment.Trim(),
                ChangedAt = DateTime.UtcNow
            });

        await _notificationService
            .CreateStatusNotificationAsync(
                claim,
                $"Your claim {claim.ClaimNumber} has been approved.",
                "Approved");

        var updatedClaim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        return updatedClaim == null
            ? null
            : MapToResponse(updatedClaim);
    }

    // ============================================================
    // REJECT CLAIM
    // ============================================================

    public async Task<ClaimResponse?> RejectClaimAsync(
        int claimId,
        int agentId,
        string comment)
    {
        var claim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        if (claim == null)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(comment))
        {
            throw new ArgumentException(
                "Rejection comment is required.");
        }

        if (claim.Status == "Approved" ||
            claim.Status == "Rejected")
        {
            throw new InvalidOperationException(
                "This claim has already been decided.");
        }

        var agent =
            await _userRepository.GetByIdAsync(agentId);

        if (agent == null)
        {
            throw new UnauthorizedAccessException(
                "Agent account could not be found.");
        }

        var previousStatus = claim.Status;

        claim.Status = "Rejected";
        claim.AgentComment = comment.Trim();
        claim.AssignedAgentId = agentId;
        claim.UpdatedAt = DateTime.UtcNow;

        await _claimRepository.UpdateAsync(claim);

        await _claimRepository.AddHistoryAsync(
            new ClaimHistory
            {
                ClaimId = claim.Id,
                PreviousStatus = previousStatus,
                NewStatus = "Rejected",
                ChangedBy = agentId,
                Comment = comment.Trim(),
                ChangedAt = DateTime.UtcNow
            });

        await _notificationService
            .CreateStatusNotificationAsync(
                claim,
                $"Your claim {claim.ClaimNumber} has been rejected. Reason: {comment.Trim()}",
                "Rejected");

        var updatedClaim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        return updatedClaim == null
            ? null
            : MapToResponse(updatedClaim);
    }

    // ============================================================
    // IMAGE UPLOAD
    // ============================================================

    public async Task<ClaimResponse?> UploadImageAsync(
        int claimId,
        int customerId,
        IFormFile file)
    {
        var claim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        if (claim == null ||
            claim.CustomerId != customerId)
        {
            return null;
        }

        ValidateImage(file);

        // Use WebRootPath when available; fall back to ContentRootPath/wwwroot
        // so uploads work correctly in all hosting environments.
        var webRoot = _environment.WebRootPath
            ?? Path.Combine(_environment.ContentRootPath, "wwwroot");

        var uploadsFolder = Path.Combine(
            webRoot,
            "uploads",
            "claims",
            claim.ClaimNumber);

        Directory.CreateDirectory(uploadsFolder);

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        var safeFileName =
            $"{Guid.NewGuid():N}{extension}";

        var filePath =
            Path.Combine(
                uploadsFolder,
                safeFileName);

        await using (var stream =
            new FileStream(
                filePath,
                FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativeUrl =
            $"/uploads/claims/{claim.ClaimNumber}/{safeFileName}";

        var image = new ClaimImage
        {
            ClaimId = claim.Id,
            ImageUrl = relativeUrl,
            OriginalFileName =
                Path.GetFileName(file.FileName),
            ContentType = file.ContentType,
            UploadedAt = DateTime.UtcNow
        };

        await _claimRepository.AddImageAsync(image);

        _logger.LogInformation(
            "Image uploaded for claim {ClaimNumber}",
            claim.ClaimNumber);

        var updatedClaim =
            await _claimRepository.GetByIdWithDetailsAsync(
                claimId);

        return updatedClaim == null
            ? null
            : MapToResponse(updatedClaim);
    }

    // ============================================================
    // IMAGE VALIDATION
    // ============================================================

    private static void ValidateImage(IFormFile file)
    {
        if (file == null ||
            file.Length == 0)
        {
            throw new ArgumentException(
                "Image file is required.");
        }

        const long maxFileSize =
            5 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            throw new ArgumentException(
                "Image size cannot exceed 5 MB.");
        }

        var allowedExtensions = new[]
        {
            ".jpg",
            ".jpeg",
            ".png"
        };

        var extension =
            Path.GetExtension(file.FileName)
                .ToLowerInvariant();

        if (!allowedExtensions.Contains(
                extension))
        {
            throw new ArgumentException(
                "Only JPG, JPEG and PNG images are allowed.");
        }

        var allowedContentTypes = new[]
        {
            "image/jpeg",
            "image/png"
        };

        if (!allowedContentTypes.Contains(
                file.ContentType.ToLowerInvariant()))
        {
            throw new ArgumentException(
                "Invalid image content type.");
        }
    }

    // ============================================================
    // CLAIM NUMBER
    // ============================================================

    private static string GenerateClaimNumber()
    {
        var randomNumber =
            RandomNumberGenerator.GetInt32(
                100000,
                999999);

        return $"CLM-{randomNumber}";
    }

    // ============================================================
    // RESPONSE MAPPING
    // ============================================================

    private static ClaimResponse MapToResponse(
        Claim claim)
    {
        return new ClaimResponse
        {
            Id = claim.Id,
            ClaimNumber = claim.ClaimNumber,
            PackageId = claim.PackageId,
            CustomerId = claim.CustomerId,
            CustomerName = claim.Customer?.Name,
            CustomerEmail = claim.Customer?.Email,
            AssignedAgentId = claim.AssignedAgentId,
            AssignedAgentName = claim.AssignedAgent?.Name,
            Description = claim.Description,
            DamageType = claim.DamageType,
            ClaimAmount = claim.ClaimAmount,
            Priority = claim.Priority,
            Status = claim.Status,
            ValidationStatus = claim.ValidationStatus,
            AgentComment = claim.AgentComment,
            CreatedAt = claim.CreatedAt,
            UpdatedAt = claim.UpdatedAt,

            Images = claim.Images
                .Select(image => new ClaimImageResponse
                {
                    Id = image.Id,
                    ImageUrl = image.ImageUrl,
                    OriginalFileName =
                        image.OriginalFileName,
                    UploadedAt =
                        image.UploadedAt
                })
                .ToList(),

            History = claim.History
                .OrderBy(h => h.ChangedAt)
                .Select(history =>
                    new ClaimHistoryResponse
                    {
                        Id = history.Id,
                        PreviousStatus =
                            history.PreviousStatus,
                        NewStatus =
                            history.NewStatus,
                        ChangedByName =
                            history.ChangedByUser?.Name,
                        Comment =
                            history.Comment,
                        ChangedAt =
                            history.ChangedAt
                    })
                .ToList()
        };
    }
}