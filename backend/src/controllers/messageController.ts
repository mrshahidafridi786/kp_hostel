import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { sendEmail } from '../services/email';
import { AuthRequest } from '../middleware/authMiddleware';

export const submitMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newMessage = await ContactMessage.create({
      name,
      email,
      phone,
      message,
      status: 'Unread'
    });

    return res.status(201).json({
      success: true,
      message: 'Message submitted successfully. Our team will contact you shortly.',
      contactMessage: newMessage
    });
  } catch (error) {
    console.error('[MESSAGE-CONTROLLER] Submit Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (status) query.status = status;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const total = await ContactMessage.countDocuments(query);

    return res.status(200).json({
      success: true,
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[MESSAGE-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const replyToMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const messageRecord = await ContactMessage.findById(id);
    if (!messageRecord) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    // Send email reply to user
    const emailSubject = `Reply to your Inquiry - KP Youth University Hostel`;
    const emailBody = `Dear ${messageRecord.name},\n\nThank you for contacting us. Regarding your inquiry:\n"${messageRecord.message}"\n\nHere is our response:\n${replyText}\n\nBest regards,\nHostel Management Team\nKP Youth University Hostel`;

    const emailSent = await sendEmail(messageRecord.email, emailSubject, emailBody);

    if (emailSent) {
      messageRecord.status = 'Replied';
      messageRecord.replyText = replyText;
      await messageRecord.save();

      return res.status(200).json({
        success: true,
        message: 'Reply sent successfully via email',
        contactMessage: messageRecord
      });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to send email reply' });
    }
  } catch (error) {
    console.error('[MESSAGE-CONTROLLER] Reply Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const archiveMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const messageRecord = await ContactMessage.findById(id);
    if (!messageRecord) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    messageRecord.status = 'Archived';
    await messageRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Message archived successfully',
      contactMessage: messageRecord
    });
  } catch (error) {
    console.error('[MESSAGE-CONTROLLER] Archive Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const messageRecord = await ContactMessage.findById(id);
    if (!messageRecord) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await ContactMessage.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('[MESSAGE-CONTROLLER] Delete Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
