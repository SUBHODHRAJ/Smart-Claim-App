import api from "./api";

const unwrap = (response) => response?.data ?? response;

const getId = (claim) =>
  claim?.id ?? claim?.Id ?? claim?.claimId ?? claim?.ClaimId;

const claimService = {
  // Agent Claims list (GET /api/claims/agent)
  async getAllClaims(params) {
    return api.get("/claims/agent", { params });
  },

  async getClaims(params) {
    return api.get("/claims/agent", { params });
  },

  async getAgentClaims(params) {
    return api.get("/claims/agent", { params });
  },

  // Customer Claims list (GET /api/claims/my)
  async getMyClaims() {
    return api.get("/claims/my");
  },

  async getCustomerClaims() {
    return api.get("/claims/my");
  },

  // Single Claim (GET /api/claims/{id})
  async getClaim(id) {
    return api.get(`/claims/${id}`);
  },

  async getClaimById(id) {
    return api.get(`/claims/${id}`);
  },

  // Agent Statistics (GET /api/claims/agent/statistics)
  async getStatistics() {
    return api.get("/claims/agent/statistics");
  },

  // Create Claim (POST /api/claims)
  async createClaim(data) {
    return api.post("/claims", data);
  },

  async submitClaim(data) {
    return api.post("/claims", data);
  },

  // Upload Image for a Claim (POST /api/claims/{id}/images)
  async uploadImage(id, file) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/claims/${id}/images`, formData);
  },

  // Agent Approve Claim (POST /api/claims/{id}/approve)
  async approveClaim(id, comment) {
    return api.post(`/claims/${id}/approve`, {
      comment: typeof comment === "string" ? comment : comment?.comment || "",
    });
  },

  // Agent Reject Claim (POST /api/claims/{id}/reject)
  async rejectClaim(id, comment) {
    return api.post(`/claims/${id}/reject`, {
      comment: typeof comment === "string" ? comment : comment?.comment || "",
    });
  },

  getId,
  unwrap,
};

export default claimService;
