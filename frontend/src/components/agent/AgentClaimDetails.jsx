import ClaimStatusBadge
  from "../ClaimStatusBadge";
import EvidenceGallery
  from "../customer/EvidenceGallery";


const valueOf = (
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


export default function AgentClaimDetails({
  claim,
}) {

  if (
    !claim
  ) {

    return (
      <div className="text-muted">
        Select a claim to view details.
      </div>
    );

  }


  const amount =
    Number(
      valueOf(
        claim,
        "claimAmount",
        "ClaimAmount",
        "amount",
        "Amount"
      ) || 0
    );


  return (
    <div>

      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">

        <div>

          <h5 className="fw-bold mb-1">
            {valueOf(
              claim,
              "claimNumber",
              "ClaimNumber"
            ) || "Claim"}
          </h5>

          <div className="text-muted small">
            Package:{" "}
            {valueOf(
              claim,
              "packageId",
              "PackageId"
            ) || "-"}
          </div>

        </div>


        <ClaimStatusBadge
          status={
            valueOf(
              claim,
              "status",
              "Status"
            ) || "Pending"
          }
        />

      </div>


      <div className="row g-3">

        <div className="col-6">

          <div className="small text-muted">
            Damage Type
          </div>

          <div className="fw-semibold">
            {valueOf(
              claim,
              "damageType",
              "DamageType"
            ) || "-"}
          </div>

        </div>


        <div className="col-6">

          <div className="small text-muted">
            Amount
          </div>

          <div className="fw-bold">
            ${amount.toFixed(2)}
          </div>

        </div>


        <div className="col-12">
          <div className="small text-muted">
            Description
          </div>
          <div className="bg-light rounded p-3 mt-2">
            {valueOf(
              claim,
              "description",
              "Description"
            ) || "-"}
          </div>
        </div>

        <div className="col-12 mt-3">
          <div className="small text-muted mb-2">
            Supporting Evidence
          </div>
          <EvidenceGallery
            images={
              valueOf(
                claim,
                "images",
                "Images",
                "evidence",
                "Evidence"
              ) || []
            }
          />
        </div>
      </div>
    </div>
  );
}
