import mongoose, { Schema, Document } from 'mongoose';

export interface IFacility extends Document {
  name: string;
  description: string;
  icon: string; // Lucide icon identifier e.g. "Wifi"
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const FacilitySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    icon: { type: String, required: true, default: 'Info' },
    displayOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model<IFacility>('Facility', FacilitySchema);
