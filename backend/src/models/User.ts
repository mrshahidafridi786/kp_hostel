import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Admin' | 'Student';
  status: 'Active' | 'Suspended';
  fatherName?: string;
  cnic?: string;
  phone?: string;
  emergencyContact?: string;
  university?: string;
  department?: string;
  semester?: string;
  roomNumber?: string;
  admissionDate?: Date;
  profilePhoto?: string;
  documents?: string[];
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  notes?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Student'], default: 'Student' },
    status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
    fatherName: { type: String },
    cnic: { type: String },
    phone: { type: String },
    emergencyContact: { type: String },
    university: { type: String },
    department: { type: String },
    semester: { type: String },
    roomNumber: { type: String },
    admissionDate: { type: Date },
    profilePhoto: { type: String },
    documents: [{ type: String }],
    feeStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Paid' },
    notes: { type: String },
    refreshToken: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
