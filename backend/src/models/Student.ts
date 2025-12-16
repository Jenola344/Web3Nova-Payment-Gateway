import mongoose, { Schema, Document } from 'mongoose';
import { IStudent, IPayment } from '../types/index';

const PaymentSchema = new Schema<IPayment>({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  transactionReference: { type: String },
  monnifyReference: { type: String }
});

const StudentSchema = new Schema<IStudent>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    skill: { type: String, required: true },
    location: { type: String, required: true },
    scholarshipType: {
      type: String,
      enum: ['Fully Funded', 'Half Funded', 'Full Payment'],
      required: true
    },
    totalFees: { type: Number, default: 100000 },
    amountPaid: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 100000 },
    password: { type: String, required: true },
    paymentHistory: [PaymentSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IStudent>('Student', StudentSchema);