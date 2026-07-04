import { Response } from 'express';
import Fee from '../models/Fee';
import User from '../models/User';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/authMiddleware';
import { runFeeRemindersCheck } from '../services/scheduler';

export const createFee = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, month, amount, dueDate } = req.body;

    if (!studentId || !month || !amount || !dueDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if duplicate fee
    const existingFee = await Fee.findOne({ student: studentId, month });
    if (existingFee) {
      return res.status(400).json({ success: false, message: `Fee already exists for ${month}` });
    }

    const newFee = await Fee.create({
      student: studentId,
      month,
      amount,
      status: 'Pending',
      dueDate,
      paymentHistory: []
    });

    student.feeStatus = 'Pending';
    await student.save();

    return res.status(201).json({
      success: true,
      message: 'Fee invoice created successfully',
      fee: newFee
    });
  } catch (error) {
    console.error('[FEE-CONTROLLER] Create Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFees = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, status, month } = req.query;
    const query: any = {};

    // Students can only query their own fees
    if (req.user?.role === 'Student') {
      query.student = req.user.id;
    } else if (studentId) {
      query.student = studentId;
    }

    if (status) query.status = status;
    if (month) query.month = month;

    const fees = await Fee.find(query)
      .populate('student', 'name email roomNumber studentId')
      .sort({ dueDate: -1 });

    return res.status(200).json({ success: true, fees });
  } catch (error) {
    console.error('[FEE-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFeeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const fee = await Fee.findById(id).populate('student', 'name email status roomNumber phone studentId fatherName cnic');
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    // Students can only view their own invoices
    if (req.user?.role === 'Student' && fee.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, fee });
  } catch (error) {
    console.error('[FEE-CONTROLLER] GetById Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { amountPaid, paymentMethod, transactionId, notes } = req.body;

    if (!amountPaid || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Amount and payment method are required' });
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    // Generate a unique receipt number if this is the first payment marking it paid
    const isFirstTimePaid = fee.status !== 'Paid' && amountPaid >= fee.amount;
    let receiptNumber = fee.receiptNumber;

    if (isFirstTimePaid && !receiptNumber) {
      receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    // Log in payment history
    fee.paymentHistory.push({
      date: new Date(),
      amount: amountPaid,
      paymentMethod,
      transactionId,
      notes
    });

    // Update status based on total paid amount
    const totalPaid = fee.paymentHistory.reduce((sum, item) => sum + item.amount, 0);

    if (totalPaid >= fee.amount) {
      fee.status = 'Paid';
      fee.paidDate = new Date();
      fee.receiptNumber = receiptNumber;
      fee.paymentMethod = paymentMethod;
      fee.transactionId = transactionId;
    } else {
      fee.status = 'Pending';
    }

    await fee.save();

    // Check if student has other pending/overdue fees
    const otherPending = await Fee.findOne({
      student: fee.student,
      status: { $in: ['Pending', 'Overdue'] }
    });

    const student = await User.findById(fee.student);
    if (student) {
      student.feeStatus = otherPending ? 'Pending' : 'Paid';
      await student.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      fee
    });
  } catch (error) {
    console.error('[FEE-CONTROLLER] RecordPayment Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const triggerManualReminders = async (req: AuthRequest, res: Response) => {
  try {
    const count = await runFeeRemindersCheck(true); // Force run scheduler
    return res.status(200).json({
      success: true,
      message: `Fee reminders executed successfully. Sent ${count} warnings.`
    });
  } catch (error) {
    console.error('[FEE-CONTROLLER] TriggerReminders Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Generates fee structures automatically for all residents at the start of a month
export const generateBulkMonthlyFees = async (req: AuthRequest, res: Response) => {
  try {
    const { month, dueDate } = req.body;

    if (!month || !dueDate) {
      return res.status(400).json({ success: false, message: 'Month and Due Date are required' });
    }

    // Get all active students
    const students = await User.find({ role: 'Student', status: 'Active' });
    let createdCount = 0;

    for (const student of students) {
      // Check if student already has fee for this month
      const existingFee = await Fee.findOne({ student: student._id, month });
      if (existingFee) continue;

      // Find student room fee, fallback to default fee
      let feeAmount = 10000; // default fee
      if (student.roomNumber) {
        const room = await Room.findOne({ roomNumber: student.roomNumber });
        if (room) {
          feeAmount = room.monthlyFee;
        }
      }

      await Fee.create({
        student: student._id,
        month,
        amount: feeAmount,
        status: 'Pending',
        dueDate,
        paymentHistory: []
      });

      student.feeStatus = 'Pending';
      await student.save();
      createdCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Bulk monthly invoices created successfully. Invoiced ${createdCount} students.`
    });
  } catch (error) {
    console.error('[FEE-CONTROLLER] GenerateBulk Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
