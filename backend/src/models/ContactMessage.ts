import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'Unread' | 'Replied' | 'Archived';
  replyText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Unread', 'Replied', 'Archived'], default: 'Unread', index: true },
    replyText: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);
