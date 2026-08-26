export default function AgentNotification({
  title = "Notification",
  message = "",
}) {

  return (
    <div className="alert alert-info d-flex gap-2 align-items-start">

      <span>
        🔔
      </span>

      <div>

        <div className="fw-semibold">
          {title}
        </div>

        {message && (

          <div className="small">
            {message}
          </div>

        )}

      </div>

    </div>
  );
}
