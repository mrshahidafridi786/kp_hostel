import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryItem {
  url: string;
  type: 'image' | 'video';
  category: 'Rooms' | 'Dining Hall' | 'Library' | 'Events' | 'Building' | 'Sports Area';
  caption?: string;
}

export interface IHostelInfo extends Document {
  description: string;
  mission: string;
  vision: string;
  history: string;
  rules: string[];
  contact: {
    email: string;
    phone: string;
    whatsApp: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    twilioSid?: string;
    twilioAuthToken?: string;
    twilioWhatsAppNumber?: string;
  };
  location: {
    address: string;
    googleMapUrl: string;
    nearbyUniversities: string[];
  };
  warden: {
    name: string;
    bio: string;
    qualification: string;
    experience: string;
    message: string;
    image: string;
  };
  md: {
    name: string;
    bio: string;
    vision: string;
    message: string;
    image: string;
    contact?: string;
  };
  gallery: IGalleryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  category: {
    type: String,
    enum: ['Rooms', 'Dining Hall', 'Library', 'Events', 'Building', 'Sports Area'],
    required: true
  },
  caption: { type: String }
});

const HostelInfoSchema: Schema = new Schema(
  {
    description: { type: String, required: true },
    mission: { type: String, required: true },
    vision: { type: String, required: true },
    history: { type: String, required: true },
    rules: [{ type: String }],
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      whatsApp: { type: String, required: true },
      smtpHost: { type: String },
      smtpPort: { type: Number },
      smtpUser: { type: String },
      smtpPass: { type: String },
      twilioSid: { type: String },
      twilioAuthToken: { type: String },
      twilioWhatsAppNumber: { type: String }
    },
    location: {
      address: { type: String, required: true },
      googleMapUrl: { type: String, required: true },
      nearbyUniversities: [{ type: String }]
    },
    warden: {
      name: { type: String, required: true },
      bio: { type: String, required: true },
      qualification: { type: String, required: true },
      experience: { type: String, required: true },
      message: { type: String, required: true },
      image: { type: String, required: true }
    },
    md: {
      name: { type: String, required: true },
      bio: { type: String, required: true },
      vision: { type: String, required: true },
      message: { type: String, required: true },
      image: { type: String, required: true },
      contact: { type: String }
    },
    gallery: [GalleryItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IHostelInfo>('HostelInfo', HostelInfoSchema);
