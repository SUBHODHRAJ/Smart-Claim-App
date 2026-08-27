import ClaimStatusBadge from "./ClaimStatusBadge";

const getValue = (object, ...keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      return object[key];
    }
  }
  return "";
};

export default function ClaimCard({ claim, onClick }) {
  if (!claim) {
    return null;
  }

  const id = getValue(claim, "id", "Id", "claimId", "ClaimId");
  const claimNumber = getValue(claim, "claimNumber", "ClaimNumber") || `CLM-${id}`;
  const packageId = getValue(claim, "packageId", "PackageId") || "-";
  const damageType = getValue(claim, "damageType", "DamageType") || "-";
  const status = getValue(claim, "status", "Status") || "Pending";
  const amount = Number(
    getValue(claim, "claimAmount", "ClaimAmount", "amount", "Amount") || 0
  );
  const createdAt = getValue(claim, "createdAt", "CreatedAt");

  let dateStr = "-";
  if (createdAt) {
    const parsed = new Date(createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      dateStr = parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return (
    <div
      className="card claim-card-interactive shadow-sm border p-3.5 mb-2.5"
      onClick={() => onClick && onClick(claim)}
    >
      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-extrabold text-dark fs-6">{claimNumber}</span>
          </div>
          <div className="text-muted small">
            Package ID: <span className="fw-mono text-dark">{packageId}</span>
          </div>
        </div>
        <ClaimStatusBadge status={status} />
      </div>

      <hr className="my-2 opacity-10" />

      <div className="row g-2 align-items-center">
        <div className="col-4">
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
            Damage Type
          </div>
          <div className="fw-semibold text-dark small">{damageType}</div>
        </div>

        <div className="col-4">
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
            Claim Amount
          </div>
          <div className="fw-bold text-dark fs-6">${amount.toFixed(2)}</div>
        </div>

        <div className="col-4 text-end">
          <div className="text-muted" style={{ fontSize: "0.75rem" }}>
            Submitted
          </div>
          <div className="small text-secondary">{dateStr}</div>
        </div>
      </div>
    </div>
  );
}
