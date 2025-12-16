import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { MonnifyVerificationResponse } from '../types/index.ts';

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;
const FRONTEND_URL = process.env.FRONTEND_URL;

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
    console.log('Verifying transaction with reference:', transactionReference);

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

// Initialize payment (generate payment link and account details)
export const initializeMonnifyPayment = async (
  amount: number,
  customerEmail: string,
  customerName: string
): Promise<any> => {
  try {
    const token = await getMonnifyToken();
    const paymentReference = `WEB3NOVA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const response = await axios.post(
      `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      {
        amount,
        customerName,
        customerEmail,
        paymentReference,
        paymentDescription: 'Web3Nova Academy Course Fee Payment',
        currencyCode: 'NGN',
        contractCode: MONNIFY_CONTRACT_CODE,
        redirectUrl: `${FRONTEND_URL}/dashboard?payment=success`,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
        incomeSplitConfig: []
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseBody = response.data.responseBody;

    return {
      checkoutUrl: responseBody.checkoutUrl,
      paymentReference: responseBody.paymentReference,
      transactionReference: responseBody.transactionReference,
      accountDetails: responseBody.accountDetails || [],
      enabledPaymentMethod: responseBody.enabledPaymentMethod
    };
  } catch (error: any) {
    console.error('Error initializing Monnify payment:', error.response?.data || error.message);
    throw new Error('Failed to initialize payment with Monnify');
  }
};