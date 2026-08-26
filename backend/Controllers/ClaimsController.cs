using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClaimsController : ControllerBase
{
    private readonly ClaimService _claimService;

    public ClaimsController(
        ClaimService claimService)
    {
        _claimService = claimService;
    }

    // ============================================================
    // CUSTOMER - CREATE CLAIM
    // ============================================================

    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateClaim(
        [FromBody] CreateClaimRequest request)
    {
        try
        {
            var customerId = GetCurrentUserId();

            var claim =
                await _claimService.CreateClaimAsync(
                    request,
                    customerId);

            return CreatedAtAction(
                nameof(GetClaim),
                new { id = claim.Id },
                claim);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // CUSTOMER - GET MY CLAIMS
    // ============================================================

    [HttpGet("my")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyClaims()
    {
        var customerId = GetCurrentUserId();

        var claims =
            await _claimService.GetCustomerClaimsAsync(
                customerId);

        return Ok(claims);
    }

    // ============================================================
    // GET SINGLE CLAIM
    // ============================================================

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetClaim(
        int id)
    {
        var userId = GetCurrentUserId();

        var role = User.FindFirstValue(
            ClaimTypes.Role);

        if (role == "Customer")
        {
            var claim =
                await _claimService
                    .GetClaimForCustomerAsync(
                        id,
                        userId);

            if (claim == null)
            {
                return NotFound(new
                {
                    message = "Claim not found."
                });
            }

            return Ok(claim);
        }

        if (role == "Agent" ||
            role == "SeniorAgent")
        {
            var claim =
                await _claimService
                    .GetClaimForAgentAsync(id);

            if (claim == null)
            {
                return NotFound(new
                {
                    message = "Claim not found."
                });
            }

            return Ok(claim);
        }

        return Forbid();
    }

    // ============================================================
    // AGENT - GET CLAIMS
    // ============================================================

    [HttpGet("agent")]
    [Authorize(Roles = "Agent,SeniorAgent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAgentClaims(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] string? damageType,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? search)
    {
        var claims =
            await _claimService.GetAgentClaimsAsync(
                status,
                priority,
                damageType,
                fromDate,
                toDate,
                search);

        return Ok(claims);
    }

    // ============================================================
    // AGENT - DASHBOARD STATISTICS
    // ============================================================

    [HttpGet("agent/statistics")]
    [Authorize(Roles = "Agent,SeniorAgent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var statistics =
            await _claimService.GetStatisticsAsync();

        return Ok(statistics);
    }

    // ============================================================
    // AGENT - APPROVE
    // ============================================================

    [HttpPost("{id:int}/approve")]
    [Authorize(Roles = "Agent,SeniorAgent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveClaim(
        int id,
        [FromBody] DecisionRequest request)
    {
        try
        {
            var agentId = GetCurrentUserId();

            var claim =
                await _claimService.ApproveClaimAsync(
                    id,
                    agentId,
                    request.Comment);

            if (claim == null)
            {
                return NotFound(new
                {
                    message = "Claim not found."
                });
            }

            return Ok(claim);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains(
                    "Senior Agent",
                    StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message = ex.Message
                    });
            }

            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // AGENT - REJECT
    // ============================================================

    [HttpPost("{id:int}/reject")]
    [Authorize(Roles = "Agent,SeniorAgent")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectClaim(
        int id,
        [FromBody] DecisionRequest request)
    {
        try
        {
            var agentId = GetCurrentUserId();

            var claim =
                await _claimService.RejectClaimAsync(
                    id,
                    agentId,
                    request.Comment);

            if (claim == null)
            {
                return NotFound(new
                {
                    message = "Claim not found."
                });
            }

            return Ok(claim);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // CUSTOMER - IMAGE UPLOAD
    // ============================================================

    [HttpPost("{id:int}/images")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadImage(
        int id,
        IFormFile file)
    {
        try
        {
            var customerId = GetCurrentUserId();

            var claim =
                await _claimService.UploadImageAsync(
                    id,
                    customerId,
                    file);

            if (claim == null)
            {
                return NotFound(new
                {
                    message =
                        "Claim not found or does not belong to you."
                });
            }

            return Ok(claim);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // CURRENT USER ID
    // ============================================================

    private int GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
                userId,
                out var id))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return id;
    }
}