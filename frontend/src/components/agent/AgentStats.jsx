export default function AgentStats({
  claims = [],
}) {

  const getStatus = (
    claim
  ) =>
    String(
      claim?.status ??
      claim?.Status ??
      "Pending"
    ).toLowerCase()
      .replace(
        /[\s_-]+/g,
        ""
      );


  const getAmount = (
    claim
  ) =>
    Number(
      claim?.claimAmount ??
      claim?.ClaimAmount ??
      claim?.amount ??
      claim?.Amount ??
      0
    );


  const pending =
    claims.filter(
      claim =>
        getStatus(
          claim
        ) === "pending"
    ).length;


  const review =
    claims.filter(
      claim => {

        const status =
          getStatus(
            claim
          );

        return (
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
        getStatus(
          claim
        ) === "approved"
    ).length;


  const highValue =
    claims.filter(
      claim =>
        getAmount(
          claim
        ) > 500
    ).length;


  const cards = [
    {
      label:
        "Pending Claims",
      value:
        pending,
      icon:
        "⏳",
    },
    {
      label:
        "Under Review",
      value:
        review,
      icon:
        "🔎",
    },
    {
      label:
        "Approved",
      value:
        approved,
      icon:
        "✓",
    },
    {
      label:
        "Senior Review",
      value:
        highValue,
      icon:
        "★",
    },
  ];


  return (
    <div className="row g-3 mb-4">

      {cards.map(
        card => (

          <div
            className="col-6 col-xl-3"
            key={
              card.label
            }
          >

            <div className="card border-0 shadow-sm h-100">

              <div className="card-body">

                <div className="d-flex justify-content-between align-items-start">

                  <div>

                    <div className="small text-muted mb-1">
                      {card.label}
                    </div>

                    <div className="fs-3 fw-bold">
                      {card.value}
                    </div>

                  </div>

                  <div className="fs-4">
                    {card.icon}
                  </div>

                </div>

              </div>

            </div>

          </div>

        )
      )}

    </div>
  );
}
