import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  student: mongoose.Types.ObjectId;
  message: string;
  type: 'Fee' | 'Announcement' | 'System';
  channels: ('Dashboard' | 'Email' | 'WhatsApp')[];
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['Fee', 'Announcement', 'System'], default: 'System' },
    channels: [{ type: String, enum: ['Dashboard', 'Email', 'WhatsApp'] }],
    read: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
