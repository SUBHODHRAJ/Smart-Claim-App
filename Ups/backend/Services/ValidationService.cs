namespace backend.Services;

public class ValidationService
{
    private static readonly HashSet<string> ValidDamageTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "Damaged",
            "Damaged Package",
            "Lost",
            "Lost Package",
            "Missing",
            "Missing Contents",
            "Wrong Item",
            "Tampered",
            "Tampered Package",
            "Other"
        };

    // ============================================================
    // DAMAGE TYPE
    // ============================================================

    public bool IsValidDamageType(string? damageType)
    {
        if (string.IsNullOrWhiteSpace(damageType))
        {
            return false;
        }

        return ValidDamageTypes.Contains(
            damageType.Trim());
    }

    // ============================================================
    // CLAIM AMOUNT
    // ============================================================

    public bool IsValidClaimAmount(decimal claimAmount)
    {
        return claimAmount > 0 &&
               claimAmount <= 100000;
    }

    // ============================================================
    // VALIDATION STATUS
    // ============================================================

    public string DetermineValidationStatus(
        decimal claimAmount)
    {
        if (!IsValidClaimAmount(claimAmount))
        {
            return "ValidationFailed";
        }

        if (claimAmount > 500)
        {
            return "SeniorReviewRequired";
        }

        return "AutomaticallyValidated";
    }

    // ============================================================
    // PRIORITY
    // ============================================================

    public string CalculatePriority(
        decimal claimAmount,
        string? damageType)
    {
        // Critical:
        // High-value claims or lost packages
        // receive the highest priority.

        if (claimAmount > 5000)
        {
            return "Critical";
        }

        if (claimAmount > 500)
        {
            return "High";
        }

        if (string.Equals(
                damageType?.Trim(),
                "Lost",
                StringComparison.OrdinalIgnoreCase))
        {
            return "High";
        }

        if (claimAmount >= 100)
        {
            return "Medium";
        }

        return "Low";
    }

    // ============================================================
    // SENIOR REVIEW
    // ============================================================

    public bool RequiresSeniorReview(
        decimal claimAmount)
    {
        return claimAmount > 500;
    }

    // ============================================================
    // ALLOWED DAMAGE TYPES
    // ============================================================

    public IReadOnlyCollection<string> GetDamageTypes()
    {
        return ValidDamageTypes.ToList();
    }
}