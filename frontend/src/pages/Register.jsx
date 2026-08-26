import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Customer",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        fullName: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setSuccess("Registration successful. Redirecting to login...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to create your account."
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
            <h1>Create Account</h1>
            <p>
              Join the UPS Smart Claims network to file package claims, upload evidence, and track status.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Fast online claim filing with evidence attachments</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Transparent status timeline & agent feedback</span>
              </div>
              <div className="auth-feature">
                <div className="auth-feature-icon">✓</div>
                <span>Enterprise grade security & audit trail</span>
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
            <h2>Get started</h2>
            <p>Enter your information to register an account</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success py-2 px-3 small rounded-3 mb-3">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-2.5">
              <label className="form-label fw-semibold small text-secondary">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.name}
                onChange={updateField}
                disabled={loading}
                required
              />
            </div>

            <div className="mb-2.5">
              <label className="form-label fw-semibold small text-secondary">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={form.email}
                onChange={updateField}
                disabled={loading}
                required
              />
            </div>

            <div className="mb-2.5">
              <label className="form-label fw-semibold small text-secondary">
                Account Type
              </label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={updateField}
                disabled={loading}
              >
                <option value="Customer">Customer Account</option>
                <option value="Agent">Agent Account</option>
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label fw-semibold small text-secondary">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Min 6 chars"
                  value={form.password}
                  onChange={updateField}
                  disabled={loading}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold small text-secondary">
                  Confirm Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-ups w-100 py-2.5 mb-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Registering...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center mt-2 pt-3 border-top">
            <span className="text-muted small">Already registered? </span>
            <Link to="/login" className="small fw-bold text-decoration-none text-dark">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
