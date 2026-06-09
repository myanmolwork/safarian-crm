import {
  getNotificationsService,
  markNotificationAsReadService,
  getUnreadCountService,
} from "../services/notification.service.js";

export const getNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await getNotificationsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsRead = async (
  req,
  res
) => {
  try {
    const notification =
      await markNotificationAsReadService(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUnreadCount = async (
  req,
  res
) => {
  try {
    const count =
      await getUnreadCountService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};