import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";


export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {

  const location =
    useLocation();

  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();


  if (loading) {

    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center bg-light"
      >
        <div className="text-center">

          <div
            className="spinner-border"
            role="status"
          />

          <div className="text-muted mt-3">
            Loading...
          </div>

        </div>
      </div>
    );
  }


  if (
    !isAuthenticated ||
    !user
  ) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  if (
    allowedRoles.length > 0
  ) {

    const role =
      user.role ||
      user.Role ||
      user.userRole ||
      user.UserRole;


    const roleAllowed =
      allowedRoles.some(
        (allowedRole) =>
          String(allowedRole).toLowerCase() ===
          String(role || "").toLowerCase()
      );


    if (!roleAllowed) {

      const normalizedRole =
        String(role || "")
          .toLowerCase();


      if (
        normalizedRole ===
        "customer"
      ) {

        return (
          <Navigate
            to="/customer"
            replace
          />
        );
      }


      if (
        normalizedRole ===
          "agent" ||
        normalizedRole ===
          "senioragent"
      ) {

        return (
          <Navigate
            to="/agent"
            replace
          />
        );
      }


      return (
        <Navigate
          to="/login"
          replace
        />
      );
    }
  }


  return children;
}
