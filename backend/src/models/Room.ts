import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string;
  floor: number;
  capacity: number;
  residents: mongoose.Types.ObjectId[];
  monthlyFee: number;
  status: 'Available' | 'Full' | 'Maintenance';
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
  {
    roomNumber: { type: String, required: true, unique: true, index: true, trim: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true, default: 4 },
    residents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    monthlyFee: { type: Number, required: true },
    status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' }
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>('Room', RoomSchema);
