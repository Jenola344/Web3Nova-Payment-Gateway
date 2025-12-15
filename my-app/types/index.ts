export interface Student {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  skill: string;
  location: string;
  scholarshipType: 'Fully Funded' | 'Half Funded' | 'Full Payment';
  totalFees: number;
  amountPaid: number;
  remainingBalance: number;
  paymentHistory: Payment[];
}

export interface Payment {
  _id: string;
  amount: number;
  date: string;
  status: 'pending' | 'verified' | 'failed';
  transactionReference?: string;
}

export interface Admin {
  _id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Student | Admin;
  message?: string;
}

export interface PaymentStatus {
  studentName: string;
  email: string;
  skill: string;
  scholarshipType: string;
  totalFees: number;
  amountPaid: number;
  remainingBalance: number;
  status: string;
}