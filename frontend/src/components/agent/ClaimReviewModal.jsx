import {
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../context/AuthContext";

import claimService
  from "../../services/claimService";

import EvidenceGallery
  from "../customer/EvidenceGallery";

import ClaimStatusBadge
  from "../ClaimStatusBadge";

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

export default function ClaimReviewModal({
  claim,
  onClose,
  onDecision,
}) {
  const { user } = useAuth();
  const isSeniorAgent =
    String(user?.role || user?.Role || "").toLowerCase() === "senioragent";

  const [
    comment,
    setComment,
  ] = useState("");

  const [
    processing,
    setProcessing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

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

  const seniorReviewRequired =
    amount > 500 && !isSeniorAgent;

  const images =
    valueOf(
      claim,
      "images",
      "Images",
      "evidence",
      "Evidence"
    ) || [];

  const currentStatus =
    valueOf(
      claim,
      "status",
      "Status"
    ) ||
    "Pending";

  const claimNumber =
    valueOf(
      claim,
      "claimNumber",
      "ClaimNumber"
    ) ||
    `CLM-${valueOf(
      claim,
      "id",
      "Id",
      "claimId",
      "ClaimId"
    )}`;

  const canDecide =
    useMemo(
      () => {
        const status =
          String(
            currentStatus
          )
            .toLowerCase()
            .replace(
              /[\s_-]+/g,
              ""
            );

        return (
          status === "pending" ||
          status === "underreview" ||
          status === "senioragentreview"
        );
      },
      [
        currentStatus,
      ]
    );

  const submitDecision =
    async decision => {
      setError("");
      setSuccess("");

      if (!comment.trim()) {
        setError(
          "A comment is required before approving or rejecting a claim."
        );
        return;
      }

      if (!canDecide) {
        setError(
          "This claim is not currently awaiting an agent decision."
        );
        return;
      }

      if (
        seniorReviewRequired &&
        decision === "Approved"
      ) {
        setError(
          "Claims above $500 require Senior Agent Review before approval."
        );
        return;
      }


      setProcessing(
        true
      );


      try {

        const id =
          valueOf(
            claim,
            "id",
            "Id",
            "claimId",
            "ClaimId"
          );


        let response;


        if (
          decision ===
          "Approved"
        ) {

          if (
            typeof claimService.approveClaim ===
            "function"
          ) {

            response =
              await claimService.approveClaim(
                id,
                comment.trim()
              );

          } else if (
            typeof claimService.updateClaimStatus ===
            "function"
          ) {

            response =
              await claimService.updateClaimStatus(
                id,
                {
                  status:
                    "Approved",
                  comment:
                    comment.trim(),
                }
              );

          } else {

            throw new Error(
              "Approve claim API method is not available."
            );

          }

        } else {

          if (
            typeof claimService.rejectClaim ===
            "function"
          ) {

            response =
              await claimService.rejectClaim(
                id,
                comment.trim()
              );

          } else if (
            typeof claimService.updateClaimStatus ===
            "function"
          ) {

            response =
              await claimService.updateClaimStatus(
                id,
                {
                  status:
                    "Rejected",
                  comment:
                    comment.trim(),
                }
              );

          } else {

            throw new Error(
              "Reject claim API method is not available."
            );

          }

        }


        console.log(
          "Decision response:",
          response
        );


        setSuccess(
          `Claim ${decision.toLowerCase()} successfully.`
        );


        setTimeout(
          () => {

            if (
              typeof onDecision ===
              "function"
            ) {

              onDecision(
                response
              );

            }

          },
          700
        );


      } catch (
        requestError
      ) {

        console.error(
          "Claim decision failed:",
          requestError
        );


        setError(
          requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to update the claim."
        );

      } finally {

        setProcessing(
          false
        );

      }

    };


  if (
    !claim
  ) {

    return null;

  }


  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{
        background:
          "rgba(0,0,0,.55)",
      }}
    >

      <div className="modal-dialog modal-xl modal-dialog-scrollable">

        <div className="modal-content">

          <div className="modal-header">

            <div>

              <h5 className="modal-title fw-bold">
                Review {claimNumber}
              </h5>

              <div className="small text-muted">
                Package ID:{" "}
                {valueOf(
                  claim,
                  "packageId",
                  "PackageId"
                ) || "-"}
              </div>

            </div>


            <button
              type="button"
              className="btn-close"
              onClick={
                onClose
              }
              disabled={
                processing
              }
            />

          </div>


          <div className="modal-body">

            {error && (

              <div className="alert alert-danger">
                {error}
              </div>

            )}


            {success && (

              <div className="alert alert-success">
                {success}
              </div>

            )}


            <div className="row g-4">

              <div className="col-12 col-lg-7">

                <div className="card border">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Claim Details
                    </h6>


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
                          Claim Amount
                        </div>

                        <div className="fw-bold">
                          ${amount.toFixed(2)}
                        </div>

                      </div>


                      <div className="col-6">

                        <div className="small text-muted">
                          Priority
                        </div>

                        <div className="fw-semibold">
                          {valueOf(
                            claim,
                            "priority",
                            "Priority"
                          ) || "Normal"}
                        </div>

                      </div>


                      <div className="col-6">

                        <div className="small text-muted">
                          Current Status
                        </div>

                        <ClaimStatusBadge
                          status={
                            currentStatus
                          }
                        />

                      </div>


                      <div className="col-12">

                        <div className="small text-muted mb-2">
                          Customer Description
                        </div>

                        <div className="bg-light rounded p-3">
                          {valueOf(
                            claim,
                            "description",
                            "Description"
                          ) || "-"}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>


                <div className="card border mt-3">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Evidence
                    </h6>

                    <EvidenceGallery
                      images={
                        images
                      }
                    />

                  </div>

                </div>

              </div>


              <div className="col-12 col-lg-5">

                <div className="card border">

                  <div className="card-body">

                    <h6 className="fw-bold mb-3">
                      Decision
                    </h6>


                    {seniorReviewRequired && (

                      <div className="alert alert-warning">

                        <div className="fw-bold">
                          ⚠ Senior Agent Review Required
                        </div>

                        <div className="small mt-1">
                          This claim exceeds $500 and cannot be directly approved by a standard agent.
                        </div>

                      </div>

                    )}


                    <label className="form-label fw-semibold">
                      Mandatory Comment
                    </label>

                    <textarea
                      className="form-control"
                      rows="6"
                      placeholder="Explain the reason for your decision..."
                      value={
                        comment
                      }
                      onChange={e =>
                        setComment(
                          e.target.value
                        )
                      }
                      disabled={
                        processing ||
                        !canDecide
                      }
                    />


                    <div className="form-text mb-4">
                      A comment is required for both approval and rejection.
                    </div>


                    {!canDecide && (

                      <div className="alert alert-secondary small">
                        This claim has already been processed.
                      </div>

                    )}


                    <div className="d-grid gap-2">

                      <button
                        type="button"
                        className="btn btn-success"
                        disabled={
                          processing ||
                          !canDecide ||
                          seniorReviewRequired
                        }
                        onClick={() =>
                          submitDecision(
                            "Approved"
                          )
                        }
                      >

                        {processing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Processing...
                          </>
                        ) : (
                          "✓ Approve Claim"
                        )}

                      </button>


                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={
                          processing ||
                          !canDecide
                        }
                        onClick={() =>
                          submitDecision(
                            "Rejected"
                          )
                        }
                      >

                        {processing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Processing...
                          </>
                        ) : (
                          "✕ Reject Claim"
                        )}

                      </button>


                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled={
                          processing
                        }
                        onClick={
                          onClose
                        }
                      >
                        Cancel
                      </button>

                    </div>

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
