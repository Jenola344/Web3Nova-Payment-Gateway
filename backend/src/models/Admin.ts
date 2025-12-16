import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '../types/index';

const AdminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema);