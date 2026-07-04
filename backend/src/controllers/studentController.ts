import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Room from '../models/Room';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper to generate Unique Student ID e.g., KPH-2026-1001
const generateStudentId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await User.countDocuments({ role: 'Student' });
  const sequence = (1001 + count).toString();
  return `KPH-${year}-${sequence}`;
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      fatherName,
      cnic,
      phone,
      emergencyContact,
      university,
      department,
      semester,
      roomNumber,
      admissionDate,
      notes
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate Student ID and Default Password
    const studentId = await generateStudentId();
    const defaultPassword = 'student123'; // Default password for students
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    // If room is assigned, verify it exists and has vacancy
    if (roomNumber) {
      const room = await Room.findOne({ roomNumber });
      if (!room) {
        return res.status(404).json({ success: false, message: `Room ${roomNumber} not found` });
      }
      if (room.residents.length >= room.capacity) {
        return res.status(400).json({ success: false, message: `Room ${roomNumber} is full` });
      }
    }

    const newStudent = await User.create({
      name,
      email,
      password: passwordHash,
      role: 'Student',
      status: 'Active',
      fatherName,
      cnic,
      phone,
      emergencyContact,
      university,
      department,
      semester,
      roomNumber,
      admissionDate: admissionDate || new Date(),
      feeStatus: 'Paid',
      notes
    });

    // If room number was provided, assign student to room
    if (roomNumber) {
      const room = await Room.findOne({ roomNumber });
      if (room) {
        room.residents.push(newStudent._id as any);
        if (room.residents.length >= room.capacity) {
          room.status = 'Full';
        }
        await room.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      student: {
        id: newStudent._id,
        studentId,
        name: newStudent.name,
        email: newStudent.email,
        roomNumber: newStudent.roomNumber,
        defaultPassword // Returned so Admin can share it with the student
      }
    });
  } catch (error) {
    console.error('[STUDENT-CONTROLLER] Create Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { status, feeStatus, university, search, page = '1', limit = '10' } = req.query;

    const query: any = { role: 'Student' };

    // Filters
    if (status) query.status = status;
    if (feeStatus) query.feeStatus = feeStatus;
    if (university) query.university = { $regex: university as string, $options: 'i' };

    // Search query (matches name, CNIC, email, or roomNumber)
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { cnic: { $regex: search as string, $options: 'i' } },
        { roomNumber: { $regex: search as string, $options: 'i' } }
      ];
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const students = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('[STUDENT-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Students can only fetch their own profile, Admins can fetch any
    if (req.user?.role === 'Student' && req.user.id !== id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = await User.findById(id).select('-password -refreshToken');
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error('[STUDENT-CONTROLLER] GetById Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const isStudentSelf = req.user?.role === 'Student' && req.user.id === id;
    const isAdmin = req.user?.role === 'Admin';

    if (!isStudentSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = await User.findById(id);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (isStudentSelf) {
      // Students can only update phone, emergencyContact, profilePhoto, and password
      const { phone, emergencyContact, profilePhoto, newPassword } = req.body;
      if (phone) student.phone = phone;
      if (emergencyContact) student.emergencyContact = emergencyContact;
      if (profilePhoto) student.profilePhoto = profilePhoto;
      
      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(newPassword, salt);
      }
    } else {
      // Admins can update all fields
      const {
        name,
        email,
        fatherName,
        cnic,
        phone,
        emergencyContact,
        university,
        department,
        semester,
        roomNumber,
        admissionDate,
        status,
        feeStatus,
        notes
      } = req.body;

      if (name) student.name = name;
      if (email) {
        const existingEmail = await User.findOne({ email, _id: { $ne: id } });
        if (existingEmail) {
          return res.status(400).json({ success: false, message: 'Email is already used by another user' });
        }
        student.email = email;
      }
      if (fatherName) student.fatherName = fatherName;
      if (cnic) student.cnic = cnic;
      if (phone) student.phone = phone;
      if (emergencyContact) student.emergencyContact = emergencyContact;
      if (university) student.university = university;
      if (department) student.department = department;
      if (semester) student.semester = semester;
      if (admissionDate) student.admissionDate = admissionDate;
      if (status) student.status = status;
      if (feeStatus) student.feeStatus = feeStatus;
      if (notes) student.notes = notes;

      // Handle room re-assignment
      if (roomNumber && roomNumber !== student.roomNumber) {
        // Remove from old room
        if (student.roomNumber) {
          const oldRoom = await Room.findOne({ roomNumber: student.roomNumber });
          if (oldRoom) {
            oldRoom.residents = oldRoom.residents.filter(rId => rId.toString() !== student._id.toString());
            oldRoom.status = 'Available';
            await oldRoom.save();
          }
        }
        // Assign to new room
        const newRoom = await Room.findOne({ roomNumber });
        if (!newRoom) {
          return res.status(404).json({ success: false, message: `Room ${roomNumber} not found` });
        }
        if (newRoom.residents.length >= newRoom.capacity) {
          return res.status(400).json({ success: false, message: `Room ${roomNumber} is full` });
        }
        newRoom.residents.push(student._id as any);
        if (newRoom.residents.length >= newRoom.capacity) {
          newRoom.status = 'Full';
        }
        await newRoom.save();
        student.roomNumber = roomNumber;
      }
    }

    await student.save();
    
    // Omit password hash in response
    const updatedStudentObj = student.toObject();
    delete updatedStudentObj.password;
    delete updatedStudentObj.refreshToken;

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudentObj
    });
  } catch (error) {
    console.error('[STUDENT-CONTROLLER] Update Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await User.findById(id);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Remove from assigned room
    if (student.roomNumber) {
      const room = await Room.findOne({ roomNumber: student.roomNumber });
      if (room) {
        room.residents = room.residents.filter(rId => rId.toString() !== student._id.toString());
        room.status = 'Available';
        await room.save();
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('[STUDENT-CONTROLLER] Delete Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const toggleStudentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Active' or 'Suspended'

    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const student = await User.findById(id);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student.status = status;
    await student.save();

    return res.status(200).json({
      success: true,
      message: `Student status updated to ${status}`,
      status: student.status
    });
  } catch (error) {
    console.error('[STUDENT-CONTROLLER] ToggleStatus Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
