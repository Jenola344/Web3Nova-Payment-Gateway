import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../types/index';

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'verified', 'failed'],
      default: 'pending'
    },
    transactionReference: { type: String },
    monnifyReference: { type: String }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);