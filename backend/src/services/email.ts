import nodemailer from 'nodemailer';
import HostelInfo from '../models/HostelInfo';

export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<boolean> => {
  try {
    // 1. Fetch SMTP settings from DB (if configured by Admin)
    const hostelInfo = await HostelInfo.findOne();
    let transporter: nodemailer.Transporter;

    if (
      hostelInfo?.contact?.smtpHost &&
      hostelInfo?.contact?.smtpPort &&
      hostelInfo?.contact?.smtpUser &&
      hostelInfo?.contact?.smtpPass
    ) {
      transporter = nodemailer.createTransport({
        host: hostelInfo.contact.smtpHost,
        port: hostelInfo.contact.smtpPort,
        secure: hostelInfo.contact.smtpPort === 465,
        auth: {
          user: hostelInfo.contact.smtpUser,
          pass: hostelInfo.contact.smtpPass
        }
      });
    } else {
      // 2. Mock Transport for development (Ethereal test mail or console logger)
      console.log(`[EMAIL-MOCK] sending email to: ${to}`);
      console.log(`[EMAIL-MOCK] Subject: ${subject}`);
      console.log(`[EMAIL-MOCK] Content: ${text}`);
      return true;
    }

    const mailOptions = {
      from: `"${hostelInfo?.warden?.name || 'KP Youth Hostel'}" <${hostelInfo?.contact?.email || 'no-reply@kpyouth.com'}>`,
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>')
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL-SERVICE] Email sent successfully to: ${to}`);
    return true;
  } catch (error) {
    console.error(`[EMAIL-SERVICE] Error sending email: ${(error as Error).message}`);
    return false;
  }
};
