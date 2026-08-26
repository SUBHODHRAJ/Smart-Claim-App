import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AgentNavbar
  from "../components/agent/AgentNavbar";

import StatsCards
  from "../components/agent/StatsCards";

import ClaimFilters
  from "../components/agent/ClaimFilters";

import ClaimTable
  from "../components/agent/ClaimTable";

import ClaimReviewModal
  from "../components/agent/ClaimReviewModal";

import claimService
  from "../services/claimService";


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


const listOf =
  response => {

    const data =
      response?.data ??
      response;

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


const normalized =
  value =>
    String(
      value ||
      ""
    )
      .toLowerCase()
      .replace(
        /[\s_-]+/g,
        ""
      );


export default function AgentDashboard() {

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
    filters,
    setFilters,
  ] = useState({
    search: "",
    status: "",
    damageType: "",
    priority: "",
  });


  const loadClaims =
    useCallback(
      async () => {

        setLoading(
          true
        );

        setError("");


        try {

          let response;


          if (
            typeof claimService.getAllClaims ===
            "function"
          ) {

            response =
              await claimService.getAllClaims();

          } else if (
            typeof claimService.getClaims ===
            "function"
          ) {

            response =
              await claimService.getClaims();

          } else {

            throw new Error(
              "No claim-list API method is available."
            );

          }


          setClaims(
            listOf(
              response
            )
          );


        } catch (
          requestError
        ) {

          console.error(
            "Agent claims loading failed:",
            requestError
          );


          setError(
            requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load claims."
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

        return claims.filter(
          claim => {

            const search =
              filters.search
                .trim()
                .toLowerCase();


            const claimNumber =
              String(
                valueOf(
                  claim,
                  "claimNumber",
                  "ClaimNumber"
                )
              )
                .toLowerCase();


            const packageId =
              String(
                valueOf(
                  claim,
                  "packageId",
                  "PackageId"
                )
              )
                .toLowerCase();


            const status =
              valueOf(
                claim,
                "status",
                "Status"
              );


            const damageType =
              valueOf(
                claim,
                "damageType",
                "DamageType"
              );


            const priority =
              valueOf(
                claim,
                "priority",
                "Priority"
              );


            if (
              search &&
              !claimNumber.includes(
                search
              ) &&
              !packageId.includes(
                search
              )
            ) {

              return false;

            }


            if (
              filters.status &&
              normalized(
                status
              ) !==
              normalized(
                filters.status
              )
            ) {

              return false;

            }


            if (
              filters.damageType &&
              normalized(
                damageType
              ) !==
              normalized(
                filters.damageType
              )
            ) {

              return false;

            }


            if (
              filters.priority &&
              normalized(
                priority
              ) !==
              normalized(
                filters.priority
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
        filters,
      ]
    );


  const stats =
    useMemo(
      () => {

        const pending =
          claims.filter(
            claim => {

              const status =
                normalized(
                  valueOf(
                    claim,
                    "status",
                    "Status"
                  )
                );

              return (
                status ===
                  "pending" ||
                status ===
                  "underreview" ||
                status ===
                  "senioragentreview"
              );

            }
          ).length;


        const approved =
          claims.filter(
            claim =>
              normalized(
                valueOf(
                  claim,
                  "status",
                  "Status"
                )
              ) ===
              "approved"
          ).length;


        const rejected =
          claims.filter(
            claim =>
              normalized(
                valueOf(
                  claim,
                  "status",
                  "Status"
                )
              ) ===
              "rejected"
          ).length;


        const seniorReview =
          claims.filter(
            claim =>
              normalized(
                valueOf(
                  claim,
                  "status",
                  "Status"
                )
              ) ===
              "senioragentreview"
          ).length;


        return {
          total:
            claims.length,
          pending,
          approved,
          rejected,
          seniorReview,
        };

      },
      [
        claims,
      ]
    );


  const updateFilters =
    next => {

      setFilters(
        previous => ({
          ...previous,
          ...next,
        })
      );

    };


  const clearFilters =
    () => {

      setFilters({
        search: "",
        status: "",
        damageType: "",
        priority: "",
      });

    };


  const openClaim =
    claim => {

      setSelectedClaim(
        claim
      );

    };


  const closeClaim =
    () => {

      setSelectedClaim(
        null
      );

    };


  const afterDecision =
    async () => {

      closeClaim();

      await loadClaims();

    };


  return (
    <div className="min-vh-100 bg-light">

      <AgentNavbar />


      <main className="container-fluid px-3 px-lg-4 py-4">

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">

          <div>

            <h2 className="fw-bold mb-1">
              Agent Dashboard
            </h2>

            <div className="text-muted">
              Review and process customer package claims.
            </div>

          </div>


          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={
              loadClaims
            }
          >
            ↻ Refresh Claims
          </button>

        </div>


        {error && (

          <div className="alert alert-danger">

            <div className="fw-semibold">
              Unable to load claims
            </div>

            <div>
              {error}
            </div>

          </div>

        )}


        <StatsCards
          stats={
            stats
          }
        />


        <div className="card border-0 shadow-sm mt-4">

          <div className="card-body">

            <div className="d-flex justify-content-between align-items-center mb-3">

              <div>

                <h5 className="fw-bold mb-1">
                  Claims Queue
                </h5>

                <div className="small text-muted">
                  {filteredClaims.length} claim(s) matching current filters
                </div>

              </div>

            </div>


            <ClaimFilters
              filters={
                filters
              }
              onChange={
                updateFilters
              }
              onClear={
                clearFilters
              }
            />


            <div className="mt-4">

              {loading ? (

                <div className="text-center py-5">

                  <div
                    className="spinner-border"
                    role="status"
                  />

                  <div className="text-muted mt-3">
                    Loading claims...
                  </div>

                </div>

              ) : (

                <ClaimTable
                  claims={
                    filteredClaims
                  }
                  onSelect={
                    openClaim
                  }
                />

              )}

            </div>

          </div>

        </div>

      </main>


      {selectedClaim && (

        <ClaimReviewModal
          claim={
            selectedClaim
          }
          onClose={
            closeClaim
          }
          onDecision={
            afterDecision
          }
        />

      )}

    </div>
  );
}
