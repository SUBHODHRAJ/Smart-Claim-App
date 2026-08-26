// ============================================================
// Evidence Gallery
// Converts stored relative paths (/uploads/claims/…) from
// the backend into absolute URLs using VITE_BACKEND_URL.
//
// This is the SINGLE authoritative place that constructs
// image URLs. Do NOT build image URLs anywhere else.
// ============================================================

// VITE_BACKEND_URL must NOT end with /api — it is the root
// of the backend server, e.g. http://localhost:5003
const BACKEND_ORIGIN = (() => {
  // Explicit backend root takes priority
  const explicit = import.meta.env.VITE_BACKEND_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // Fall back: strip /api from the API URL
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5003/api";
  return apiUrl.replace(/\/api\/?$/, "");
})();

// ─── Helpers ─────────────────────────────────────────────────

const normalizeList = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  return [images];
};

/**
 * Convert a backend image record (or raw string) into an
 * absolute URL the browser can fetch directly.
 *
 * Stored value examples that must work:
 *   /uploads/claims/CLM-123456/abc123.jpg   → full URL
 *   uploads/claims/CLM-123456/abc123.jpg    → full URL
 *   http://…/already/absolute               → unchanged
 *   blob:http://…                           → unchanged (local preview)
 */
const resolveImageUrl = (image) => {
  if (!image) return "";

  // Raw string path
  const raw =
    typeof image === "string"
      ? image
      : image?.imageUrl ??
        image?.ImageUrl ??
        image?.url ??
        image?.Url ??
        image?.filePath ??
        image?.FilePath ??
        "";

  let url = String(raw).trim();
  if (!url) return "";

  // Already absolute — pass through
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("blob:") || url.startsWith("data:")) return url;

  // Normalise backslashes (Windows paths that leaked through)
  let normalised = url.replace(/\\/g, "/");

  // If path starts with /api/uploads, strip /api prefix
  if (normalised.startsWith("/api/uploads/")) {
    normalised = normalised.substring(4);
  } else if (normalised.startsWith("api/uploads/")) {
    normalised = `/${normalised.substring(4)}`;
  }

  // Ensure leading slash and prepend backend origin
  const withSlash = normalised.startsWith("/") ? normalised : `/${normalised}`;
  return `${BACKEND_ORIGIN}${withSlash}`;
};

const getOriginalName = (image, idx) => {
  if (!image || typeof image === "string") return `Evidence ${idx + 1}`;
  return (
    image?.originalFileName ??
    image?.OriginalFileName ??
    image?.fileName ??
    image?.FileName ??
    `Evidence ${idx + 1}`
  );
};

// ─── Broken-image SVG placeholder ────────────────────────────

const BROKEN_IMAGE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' " +
  "width='120' height='120' viewBox='0 0 24 24' fill='none' " +
  "stroke='%23aaa' stroke-width='1.5' stroke-linecap='round' " +
  "stroke-linejoin='round'%3E" +
  "%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E" +
  "%3Ccircle cx='9' cy='9' r='2'/%3E" +
  "%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E" +
  "%3C/svg%3E";

// ─── Component ───────────────────────────────────────────────

export default function EvidenceGallery({ images = [] }) {
  const list = normalizeList(images);

  const items = list
    .map((img, idx) => ({
      url: resolveImageUrl(img),
      name: getOriginalName(img, idx),
      id: img?.id ?? img?.Id ?? idx,
    }))
    .filter((item) => Boolean(item.url));

  if (items.length === 0) {
    return (
      <div className="text-center text-muted py-4 bg-light rounded border">
        <div className="fs-2 mb-1">📷</div>
        <div className="small fw-semibold">No evidence images attached</div>
        <div className="small text-muted">
          Upload supporting photos during claim filing
        </div>
      </div>
    );
  }

  return (
    <div className="row g-3">
      {items.map((item, index) => (
        <div
          className="col-6 col-md-4 col-lg-3"
          key={`evidence-${item.id}-${index}`}
        >
          <div className="card border h-100 shadow-sm overflow-hidden">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              title={`Open ${item.name} in a new tab`}
              style={{ display: "block", textDecoration: "none" }}
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-100 bg-light"
                style={{
                  height: "140px",
                  objectFit: "cover",
                  display: "block",
                  transition: "opacity 0.2s ease",
                }}
                onError={(e) => {
                  console.warn(
                    "[EvidenceGallery] Image failed to load:",
                    item.url
                  );
                  e.target.onerror = null;
                  e.target.src = BROKEN_IMAGE_SVG;
                }}
              />
            </a>
            <div className="card-body p-2 bg-white">
              <div
                className="small text-truncate fw-semibold text-dark"
                title={item.name}
              >
                📎 {item.name}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
