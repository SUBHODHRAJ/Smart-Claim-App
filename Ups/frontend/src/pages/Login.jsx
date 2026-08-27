import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = String(
        user.role || user.Role || user.userRole || user.UserRole || ""
      ).toLowerCase();

      navigate(role === "agent" || role === "senioragent" ? "/agent" : "/customer", {
        replace: true,
      });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email: email.trim(),
        password,
      });

      const loggedInUser =
        response?.user ||
        response?.User ||
        response?.data?.user ||
        response?.data ||
        user;

      const role = String(
        loggedInUser?.role ||
        loggedInUser?.Role ||
        loggedInUser?.userRole ||
        loggedInUser?.UserRole ||
        ""
      ).toLowerCase();

      const destination =
        role === "agent" || role === "senioragent" ? "/agent" : "/customer";

      navigate(destination, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        {/* Brand Side Panel */}
        <div className="auth-brand">
          <div>
            <div className="auth-brand-logo">UPS</div>
            <h1>Smart Claims Portal</h1>
            <p>
              Next-generation package dispute resolution & automated claims workflow platform.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Real-time claim tracking & photo evidence</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Automated priority determination & SLA routing</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Multi-tier agent & senior escalation console</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>
            © 2026 United Parcel Service of America, Inc.
          </div>
        </div>

        {/* Form Side */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to manage package claims</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="login-email" className="form-label fw-semibold small text-secondary">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="login-password" className="form-label fw-semibold small text-secondary">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="btn-ups w-100 py-2.5 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center mt-3 pt-3 border-top">
            <span className="text-muted small">Don't have an account? </span>
            <Link to="/register" className="small fw-bold text-decoration-none text-dark">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
