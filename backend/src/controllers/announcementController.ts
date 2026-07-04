import { Response } from 'express';
import Announcement from '../models/Announcement';
import { AuthRequest } from '../middleware/authMiddleware';

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, type } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const newAnnouncement = await Announcement.create({
      title,
      content,
      type: type || 'General',
      createdBy: req.user?.id
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      announcement: newAnnouncement
    });
  } catch (error) {
    console.error('[ANNOUNCEMENT-CONTROLLER] Create Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const query: any = {};
    if (type) query.type = type;

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('[ANNOUNCEMENT-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('[ANNOUNCEMENT-CONTROLLER] Delete Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
