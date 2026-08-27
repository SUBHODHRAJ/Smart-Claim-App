import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar
  from "../components/Navbar";

import ClaimStatusBadge
  from "../components/ClaimStatusBadge";

import StatusTimeline
  from "../components/customer/StatusTimeline";

import EvidenceGallery
  from "../components/customer/EvidenceGallery";

import claimService
  from "../services/claimService";


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


export default function ClaimDetails() {

  const navigate =
    useNavigate();


  const {
    id,
  } =
    useParams();


  const [
    claim,
    setClaim,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(
    () => {

      const load =
        async () => {

          setLoading(
            true
          );

          setError("");


          try {

            let result;


            if (
              typeof claimService.getClaimById ===
              "function"
            ) {

              result =
                await claimService.getClaimById(
                  id
                );

            } else if (
              typeof claimService.getClaim ===
              "function"
            ) {

              result =
                await claimService.getClaim(
                  id
                );

            } else {

              throw new Error(
                "Claim details API method is not available."
              );

            }


            setClaim(
              result?.data ??
              result
            );

          } catch (
            requestError
          ) {

            console.error(
              requestError
            );


            setError(
              requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load claim details."
            );

          } finally {

            setLoading(
              false
            );

          }

        };


      if (id) {
        load();
      }

    },
    [
      id,
    ]
  );


  if (loading) {

    return (
      <div className="min-vh-100 bg-light">

        <Navbar />

        <div className="container py-5 text-center">

          <div
            className="spinner-border"
          />

          <div className="text-muted mt-3">
            Loading claim...
          </div>

        </div>

      </div>
    );

  }


  if (
    error ||
    !claim
  ) {

    return (
      <div className="min-vh-100 bg-light">

        <Navbar />

        <div className="container py-5">

          <div className="alert alert-danger">
            {error ||
              "Claim not found."}
          </div>

          <button
            type="button"
            className="btn btn-dark"
            onClick={() =>
              navigate(
                "/customer"
              )
            }
          >
            Back to Dashboard
          </button>

        </div>

      </div>
    );

  }


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


  const status =
    getValue(
      claim,
      "status",
      "Status"
    ) ||
    "Pending";


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
    <div className="min-vh-100 bg-light">

      <Navbar />


      <main className="container py-4">

        <button
          type="button"
          className="btn btn-link text-decoration-none text-dark px-0 mb-3"
          onClick={() =>
            navigate(
              "/customer"
            )
          }
        >
          ← Back to Claims
        </button>


        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              {claimNumber}
            </h2>

            <div className="text-muted">
              Package ID: {packageId}
            </div>

          </div>


          <ClaimStatusBadge
            status={
              status
            }
          />

        </div>


        <div className="row g-4">

          <div className="col-12 col-lg-8">

            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body">

                <h5 className="fw-bold mb-4">
                  Claim Information
                </h5>


                <div className="row g-4">

                  <div className="col-sm-6">

                    <div className="small text-muted">
                      Package ID
                    </div>

                    <div className="fw-semibold">
                      {packageId}
                    </div>

                  </div>


                  <div className="col-sm-6">

                    <div className="small text-muted">
                      Damage Type
                    </div>

                    <div className="fw-semibold">
                      {damageType}
                    </div>

                  </div>


                  <div className="col-sm-6">

                    <div className="small text-muted">
                      Claim Amount
                    </div>

                    <div className="fw-bold fs-5">
                      ${amount.toFixed(2)}
                    </div>

                  </div>


                  <div className="col-sm-6">

                    <div className="small text-muted">
                      Status
                    </div>

                    <ClaimStatusBadge
                      status={
                        status
                      }
                    />

                  </div>


                  <div className="col-12">

                    <div className="small text-muted mb-2">
                      Description
                    </div>

                    <div className="bg-light rounded p-3">
                      {description}
                    </div>

                  </div>

                </div>


                {comment && (

                  <div className="mt-4">

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


            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  Uploaded Evidence
                </h5>

                <EvidenceGallery
                  images={
                    images
                  }
                />

              </div>

            </div>

          </div>


          <div className="col-12 col-lg-4">

            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  Status Tracker
                </h5>

                <StatusTimeline
                  status={
                    status
                  }
                />

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
