import Notification from "../models/Notification.js";
import { getIo } from "../config/socket.js";

export const createNotificationService =
  async ({
    recipient,
    message,
    type,
    link = "",
  }) => {

    const notification =
      await Notification.create({
        recipient,
        message,
        type,
        link,
      });

    getIo()?.to(recipient.toString())
      .emit(
        "newNotification",
        notification
      );

    return notification;
  };

export const getNotificationsService = async (
  userId
) => {
  return await Notification.find({
    recipient: userId,
  }).sort({ createdAt: -1 });
};

export const markNotificationAsReadService =
  async (notificationId, userId) => {
    const notification =
      await Notification.findOne({
        _id: notificationId,
        recipient: userId,
      });

    if (!notification) {
      throw new Error(
        "Notification not found"
      );
    }

    notification.isRead = true;

    await notification.save();

    return notification;
  };

export const getUnreadCountService =
  async (userId) => {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  };

  
