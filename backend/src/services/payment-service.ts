import axios from 'axios';
import { MonnifyVerificationResponse } from '../types/index.ts';

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

// Get Monnify authentication token
const getMonnifyToken = async (): Promise<string> => {
  try {
    const auth = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64');
    
    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/auth/login`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.responseBody.accessToken;
  } catch (error: any) {
    console.error('Error getting Monnify token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Monnify');
  }
};

// Verify transaction with Monnify
export const verifyMonnifyTransaction = async (
  transactionReference: string
): Promise<MonnifyVerificationResponse> => {
  try {
    const token = await getMonnifyToken();

    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v2/transactions/${encodeURIComponent(transactionReference)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error verifying Monnify transaction:', error.response?.data || error.message);
    throw new Error('Failed to verify transaction with Monnify');
  }
};

// Initialize payment (generate account details)
export const initializeMonnifyPayment = async (
  amount: number,
  customerEmail: string,
  customerName: string
): Promise<any> => {
  try {
    const token = await getMonnifyToken();

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      {
        amount,
        customerName,
        customerEmail,
        paymentReference: `WEB3NOVA_${Date.now()}`,
        paymentDescription: 'Web3Nova Academy Course Fee',
        currencyCode: 'NGN',
        contractCode: MONNIFY_CONTRACT_CODE,
        redirectUrl: 'http://localhost::3000/dashboard',
        paymentMethods: ['ACCOUNT_TRANSFER']
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.responseBody;
  } catch (error: any) {
    console.error('Error initializing Monnify payment:', error.response?.data || error.message);
    throw new Error('Failed to initialize payment with Monnify');
  }
};

// Get bank account details for transfer
export const getBankDetails = () => {
  return {
    bankName: process.env.BANK_NAME || 'Your Bank Name',
    accountNumber: process.env.ACCOUNT_NUMBER || '1234567890',
    accountName: process.env.ACCOUNT_NAME || 'Web3Nova Academy'
  };
};