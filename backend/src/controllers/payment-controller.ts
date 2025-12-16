import { Response } from 'express';
import { AuthRequest } from '../types/index.ts';
import Student from '../models/Student.ts';
import { 
  verifyMonnifyTransaction, 
  initializeMonnifyPayment
} from '../services/payment-service';
import { 
  sendPaymentConfirmationEmail
} from '../services/email-service';

// Initiate payment with Monnify
export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (amount > student.remainingBalance) {
      return res.status(400).json({
        success: false,
        message: 'Amount exceeds remaining balance'
      });
    }

    // Initialize Monnify payment
    const paymentData = await initializeMonnifyPayment(
      amount,
      student.email,
      student.fullName
    );

    // Add payment as pending with Monnify reference
    student.paymentHistory.push({
      amount: amount,
      date: new Date(),
      status: 'pending',
      transactionReference: paymentData.paymentReference,
      monnifyReference: paymentData.paymentReference
    });

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      paymentData: {
        checkoutUrl: paymentData.checkoutUrl,
        paymentReference: paymentData.paymentReference,
        accountDetails: paymentData.accountDetails,
        amount: amount
      }
    });

  } catch (error: any) {
    console.error('Initiate payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while initiating payment'
    });
  }
};

// Webhook to receive Monnify payment notifications
export const monnifyWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentReference, paymentStatus, amountPaid } = req.body;

    // Find student with this payment reference
    const student = await Student.findOne({
      'paymentHistory.transactionReference': paymentReference
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Find the payment in history
    const paymentIndex = student.paymentHistory.findIndex(
      p => p.transactionReference === paymentReference
    );

    if (paymentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (paymentStatus === 'PAID') {
      // Update payment status
      student.paymentHistory[paymentIndex].status = 'verified';
      student.paymentHistory[paymentIndex].amount = amountPaid;

      // Update student balance
      student.amountPaid += amountPaid;
      student.remainingBalance = Math.max(0, student.remainingBalance - amountPaid);

      await student.save();

      // Send confirmation email
      await sendPaymentConfirmationEmail(
        student.email,
        student.fullName,
        amountPaid,
        paymentReference
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      // Update payment as failed
      student.paymentHistory[paymentIndex].status = 'failed';
      await student.save();

      return res.status(200).json({
        success: true,
        message: 'Payment status updated'
      });
    }

  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing webhook'
    });
  }
};

// Manual verification by admin
export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { transactionReference, studentId } = req.body;

    if (!transactionReference || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference and student ID are required'
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Verify with Monnify
    const verificationResult = await verifyMonnifyTransaction(transactionReference);

    if (!verificationResult.requestSuccessful) {
      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed'
      });
    }

    const { responseBody } = verificationResult;

    if (responseBody.paymentStatus !== 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    const amount = responseBody.amountPaid;

    // Find the pending payment
    const paymentIndex = student.paymentHistory.findIndex(
      p => p.transactionReference === transactionReference
    );

    if (paymentIndex === -1) {
      // Create new payment record if not found
      student.paymentHistory.push({
        amount,
        date: new Date(),
        status: 'verified',
        transactionReference,
        monnifyReference: responseBody.paymentReference
      });
    } else {
      // Update existing payment
      student.paymentHistory[paymentIndex].status = 'verified';
      student.paymentHistory[paymentIndex].amount = amount;
      student.paymentHistory[paymentIndex].monnifyReference = responseBody.paymentReference;
    }

    // Update student balance
    student.amountPaid += amount;
    student.remainingBalance = Math.max(0, student.remainingBalance - amount);

    await student.save();

    // Send confirmation email
    await sendPaymentConfirmationEmail(
      student.email,
      student.fullName,
      amount,
      transactionReference
    );

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      student: {
        amountPaid: student.amountPaid,
        remainingBalance: student.remainingBalance
      }
    });

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while verifying payment'
    });
  }
};

// Check payment status (for polling)
export const checkPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { paymentReference } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const payment = student.paymentHistory.find(
      p => p.transactionReference === paymentReference || p.monnifyReference === paymentReference
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // If still pending, try to verify with Monnify
    if (payment.status === 'pending') {
      try {
        const verificationResult = await verifyMonnifyTransaction(paymentReference);
        
        if (verificationResult.requestSuccessful && 
            verificationResult.responseBody.paymentStatus === 'PAID') {
          
          const amount = verificationResult.responseBody.amountPaid;
          
          // Update payment
          const paymentIndex = student.paymentHistory.findIndex(
            p => p.transactionReference === paymentReference
          );
          
          student.paymentHistory[paymentIndex].status = 'verified';
          student.paymentHistory[paymentIndex].amount = amount;
          
          student.amountPaid += amount;
          student.remainingBalance = Math.max(0, student.remainingBalance - amount);
          
          await student.save();
          
          await sendPaymentConfirmationEmail(
            student.email,
            student.fullName,
            amount,
            paymentReference
          );
        }
      } catch (verifyError) {
        console.error('Verification error:', verifyError);
      }
    }

    return res.status(200).json({
      success: true,
      payment: {
        amount: payment.amount,
        status: payment.status,
        date: payment.date,
        reference: payment.transactionReference
      },
      student: {
        amountPaid: student.amountPaid,
        remainingBalance: student.remainingBalance
      }
    });

  } catch (error: any) {
    console.error('Check payment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking payment status'
    });
  }
};

// Get payment tracker (public)
export const getPaymentTracker = async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find().select('fullName email skill scholarshipType totalFees amountPaid remainingBalance');

    const paymentStatus = students.map(student => {
      let status = 'Not Paid';
      if (student.remainingBalance === 0) {
        status = 'Fully Paid';
      } else if (student.amountPaid > 0) {
        status = 'Partially Paid';
      }

      return {
        studentName: student.fullName,
        email: student.email,
        skill: student.skill,
        scholarshipType: student.scholarshipType,
        totalFees: student.totalFees,
        amountPaid: student.amountPaid,
        remainingBalance: student.remainingBalance,
        status
      };
    });

    return res.status(200).json({
      success: true,
      students: paymentStatus
    });

  } catch (error: any) {
    console.error('Get payment tracker error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching payment tracker'
    });
  }
};

// Update student payment (Admin only)
export const updateStudentPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, amount } = req.body;

    if (!studentId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and valid amount are required'
      });
    }

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Add payment to history
    student.paymentHistory.push({
      amount,
      date: new Date(),
      status: 'verified',
      transactionReference: `ADMIN_${Date.now()}`
    });

    // Update balances
    student.amountPaid += amount;
    student.remainingBalance = Math.max(0, student.remainingBalance - amount);

    await student.save();

    // Send confirmation email
    await sendPaymentConfirmationEmail(
      student.email,
      student.fullName,
      amount,
      `ADMIN_${Date.now()}`
    );

    return res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      student: {
        fullName: student.fullName,
        amountPaid: student.amountPaid,
        remainingBalance: student.remainingBalance
      }
    });

  } catch (error: any) {
    console.error('Update payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating payment'
    });
  }
};