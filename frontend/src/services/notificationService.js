import api from "./api";

const notificationService = {
  async getNotifications() {
    try {
      return await api.get("/notifications");
    } catch (error) {
      console.warn("Notifications API unavailable:", error);
      return { data: [] };
    }
  },

  async getMyNotifications() {
    try {
      return await api.get("/notifications");
    } catch (error) {
      console.warn("My notifications API unavailable:", error);
      return { data: [] };
    }
  },

  async getUnreadCount() {
    try {
      return await api.get("/notifications/unread-count");
    } catch (error) {
      console.warn("Unread count API unavailable:", error);
      return { data: { unreadCount: 0 } };
    }
  },

  async markAsRead(id) {
    try {
      return await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.warn("Unable to mark notification as read:", error);
      return null;
    }
  },

  async markAllAsRead() {
    try {
      return await api.put("/notifications/read-all");
    } catch (error) {
      console.warn("Unable to mark all notifications as read:", error);
      return null;
    }
  },

  async simulateStatusNotification(claimId, status) {
    console.log(`[NOTIFICATION] Claim ${claimId} status changed to ${status}`);
    return {
      claimId,
      status,
      simulated: true,
      createdAt: new Date().toISOString(),
    };
  },
};

export default notificationService;
