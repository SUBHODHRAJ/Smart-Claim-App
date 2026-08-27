export default function StatsCards({ stats = {} }) {
  const cards = [
    {
      label: "Total Claims",
      value: stats.total ?? 0,
      icon: "📦",
      styleClass: "stat-icon-primary",
    },
    {
      label: "Pending Review",
      value: stats.pending ?? 0,
      icon: "⏳",
      styleClass: "stat-icon-warning",
    },
    {
      label: "Approved",
      value: stats.approved ?? 0,
      icon: "✓",
      styleClass: "stat-icon-success",
    },
    {
      label: "Rejected",
      value: stats.rejected ?? 0,
      icon: "✕",
      styleClass: "stat-icon-danger",
    },
    {
      label: "Senior Review",
      value: stats.seniorReview ?? 0,
      icon: "⚡",
      styleClass: "stat-icon-purple",
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((card) => (
        <div className="col-6 col-md-4 col-xl" key={card.label}>
          <div className="stat-card">
            <div className={`stat-icon-wrapper ${card.styleClass}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-muted small fw-semibold" style={{ fontSize: "0.8rem" }}>
                {card.label}
              </div>
              <div className="fs-3 fw-extrabold text-dark leading-none mt-0.5">
                {card.value}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
