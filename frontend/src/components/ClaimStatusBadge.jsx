const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

export default function ClaimStatusBadge({ status }) {
  const normalized = normalize(status);

  let badgeClass = "status-badge status-badge-pending";
  let displayLabel = status || "Pending";
  let dotColor = "#d97706";

  if (normalized === "pending") {
    badgeClass = "status-badge status-badge-pending";
    displayLabel = "Pending";
    dotColor = "#b45309";
  } else if (
    normalized === "underreview" ||
    normalized === "senioragentreview"
  ) {
    badgeClass = "status-badge status-badge-review";
    displayLabel = normalized === "senioragentreview" ? "Senior Review" : "Under Review";
    dotColor = "#1d4ed8";
  } else if (normalized === "approved") {
    badgeClass = "status-badge status-badge-approved";
    displayLabel = "Approved";
    dotColor = "#047857";
  } else if (normalized === "rejected") {
    badgeClass = "status-badge status-badge-rejected";
    displayLabel = "Rejected";
    dotColor = "#b91c1c";
  }

  return (
    <span className={badgeClass}>
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: dotColor,
          display: "inline-block",
        }}
      />
      {displayLabel}
    </span>
  );
}
