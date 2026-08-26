import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function AgentNavbar() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;

  const role =
    user?.role ||
    user?.Role ||
    "Agent";

  const isSenior = String(role).toLowerCase() === "senioragent";

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  };

  return (
    <nav className="ups-navbar navbar navbar-expand-lg">
      <div className="container-fluid px-4 py-1">
        <button
          type="button"
          className="btn btn-link text-decoration-none p-0 border-0 align-items-center d-flex"
          onClick={() => navigate("/agent")}
        >
          <div className="ups-brand">
            <span className="ups-brand-shield">UPS</span>
            <span>Console</span>
          </div>
        </button>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <span
            className={`badge px-2.5 py-1 ${
              isSenior
                ? "bg-warning text-dark fw-bold"
                : "bg-secondary text-white"
            }`}
            style={{ fontSize: "0.75rem" }}
          >
            {isSenior ? "Senior Agent Console" : "Agent Portal"}
          </span>

          <div className="d-none d-md-flex flex-column text-end">
            <span className="text-white small fw-bold">
              {user?.name || user?.fullName || user?.email || "Agent"}
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
