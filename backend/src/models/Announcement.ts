import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  type: 'Holiday' | 'Maintenance' | 'Meeting' | 'Fee Notice' | 'Events' | 'General';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['Holiday', 'Maintenance', 'Meeting', 'Fee Notice', 'Events', 'General'],
      default: 'General'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
