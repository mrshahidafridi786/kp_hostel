import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const query: any = {};
    
    // Students can only view their own notifications.
    // Admins can view notifications sent to any student (or filter by studentId query parameter)
    if (req.user?.role === 'Student') {
      query.student = req.user.id;
    } else if (req.query.studentId) {
      query.student = req.query.studentId;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Cap at latest 50 notifications for page speed

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('[NOTIFICATION-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Students can only mark their own notifications as read
    if (req.user?.role === 'Student' && notification.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    notification.read = true;
    await notification.save();

    return res.status(200).json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('[NOTIFICATION-CONTROLLER] MarkAsRead Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.role === 'Student' ? req.user.id : req.body.studentId;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    await Notification.updateMany(
      { student: studentId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[NOTIFICATION-CONTROLLER] MarkAllAsRead Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
