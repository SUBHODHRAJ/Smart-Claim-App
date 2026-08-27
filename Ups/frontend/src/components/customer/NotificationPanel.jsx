import {
  useEffect,
  useState,
} from "react";

import notificationService
  from "../../services/notificationService";


export default function NotificationPanel() {

  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(
    () => {

      let active =
        true;


      const load =
        async () => {

          try {

            const response =
              await notificationService
                .getMyNotifications();


            const data =
              response?.data ??
              response;


            const list =
              Array.isArray(
                data
              )
                ? data
                : (
                    data?.items ||
                    data?.notifications ||
                    []
                  );


            if (
              active
            ) {

              setNotifications(
                list
              );

            }

          } catch (
            error
          ) {

            console.warn(
              "Notification loading skipped:",
              error
            );

          } finally {

            if (
              active
            ) {

              setLoading(
                false
              );

            }

          }

        };


      load();


      return () => {

        active =
          false;

      };

    },
    []
  );


  if (
    loading
  ) {

    return (
      <div className="card border-0 shadow-sm">

        <div className="card-body text-muted">
          Loading notifications...
        </div>

      </div>
    );

  }


  return (
    <div className="card border-0 shadow-sm">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-center mb-3">

          <h6 className="fw-bold mb-0">
            Notifications
          </h6>

          <span className="badge text-bg-dark">
            {notifications.length}
          </span>

        </div>


        {notifications.length ===
        0 ? (

          <div className="text-muted small">
            No new notifications.
          </div>

        ) : (

          <div className="d-flex flex-column gap-2">

            {notifications.map(
              (
                item,
                index
              ) => (

                <div
                  className="border rounded p-3"
                  key={
                    item?.id ||
                    item?.Id ||
                    index
                  }
                >

                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge text-bg-secondary">
                      {item?.type || item?.Type || "Claim Notice"}
                    </span>
                    <small className="text-muted">
                      {item?.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                    </small>
                  </div>
                  <div className="small text-dark">
                    {item?.message ||
                      item?.Message ||
                      "Your claim status has been updated."}
                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}
