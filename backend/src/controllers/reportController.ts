import { Response } from 'express';
import User from '../models/User';
import Room from '../models/Room';
import Fee from '../models/Fee';
import Announcement from '../models/Announcement';
import ContactMessage from '../models/ContactMessage';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Student stats
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const activeStudents = await User.countDocuments({ role: 'Student', status: 'Active' });
    const suspendedStudents = await User.countDocuments({ role: 'Student', status: 'Suspended' });

    // 2. Room stats
    const rooms = await Room.find();
    const totalRooms = rooms.length;
    let occupiedRoomsCount = 0;
    let availableRoomsCount = 0;
    let totalSeats = 0;
    let occupiedSeats = 0;

    rooms.forEach(room => {
      totalSeats += room.capacity;
      occupiedSeats += room.residents.length;
      if (room.residents.length > 0) {
        occupiedRoomsCount++;
      } else {
        availableRoomsCount++;
      }
    });

    const vacantSeats = totalSeats - occupiedSeats;

    // 3. Fee stats
    const allPaidFees = await Fee.find({ status: 'Paid' });
    const allPendingFees = await Fee.find({ status: 'Pending' });

    const collectedFees = allPaidFees.reduce((sum, item) => sum + item.amount, 0);
    const pendingFees = allPendingFees.reduce((sum, item) => sum + item.amount, 0);

    // 4. Contact inquiry counts
    const unreadMessages = await ContactMessage.countDocuments({ status: 'Unread' });

    // 5. Recent Activity Logs (Admission dates and fee payments)
    const recentStudents = await User.find({ role: 'Student' })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name roomNumber createdAt');
    
    const recentPayments = await Fee.find({ status: 'Paid' })
      .populate('student', 'name')
      .sort({ updatedAt: -1 })
      .limit(3);

    const recentActivities = [
      ...recentStudents.map(s => ({
        type: 'admission',
        title: 'New Student Admitted',
        description: `${s.name} was assigned to Room ${s.roomNumber || 'N/A'}`,
        time: s.createdAt
      })),
      ...recentPayments.map(p => ({
        type: 'payment',
        title: 'Fee Payment Received',
        description: `PKR ${p.amount} collected from ${(p.student as any)?.name || 'Student'} for ${p.month}`,
        time: p.updatedAt
      }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

    // 6. Chart: Revenue Monthly (last 6 months)
    const monthsList = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const monthlyRevenue = [];

    // Calculate last 6 months revenue dynamically
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthsList[d.getMonth()];
      const yVal = d.getFullYear();
      const monthStr = `${mName} ${yVal}`;

      const monthlyFees = await Fee.find({ month: monthStr, status: 'Paid' });
      const sum = monthlyFees.reduce((total, f) => total + f.amount, 0);

      monthlyRevenue.push({
        month: mName.substring(0, 3),
        revenue: sum
      });
    }

    // 7. Chart: Room Occupancy Statuses
    const roomOccupancyStats = [
      { name: 'Occupied Rooms', value: occupiedRoomsCount },
      { name: 'Vacant Rooms', value: availableRoomsCount }
    ];

    // 8. Chart: Student Growth Count (aggregate admissions per month last 6 months)
    const studentGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthsList[d.getMonth()];
      
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const admissions = await User.countDocuments({
        role: 'Student',
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      studentGrowth.push({
        month: mName.substring(0, 3),
        students: admissions
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        students: {
          total: totalStudents,
          active: activeStudents,
          suspended: suspendedStudents
        },
        rooms: {
          total: totalRooms,
          occupied: occupiedRoomsCount,
          available: availableRoomsCount,
          totalSeats,
          occupiedSeats,
          vacantSeats
        },
        fees: {
          collected: collectedFees,
          pending: pendingFees
        },
        unreadMessages,
        recentActivities,
        charts: {
          monthlyRevenue,
          roomOccupancyStats,
          studentGrowth
        }
      }
    });
  } catch (error) {
    console.error('[REPORT-CONTROLLER] GetStats Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getReportsData = async (req: AuthRequest, res: Response) => {
  try {
    const { reportType } = req.query; // 'students' | 'rooms' | 'financials'
    
    if (reportType === 'students') {
      const students = await User.find({ role: 'Student' })
        .select('studentId name fatherName cnic phone university roomNumber status feeStatus admissionDate')
        .sort({ name: 1 });
      return res.status(200).json({ success: true, data: students });
    }

    if (reportType === 'rooms') {
      const rooms = await Room.find()
        .populate('residents', 'name studentId')
        .sort({ roomNumber: 1 });
      return res.status(200).json({ success: true, data: rooms });
    }

    if (reportType === 'financials') {
      const fees = await Fee.find()
        .populate('student', 'name studentId roomNumber')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, data: fees });
    }

    return res.status(400).json({ success: false, message: 'Invalid report type requested' });
  } catch (error) {
    console.error('[REPORT-CONTROLLER] GetReports Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
