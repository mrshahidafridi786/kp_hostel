import User from '../models/User';
import Fee from '../models/Fee';
import Notification from '../models/Notification';
import { sendEmail } from './email';
import { sendWhatsApp } from './whatsapp';

export const runFeeRemindersCheck = async (force: boolean = false): Promise<number> => {
  try {
    const today = new Date();
    const dateNum = today.getDate();

    // The system automatically reminds on 25th, 26th, 27th, 28th, 29th, 30th, and 1st
    const isReminderDay = [25, 26, 27, 28, 29, 30, 1].includes(dateNum);

    if (!isReminderDay && !force) {
      console.log(`[SCHEDULER] Today is day ${dateNum}. No auto fee reminders sent today.`);
      return 0;
    }

    console.log(`[SCHEDULER] Starting fee reminders check (Force: ${force})...`);

    // Determine current month name and next month name
    // e.g. "July 2026"
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // For reminder purposes, if it's the 25th-30th, we are reminding for the upcoming month (due 1st of next month)
    // Or if it's the 1st, we are reminding for the current month.
    let targetMonth: string;
    let dueStr: string;
    
    if (dateNum >= 25) {
      // Reminding for the next month
      const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      targetMonth = `${months[nextMonthDate.getMonth()]} ${nextMonthDate.getFullYear()}`;
      dueStr = `1 ${months[nextMonthDate.getMonth()]}`;
    } else {
      // Reminding for the current month (it's the 1st)
      targetMonth = `${months[today.getMonth()]} ${today.getFullYear()}`;
      dueStr = `1 ${months[today.getMonth()]}`;
    }

    // Find all active students
    const students = await User.find({ role: 'Student', status: 'Active' });
    let remindersCount = 0;

    for (const student of students) {
      // Check if student has a pending/overdue fee for this month
      const fee = await Fee.findOne({
        student: student._id,
        month: targetMonth,
        status: { $in: ['Pending', 'Overdue'] }
      });

      if (fee) {
        const studentName = student.name;
        const msg = `Dear ${studentName},\n\nYour hostel fee for ${targetMonth} is due on ${dueStr}.\n\nPlease submit before the due date.\n\nThank you.\nKP Youth University Hostel`;

        // 1. Save Dashboard Notification
        await Notification.create({
          student: student._id,
          message: msg,
          type: 'Fee',
          channels: ['Dashboard', 'Email', 'WhatsApp'],
          read: false
        });

        // Update student fee status in profile
        student.feeStatus = 'Pending';
        await student.save();

        // 2. Dispatch Email
        if (student.email) {
          await sendEmail(
            student.email,
            `Hostel Fee Reminder - ${targetMonth}`,
            msg
          );
        }

        // 3. Dispatch WhatsApp
        if (student.phone) {
          await sendWhatsApp(student.phone, msg);
        }

        remindersCount++;
      }
    }

    console.log(`[SCHEDULER] Fee reminders dispatch completed. Sent ${remindersCount} reminders.`);
    return remindersCount;
  } catch (error) {
    console.error(`[SCHEDULER] Error during fee reminders check: ${(error as Error).message}`);
    return 0;
  }
};

// Start the daily cron check (Runs every 24 hours)
export const startCronScheduler = (): void => {
  // Check every 24 hours (86400000 ms)
  const DAILY_INTERVAL = 24 * 60 * 60 * 1000;
  
  console.log('[SCHEDULER] Initializing daily automatic fee reminders cron...');
  
  setInterval(async () => {
    await runFeeRemindersCheck(false);
  }, DAILY_INTERVAL);
};
