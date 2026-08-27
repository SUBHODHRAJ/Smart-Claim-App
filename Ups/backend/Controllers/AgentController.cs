using System.Security.Claims;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Agent,SeniorAgent")]
public class AgentController : ControllerBase
{
    private readonly ClaimService _claimService;

    public AgentController(ClaimService claimService)
    {
        _claimService = claimService;
    }

    // Get claims with optional filters
    [HttpGet("claims")]
    public async Task<IActionResult> GetClaims(
        [FromQuery] string? status = null,
        [FromQuery] string? priority = null,
        [FromQuery] string? damageType = null)
    {
        var claims =
            await _claimService.GetAgentClaimsAsync(
                status,
                priority,
                damageType);

        return Ok(claims);
    }

    // Get specific claim
    [HttpGet("claims/{id:int}")]
    public async Task<IActionResult> GetClaim(
        int id)
    {
        var claim =
            await _claimService.GetClaimForAgentAsync(id);

        if (claim == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Claim not found."
            });
        }

        return Ok(claim);
    }

    // Approve claim
    [HttpPost("claims/{id:int}/approve")]
    [Authorize(Roles = "Agent,SeniorAgent")]
    public async Task<IActionResult> ApproveClaim(
        int id,
        [FromBody] DecisionRequest request)
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
                success = false,
                message = "Claim not found."
            });
        }

        return Ok(claim);
    }

    // Reject claim
    [HttpPost("claims/{id:int}/reject")]
    [Authorize(Roles = "Agent,SeniorAgent")]
    public async Task<IActionResult> RejectClaim(
        int id,
        [FromBody] DecisionRequest request)
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
                success = false,
                message = "Claim not found."
            });
        }

        return Ok(claim);
    }

    private int GetCurrentUserId()
    {
        var claim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (claim == null ||
            !int.TryParse(
                claim.Value,
                out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid authentication token.");
        }

        return userId;
    }
}