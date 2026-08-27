import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import claimService from "../services/claimService";

export default function CreateClaim() {
  const navigate = useNavigate();
  const fileInput = useRef(null);

  const [form, setForm] = useState({
    packageId: "",
    description: "",
    damageType: "",
    claimAmount: "",
  });

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter((file) => file.type.startsWith("image/"));

    if (valid.length > 0) {
      setFiles((previous) => [...previous, ...valid]);
      setPreviews((previous) => [
        ...previous,
        ...valid.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };

  const removeFile = (index) => {
    setFiles((previous) => previous.filter((_, i) => i !== index));
    setPreviews((previous) => previous.filter((_, i) => i !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.packageId.trim()) {
      setError("Package ID is required.");
      return;
    }

    if (!form.damageType) {
      setError("Please select a damage type.");
      return;
    }

    if (form.description.trim().length < 10) {
      setError("Please provide at least 10 characters describing the issue.");
      return;
    }

    const amount = Number(form.claimAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid claim amount.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        packageId: form.packageId.trim(),
        description: form.description.trim(),
        damageType: form.damageType,
        claimAmount: amount,
      };

      const response = await claimService.createClaim(payload);
      const createdClaim = response?.data ?? response;
      const claimId = createdClaim?.id ?? createdClaim?.Id;

      if (claimId && files.length > 0) {
        for (const file of files) {
          try {
            await claimService.uploadImage(claimId, file);
          } catch (imgErr) {
            console.warn("Failed to upload evidence image:", imgErr);
          }
        }
      }

      setSuccess("Claim submitted successfully.");

      setTimeout(() => {
        navigate("/customer");
      }, 1000);
    } catch (requestError) {
      console.error("Claim creation failed:", requestError);
      setError(
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.message ||
        "Unable to submit the claim."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-4">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/customer")}
          >
            ← Back to Dashboard
          </button>

          <div>
            <h3 className="fw-extrabold text-dark mb-0">File a Package Claim</h3>
            <div className="text-muted small">
              Submit details and photos for damaged, lost, or tampered shipments.
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-12 col-xl-9">
            <form className="card border-0 shadow-sm" onSubmit={submit}>
              <div className="card-body p-4 p-md-5">
                {error && <div className="alert alert-danger small mb-4">{error}</div>}
                {success && <div className="alert alert-success small mb-4">{success}</div>}

                <h5 className="fw-bold mb-3 text-dark">Package Information</h5>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Package Tracking / ID <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control font-monospace"
                      placeholder="e.g. 1Z999AA10123456784"
                      value={form.packageId}
                      onChange={(e) => update("packageId", e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small text-secondary">
                      Claim Amount (USD) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        className="form-control"
                        placeholder="0.00"
                        value={form.claimAmount}
                        onChange={(e) => update("claimAmount", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small text-secondary">
                      Damage Category <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={form.damageType}
                      onChange={(e) => update("damageType", e.target.value)}
                      required
                    >
                      <option value="">Select damage category</option>
                      <option value="Damaged">Damaged Package</option>
                      <option value="Lost">Lost Package</option>
                      <option value="Missing">Missing Contents</option>
                      <option value="Tampered">Tampered Package</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small text-secondary">
                      Issue Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Provide specific details about package damage, missing items, or delivery condition..."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      required
                    />
                    <div className="form-text small">
                      Please include visible package marks, exterior box state, or contents condition.
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <h5 className="fw-bold mb-1 text-dark">Supporting Photographic Evidence</h5>
                <p className="text-muted small mb-3">
                  Attach high-resolution photos of package label, box damage, and damaged items.
                </p>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  className="d-none"
                  onChange={handleFiles}
                />

                <div
                  className="border rounded-3 text-center p-4"
                  style={{
                    backgroundColor: "var(--slate-50)",
                    borderStyle: "dashed",
                    borderColor: "var(--slate-300)",
                    cursor: "pointer",
                  }}
                  onClick={() => fileInput.current?.click()}
                >
                  <div className="fs-2 mb-1">📷</div>
                  <div className="fw-bold text-dark">Click to browse or drop evidence photos</div>
                  <div className="small text-muted">Supports JPG, PNG, WEBP files</div>
                </div>

                {previews.length > 0 && (
                  <div className="row g-3 mt-3">
                    {previews.map((preview, index) => (
                      <div className="col-6 col-md-3" key={preview}>
                        <div className="position-relative border rounded-2 overflow-hidden bg-white shadow-sm">
                          <img
                            src={preview}
                            alt={`Evidence ${index + 1}`}
                            className="w-100"
                            style={{
                              aspectRatio: "1 / 1",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-dark position-absolute top-0 end-0 m-1 rounded-circle p-1"
                            style={{ width: "24px", height: "24px", lineHeight: "12px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 mt-4 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate("/customer")}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-ups px-4"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Submitting Claim...
                      </>
                    ) : (
                      "Submit Claim"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
