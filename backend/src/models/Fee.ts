import mongoose, { Schema, Document } from 'mongoose';

export interface IFeeHistory {
  date: Date;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export interface IFee extends Document {
  student: mongoose.Types.ObjectId;
  month: string; // e.g. "July 2026"
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: Date;
  paidDate?: Date;
  receiptNumber?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentHistory: IFeeHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema: Schema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    month: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending', index: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    receiptNumber: { type: String },
    paymentMethod: { type: String },
    transactionId: { type: String },
    paymentHistory: [
      {
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, required: true },
        transactionId: { type: String },
        notes: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IFee>('Fee', FeeSchema);
