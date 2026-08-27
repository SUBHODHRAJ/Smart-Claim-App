import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import Navbar
  from "../components/Navbar";

import ClaimCard
  from "../components/ClaimCard";

import ClaimDetailsModal
  from "../components/customer/ClaimDetailsModal";

import NotificationPanel
  from "../components/customer/NotificationPanel";

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


const normalizeList =
  value => {

    const data =
      value?.data ??
      value;


    if (
      Array.isArray(
        data
      )
    ) {

      return data;

    }


    return (
      data?.items ??
      data?.claims ??
      data?.Claims ??
      []
    );

  };


export default function CustomerDashboard() {

  const navigate =
    useNavigate();


  const [
    claims,
    setClaims,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    selectedClaim,
    setSelectedClaim,
  ] = useState(null);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");


  const loadClaims =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setError("");


        try {

          let result;


          if (
            typeof claimService.getMyClaims ===
            "function"
          ) {

            result =
              await claimService.getMyClaims();

          } else if (
            typeof claimService.getCustomerClaims ===
            "function"
          ) {

            result =
              await claimService.getCustomerClaims();

          } else if (
            typeof claimService.getClaims ===
            "function"
          ) {

            result =
              await claimService.getClaims();

          } else {

            throw new Error(
              "No customer claim API method is available."
            );

          }


          setClaims(
            normalizeList(
              result
            )
          );


        } catch (
          requestError
        ) {

          console.error(
            "Customer claims loading failed:",
            requestError
          );


          setError(
            requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load your claims."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  useEffect(
    () => {

      loadClaims();

    },
    [
      loadClaims,
    ]
  );


  const filteredClaims =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return claims.filter(
          claim => {

            const claimNumber =
              String(
                getValue(
                  claim,
                  "claimNumber",
                  "ClaimNumber"
                )
              )
                .toLowerCase();


            const packageId =
              String(
                getValue(
                  claim,
                  "packageId",
                  "PackageId"
                )
              )
                .toLowerCase();


            const status =
              String(
                getValue(
                  claim,
                  "status",
                  "Status"
                ) ||
                "Pending"
              );


            if (
              query &&
              !claimNumber.includes(
                query
              ) &&
              !packageId.includes(
                query
              )
            ) {

              return false;

            }


            if (
              statusFilter &&
              status
                .toLowerCase()
                .replace(
                  /[\s_-]+/g,
                  ""
                ) !==
                statusFilter
                  .toLowerCase()
                  .replace(
                    /[\s_-]+/g,
                    ""
                  )
            ) {

              return false;

            }


            return true;

          }
        );

      },
      [
        claims,
        search,
        statusFilter,
      ]
    );


  const pending =
    claims.filter(
      claim =>
        String(
          getValue(
            claim,
            "status",
            "Status"
          ) ||
          "Pending"
        )
          .toLowerCase()
          .replace(
            /[\s_-]+/g,
            ""
          ) ===
        "pending"
    ).length;


  const approved =
    claims.filter(
      claim =>
        String(
          getValue(
            claim,
            "status",
            "Status"
          )
        )
          .toLowerCase()
          .replace(
            /[\s_-]+/g,
            ""
          ) ===
        "approved"
    ).length;


  const rejected =
    claims.filter(
      claim =>
        String(
          getValue(
            claim,
            "status",
            "Status"
          )
        )
          .toLowerCase()
          .replace(
            /[\s_-]+/g,
            ""
          ) ===
        "rejected"
    ).length;


  const openClaim =
    claim => {

      setSelectedClaim(
        claim
      );

    };


  const handleRefresh = async () => {
    await loadClaims();
  };


  return (
    <div className="min-vh-100 bg-light">

      <Navbar />


      <main className="container py-4">

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              Customer Dashboard
            </h2>

            <div className="text-muted">
              Track and manage your package claims.
            </div>

          </div>


          <div className="d-flex gap-2">

            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={
                handleRefresh
              }
            >
              ↻ Refresh
            </button>


            <button
              type="button"
              className="btn btn-dark"
              onClick={() =>
                navigate(
                  "/customer/new-claim"
                )
              }
            >
              + New Claim
            </button>

          </div>

        </div>


        {error && (

          <div className="alert alert-danger">

            <div className="fw-semibold">
              Unable to load claims
            </div>

            <div className="small">
              {error}
            </div>

          </div>

        )}


        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-lg-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-primary">
                📦
              </div>
              <div>
                <div className="small text-muted fw-semibold">Total Claims</div>
                <div className="fs-3 fw-extrabold text-dark mt-0.5">{claims.length}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-warning">
                ⏳
              </div>
              <div>
                <div className="small text-muted fw-semibold">Pending Review</div>
                <div className="fs-3 fw-extrabold text-dark mt-0.5">{pending}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-success">
                ✓
              </div>
              <div>
                <div className="small text-muted fw-semibold">Approved Claims</div>
                <div className="fs-3 fw-extrabold text-dark mt-0.5">{approved}</div>
              </div>
            </div>
          </div>
        </div>


        <div className="row g-4">

          <div className="col-12 col-lg-8">

            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">

                  <div>

                    <h5 className="fw-bold mb-1">
                      My Claims
                    </h5>

                    <div className="small text-muted">
                      {filteredClaims.length} claims shown
                    </div>

                  </div>


                  <div className="d-flex gap-2">

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search claim..."
                      value={
                        search
                      }
                      onChange={e =>
                        setSearch(
                          e.target.value
                        )
                      }
                    />


                    <select
                      className="form-select"
                      value={
                        statusFilter
                      }
                      onChange={e =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                    >

                      <option value="">
                        All
                      </option>

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="UnderReview">
                        Under Review
                      </option>

                      <option value="SeniorAgentReview">
                        Senior Review
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>

                  </div>

                </div>


                {loading ? (

                  <div className="text-center py-5">

                    <div
                      className="spinner-border"
                      role="status"
                    />

                    <div className="text-muted mt-3">
                      Loading your claims...
                    </div>

                  </div>

                ) : filteredClaims.length ===
                  0 ? (

                  <div className="text-center py-5">

                    <div className="fs-1 mb-3">
                      📦
                    </div>

                    <h6 className="fw-bold">
                      No claims found
                    </h6>

                    <p className="text-muted">
                      File a claim when you need help with a package.
                    </p>

                    <button
                      type="button"
                      className="btn btn-dark"
                      onClick={() =>
                        navigate(
                          "/customer/new-claim"
                        )
                      }
                    >
                      File a Claim
                    </button>

                  </div>

                ) : (

                  <div className="d-flex flex-column gap-3">

                    {filteredClaims.map(
                      (
                        claim,
                        index
                      ) => (

                        <ClaimCard
                          key={
                            getValue(
                              claim,
                              "id",
                              "Id",
                              "claimId",
                              "ClaimId"
                            ) ||
                            index
                          }
                          claim={
                            claim
                          }
                          onClick={
                            openClaim
                          }
                        />

                      )
                    )}

                  </div>

                )}

              </div>

            </div>

          </div>


          <div className="col-12 col-lg-4">

            <NotificationPanel />


            <div className="card border-0 shadow-sm mt-3">

              <div className="card-body">

                <h6 className="fw-bold">
                  Claim Summary
                </h6>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">
                    Total
                  </span>
                  <span className="fw-semibold">
                    {claims.length}
                  </span>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">
                    Pending
                  </span>
                  <span className="fw-semibold">
                    {pending}
                  </span>
                </div>

                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">
                    Approved
                  </span>
                  <span className="fw-semibold text-success">
                    {approved}
                  </span>
                </div>

                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">
                    Rejected
                  </span>
                  <span className="fw-semibold text-danger">
                    {rejected}
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>


      {selectedClaim && (

        <ClaimDetailsModal
          claim={
            selectedClaim
          }
          onClose={() =>
            setSelectedClaim(
              null
            )
          }
        />

      )}

    </div>
  );
}
