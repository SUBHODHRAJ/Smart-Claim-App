import ClaimStatusBadge
  from "../ClaimStatusBadge";


const getValue = (
  object,
  ...keys
) => {

  for (
    const key of keys
  ) {

    if (
      object?.[key] !==
      undefined &&
      object?.[key] !==
      null
    ) {

      return object[key];

    }

  }

  return "";
};


const formatDate = (
  value
) => {

  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


export default function AgentClaimTable({
  claims = [],
  loading = false,
  onSelect,
}) {

  if (loading) {

    return (
      <div className="card border-0 shadow-sm">

        <div className="card-body text-center py-5">

          <div
            className="spinner-border"
            role="status"
          />

          <div className="text-muted mt-3">
            Loading claims...
          </div>

        </div>

      </div>
    );

  }


  if (
    claims.length === 0
  ) {

    return (
      <div className="card border-0 shadow-sm">

        <div className="card-body text-center py-5">

          <div className="fs-1 mb-2">
            ✓
          </div>

          <h6 className="fw-bold">
            No claims found
          </h6>

          <p className="text-muted mb-0">
            There are no claims matching the selected filters.
          </p>

        </div>

      </div>
    );

  }


  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body p-0">

        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">

              <tr>

                <th className="px-3 py-3">
                  Claim
                </th>

                <th>
                  Package
                </th>

                <th>
                  Damage
                </th>

                <th>
                  Amount
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Status
                </th>

                <th>
                  Submitted
                </th>

                <th className="text-end px-3">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {claims.map(
                (
                  claim,
                  index
                ) => {

                  const id =
                    getValue(
                      claim,
                      "id",
                      "Id",
                      "claimId",
                      "ClaimId"
                    );


                  const claimNumber =
                    getValue(
                      claim,
                      "claimNumber",
                      "ClaimNumber"
                    ) ||
                    `CLM-${id || index + 1}`;


                  const packageId =
                    getValue(
                      claim,
                      "packageId",
                      "PackageId"
                    ) || "-";


                  const damageType =
                    getValue(
                      claim,
                      "damageType",
                      "DamageType"
                    ) || "-";


                  const amount =
                    Number(
                      getValue(
                        claim,
                        "claimAmount",
                        "ClaimAmount",
                        "amount",
                        "Amount"
                      ) || 0
                    );


                  const priority =
                    getValue(
                      claim,
                      "priority",
                      "Priority"
                    ) ||
                    (
                      amount >
                      500
                        ? "High"
                        : "Medium"
                    );


                  const status =
                    getValue(
                      claim,
                      "status",
                      "Status"
                    ) ||
                    "Pending";


                  const createdAt =
                    getValue(
                      claim,
                      "createdAt",
                      "CreatedAt"
                    );


                  return (

                    <tr
                      key={
                        id ||
                        claimNumber ||
                        index
                      }
                    >

                      <td className="px-3">

                        <div className="fw-semibold">
                          {claimNumber}
                        </div>

                        <div className="small text-muted">
                          Customer claim
                        </div>

                      </td>


                      <td>
                        <span className="fw-medium">
                          {packageId}
                        </span>
                      </td>


                      <td>
                        {damageType}
                      </td>


                      <td>
                        <span className="fw-semibold">
                          ${amount.toFixed(2)}
                        </span>
                      </td>


                      <td>

                        <span
                          className={
                            `badge ${
                              String(
                                priority
                              ).toLowerCase() ===
                              "high"
                                ? "text-bg-danger"
                                : String(
                                    priority
                                  ).toLowerCase() ===
                                  "low"
                                  ? "text-bg-secondary"
                                  : "text-bg-warning"
                            }`
                          }
                        >
                          {priority}
                        </span>

                      </td>


                      <td>

                        <ClaimStatusBadge
                          status={
                            status
                          }
                        />

                      </td>


                      <td className="small text-muted">
                        {formatDate(
                          createdAt
                        )}
                      </td>


                      <td className="text-end px-3">

                        <button
                          type="button"
                          className="btn btn-sm btn-dark"
                          onClick={() =>
                            onSelect &&
                            onSelect(
                              claim
                            )
                          }
                        >
                          Review
                        </button>

                      </td>

                    </tr>

                  );

                }
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}
