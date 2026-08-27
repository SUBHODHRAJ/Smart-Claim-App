import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const role =
    user?.role ||
    user?.Role ||
    user?.userRole ||
    user?.UserRole ||
    "Customer";

  const isAgent = ["agent", "senioragent"].includes(
    String(role).toLowerCase()
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="ups-navbar navbar navbar-expand-lg">
      <div className="container-fluid px-4 py-1">
        <button
          type="button"
          className="btn btn-link text-decoration-none p-0 border-0 align-items-center d-flex"
          onClick={() => navigate(isAgent ? "/agent" : "/customer")}
        >
          <div className="ups-brand">
            <span className="ups-brand-shield">UPS</span>
            <span>Smart Claims</span>
          </div>
        </button>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <div className="d-none d-md-flex flex-column text-end">
            <span className="text-white small fw-bold">
              {user?.name || user?.fullName || user?.email || "User Account"}
            </span>
            <span className="text-white-50 small" style={{ fontSize: "0.75rem" }}>
              {role}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-outline-light btn-sm px-3 rounded-2"
            onClick={handleLogout}
            style={{ fontSize: "0.85rem", fontWeight: 600 }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
