// Service để gửi và nhận thông báo
const API_BASE_URL = 'http://localhost:5000/api';

export const notificationsService = {
  // Tạo thông báo mới (từ driver)
  async createNotification(notificationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi tạo thông báo');
      }

      return result;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Lấy danh sách thông báo mới nhất (cho parent)
  async getLatestNotifications(limit = 5) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/latest?limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lấy thông báo');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting latest notifications:', error);
      throw error;
    }
  },

  // Đánh dấu thông báo đã đọc
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi đánh dấu thông báo');
      }

      return result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Lấy thông báo theo driver (để admin xem)
  async getNotificationsByDriver(driverId, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/driver/${driverId}?limit=${limit}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi lấy thông báo theo driver');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting notifications by driver:', error);
      throw error;
    }
  }
};