import ClaimStatusBadge from "../ClaimStatusBadge";

const valueOf = (object, ...keys) => {
  for (const key of keys) {
    if (object?.[key] !== undefined && object?.[key] !== null) {
      return object[key];
    }
  }
  return "";
};

const getPriorityBadge = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "critical") {
    return <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">Critical</span>;
  }
  if (p === "high") {
    return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold">High</span>;
  }
  if (p === "medium") {
    return <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold">Medium</span>;
  }
  return <span className="badge bg-light text-secondary border fw-normal">Low</span>;
};

export default function ClaimTable({ claims = [], onSelect }) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <div className="fs-1 mb-2">📭</div>
        <h6 className="fw-bold text-dark mb-1">No claims match the active filters</h6>
        <div className="small">Try adjusting search parameters or clearing filters.</div>
      </div>
    );
  }

  return (
    <div className="table-responsive rounded-3 border overflow-hidden">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Claim ID / Date</th>
            <th>Package Tracking</th>
            <th>Damage Category</th>
            <th>Amount</th>
            <th>Priority</th>
            <th>Status</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim, index) => {
            const id = valueOf(claim, "id", "Id", "claimId", "ClaimId");
            const claimNumber = valueOf(claim, "claimNumber", "ClaimNumber") || `CLM-${id || index + 1}`;
            const packageId = valueOf(claim, "packageId", "PackageId") || "-";
            const damageType = valueOf(claim, "damageType", "DamageType") || "-";
            const amount = Number(
              valueOf(claim, "claimAmount", "ClaimAmount", "amount", "Amount") || 0
            );
            const priority = valueOf(claim, "priority", "Priority") || "Low";
            const status = valueOf(claim, "status", "Status") || "Pending";
            const createdAt = valueOf(claim, "createdAt", "CreatedAt");

            return (
              <tr key={id || claimNumber || index}>
                <td>
                  <div className="fw-bold text-dark">{claimNumber}</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
                  </div>
                </td>

                <td>
                  <span className="font-monospace text-dark bg-light px-2 py-0.5 rounded small border">
                    {packageId}
                  </span>
                </td>

                <td className="fw-medium text-dark">{damageType}</td>

                <td className="fw-bold text-dark">${amount.toFixed(2)}</td>

                <td>{getPriorityBadge(priority)}</td>

                <td>
                  <ClaimStatusBadge status={status} />
                </td>

                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-sm btn-dark px-3 fw-semibold"
                    onClick={() => typeof onSelect === "function" && onSelect(claim)}
                  >
                    Review
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
