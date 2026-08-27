import EvidenceGallery
  from "./EvidenceGallery";

import StatusTimeline
  from "./StatusTimeline";

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


export default function ClaimDetailsModal({
  claim,
  onClose,
}) {

  if (!claim) {
    return null;
  }


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
    `CLM-${id}`;


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


  const description =
    getValue(
      claim,
      "description",
      "Description"
    ) || "-";


  const status =
    getValue(
      claim,
      "status",
      "Status"
    ) ||
    "Pending";


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


  const images =
    getValue(
      claim,
      "images",
      "Images",
      "evidence",
      "Evidence"
    ) || [];


  const comment =
    getValue(
      claim,
      "agentComment",
      "AgentComment",
      "decisionComment",
      "DecisionComment",
      "reviewComment",
      "ReviewComment"
    );


  return (
    <div
      className="modal d-block"
      style={{
        background:
          "rgba(0,0,0,.55)",
      }}
      role="dialog"
    >

      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

        <div className="modal-content">

          <div className="modal-header">

            <div>

              <h5 className="modal-title fw-bold">
                {claimNumber}
              </h5>

              <div className="small text-muted">
                Package ID: {packageId}
              </div>

            </div>


            <button
              type="button"
              className="btn-close"
              onClick={
                onClose
              }
            />

          </div>


          <div className="modal-body">

            <div className="row g-4">

              <div className="col-12 col-lg-8">

                <div className="card border mb-4">

                  <div className="card-body">

                    <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">

                      <div>

                        <div className="small text-muted">
                          Claim Status
                        </div>

                        <ClaimStatusBadge
                          status={
                            status
                          }
                        />

                      </div>


                      <div>

                        <div className="small text-muted">
                          Claim Amount
                        </div>

                        <div className="fs-5 fw-bold">
                          ${amount.toFixed(2)}
                        </div>

                      </div>


                      <div>

                        <div className="small text-muted">
                          Damage Type
                        </div>

                        <div className="fw-semibold">
                          {damageType}
                        </div>

                      </div>

                    </div>


                    <hr />


                    <div>

                      <div className="small text-muted mb-2">
                        Description
                      </div>

                      <div className="bg-light rounded p-3">
                        {description}
                      </div>

                    </div>


                    {comment && (

                      <div className="mt-3">

                        <div className="small text-muted mb-2">
                          Agent Comment
                        </div>

                        <div className="alert alert-secondary mb-0">
                          {comment}
                        </div>

                      </div>

                    )}

                  </div>

                </div>


                <div className="card border">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Package Evidence
                    </h6>

                    <EvidenceGallery
                      images={
                        images
                      }
                    />

                  </div>

                </div>

              </div>


              <div className="col-12 col-lg-4">

                <div className="card border">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Claim Progress
                    </h6>

                    <StatusTimeline
                      status={
                        status
                      }
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
