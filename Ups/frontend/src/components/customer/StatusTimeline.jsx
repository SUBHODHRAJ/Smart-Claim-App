const stages = [
  {
    key: "pending",
    label: "Claim Submitted",
    description:
      "Your claim has been received.",
  },

  {
    key: "underreview",
    label: "Under Review",
    description:
      "An agent is reviewing your claim.",
  },

  {
    key: "senioragentreview",
    label: "Senior Review",
    description:
      "The claim requires additional review.",
  },

  {
    key: "approved",
    label: "Approved",
    description:
      "Your claim has been approved.",
  },
];


const normalize = (
  value
) =>
  String(
    value || ""
  )
    .toLowerCase()
    .replace(
      /[\s_-]+/g,
      ""
    );


export default function StatusTimeline({
  status = "Pending",
}) {

  const current =
    normalize(
      status
    );


  const isRejected =
    current ===
    "rejected";


  let activeIndex =
    stages.findIndex(
      stage =>
        stage.key ===
        current
    );


  if (
    activeIndex <
    0
  ) {

    activeIndex = 0;

  }


  return (
    <div className="py-2">

      {stages.map(
        (
          stage,
          index
        ) => {

          const complete =
            index <=
            activeIndex;


          const active =
            stage.key ===
            current;


          if (
            isRejected &&
            stage.key ===
            "approved"
          ) {

            return null;

          }


          return (

            <div
              className="d-flex"
              key={
                stage.key
              }
            >

              <div
                className="d-flex flex-column align-items-center"
                style={{
                  width:
                    "32px",
                }}
              >

                <div
                  className={
                    `rounded-circle d-flex align-items-center justify-content-center ${
                      complete
                        ? "bg-dark text-white"
                        : "bg-light text-muted border"
                    }`
                  }
                  style={{
                    width:
                      "28px",
                    height:
                      "28px",
                    fontSize:
                      "12px",
                  }}
                >
                  {complete
                    ? "✓"
                    : index + 1}
                </div>


                {index <
                  stages.length -
                    1 && (

                  <div
                    className={
                      complete
                        ? "bg-dark"
                        : "bg-light"
                    }
                    style={{
                      width:
                        "2px",
                      minHeight:
                        "42px",
                    }}
                  />

                )}

              </div>


              <div
                className="ms-3 pb-3"
              >

                <div
                  className={
                    `fw-semibold ${
                      active
                        ? "text-dark"
                        : complete
                        ? "text-secondary"
                        : "text-muted"
                    }`
                  }
                >
                  {stage.label}
                </div>

                <div className="small text-muted">
                  {stage.description}
                </div>

              </div>

            </div>

          );

        }
      )}


      {isRejected && (

        <div className="d-flex">

          <div
            className="d-flex flex-column align-items-center"
            style={{
              width:
                "32px",
            }}
          >

            <div
              className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center"
              style={{
                width:
                  "28px",
                height:
                  "28px",
                fontSize:
                  "12px",
              }}
            >
              ✕
            </div>

          </div>


          <div className="ms-3">

            <div className="fw-semibold text-danger">
              Claim Rejected
            </div>

            <div className="small text-muted">
              Your claim was not approved.
            </div>

          </div>

        </div>

      )}

    </div>
  );
}
