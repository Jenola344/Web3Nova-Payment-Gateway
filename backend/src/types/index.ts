import { Request } from 'express';

export interface IStudent {
  _id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  skill: string;
  location: string;
  scholarshipType: 'Fully Funded' | 'Half Funded' | 'Full Payment';
  totalFees: number;
  amountPaid: number;
  remainingBalance: number;
  password: string;
  paymentHistory: IPayment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPayment {
  amount: number;
  date: Date;
  status: 'pending' | 'verified' | 'failed';
  transactionReference?: string;
  monnifyReference?: string;
}

export interface IAdmin {
  _id?: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'admin';
  };
}

export interface MonnifyVerificationResponse {
  requestSuccessful: boolean;
  responseMessage: string;
  responseBody: {
    transactionReference: string;
    paymentReference: string;
    amountPaid: number;
    totalPayable: number;
    settlementAmount: number;
    paidOn: string;
    paymentStatus: string;
    paymentDescription: string;
    currency: string;
    paymentMethod: string;
    product: {
      type: string;
      reference: string;
    };
    cardDetails: any;
    accountDetails: any;
    accountPayments: any[];
    customer: {
      email: string;
      name: string;
    };
    metaData: any;
  };
}