import api from "./api"; // assuming you already have axios instance configured

// Fetch notifications
export const getNotifications = () => {
  return api.get("/notifications/");
};

// Mark as read
export const markNotificationRead = (id) => {
  return api.patch(`/notifications/${id}/`, { is_read: true });
};

// Mark all as read
export const markAllNotificationsRead = () => {
  return api.post("/notifications/mark-all-read/");
};
