import { Response } from 'express';
import Room from '../models/Room';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { roomNumber, floor, capacity, monthlyFee } = req.body;

    if (!roomNumber || !floor || !capacity || !monthlyFee) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room ${roomNumber} already exists` });
    }

    const newRoom = await Room.create({
      roomNumber,
      floor,
      capacity,
      monthlyFee,
      residents: [],
      status: 'Available'
    });

    return res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: newRoom
    });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] Create Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { floor, status, search } = req.query;
    const query: any = {};

    if (floor) query.floor = parseInt(floor as string, 10);
    if (status) query.status = status;

    if (search) {
      query.roomNumber = { $regex: search as string, $options: 'i' };
    }

    const rooms = await Room.find(query).populate('residents', 'name email status phone department');

    return res.status(200).json({ success: true, rooms });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id).populate('residents', 'name email status phone department cnic');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    return res.status(200).json({ success: true, room });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] GetById Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roomNumber, floor, capacity, monthlyFee, status } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (roomNumber) {
      const existingRoom = await Room.findOne({ roomNumber, _id: { $ne: id } });
      if (existingRoom) {
        return res.status(400).json({ success: false, message: `Room ${roomNumber} is already registered` });
      }
      room.roomNumber = roomNumber;
    }

    if (floor !== undefined) room.floor = floor;
    if (capacity !== undefined) {
      if (capacity < room.residents.length) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity below current resident count (${room.residents.length})`
        });
      }
      room.capacity = capacity;
    }
    if (monthlyFee !== undefined) room.monthlyFee = monthlyFee;
    
    if (status) {
      room.status = status;
    } else {
      // Re-evaluate auto status
      if (room.residents.length >= room.capacity) {
        room.status = 'Full';
      } else {
        room.status = 'Available';
      }
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] Update Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.residents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a room that still has assigned student residents'
      });
    }

    await Room.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] Delete Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const assignStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, studentId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (room.residents.length >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is already at full capacity' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if student already in this room
    if (room.residents.includes(student._id as any)) {
      return res.status(400).json({ success: false, message: 'Student is already assigned to this room' });
    }

    // Remove student from old room if they were in one
    if (student.roomNumber) {
      const oldRoom = await Room.findOne({ roomNumber: student.roomNumber });
      if (oldRoom) {
        oldRoom.residents = oldRoom.residents.filter(rId => rId.toString() !== student._id.toString());
        oldRoom.status = 'Available';
        await oldRoom.save();
      }
    }

    // Assign to new room
    room.residents.push(student._id as any);
    if (room.residents.length >= room.capacity) {
      room.status = 'Full';
    }
    await room.save();

    // Update student's profile
    student.roomNumber = room.roomNumber;
    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student assigned to room successfully',
      room
    });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] AssignStudent Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, studentId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    room.residents = room.residents.filter(rId => rId.toString() !== studentId);
    room.status = 'Available'; // vacant slots now exist
    await room.save();

    const student = await User.findById(studentId);
    if (student) {
      student.roomNumber = undefined;
      await student.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Student removed from room successfully',
      room
    });
  } catch (error) {
    console.error('[ROOM-CONTROLLER] RemoveStudent Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
