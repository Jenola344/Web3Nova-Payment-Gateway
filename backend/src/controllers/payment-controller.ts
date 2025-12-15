import { Response } from 'express';
import { AuthRequest } from '../types/index.ts';
import Student from '../models/Student.ts';
import { 
  verifyMonnifyTransaction, 
  initializeMonnifyPayment, 
  getBankDetails 
} from '../services/payment-service';
import { 
  sendPaymentConfirmationEmail, 
  sendPaymentPendingEmail 
} from '../services/email-service';

// Initiate payment
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

        // Get bank details for manual transfer
        const bankDetails = getBankDetails();

        return res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        bankDetails,
        amount
        });

    } catch (error: any) {
        console.error('Initiate payment error:', error);
        return res.status(500).json({
        success: false,
        message: 'Server error while initiating payment'
        });
    }
};

// Confirm payment (student submits transaction reference)
export const confirmPayment = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        const { transactionReference } = req.body;

        if (!transactionReference) {
        return res.status(400).json({
            success: false,
            message: 'Transaction reference is required'
        });
        }

        const student = await Student.findById(studentId);

        if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found'
        });
        }

        // Check if transaction reference already exists
        const existingPayment = student.paymentHistory.find(
        p => p.transactionReference === transactionReference
        );

        if (existingPayment) {
        return res.status(400).json({
            success: false,
            message: 'This transaction has already been submitted'
        });
        }

        // Add payment as pending
        student.paymentHistory.push({
        amount: 0, // Will be updated after verification
        date: new Date(),
        status: 'pending',
        transactionReference
        });

        await student.save();

        // Send pending email
        await sendPaymentPendingEmail(student.email, student.fullName, 0);

        // In production, you would verify this with Monnify here
        // For now, we'll just mark it as pending and admin can verify manually

        return res.status(200).json({
        success: true,
        message: 'Payment confirmation received. Verification in progress.'
        });

    } catch (error: any) {
        console.error('Confirm payment error:', error);
        return res.status(500).json({
        success: false,
        message: 'Server error while confirming payment'
        });
    }
};

// Verify payment with Monnify (called by webhook or admin)
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
        p => p.transactionReference === transactionReference && p.status === 'pending'
        );

        if (paymentIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Pending payment not found'
        });
        }

        // Update payment
        student.paymentHistory[paymentIndex].status = 'verified';
        student.paymentHistory[paymentIndex].amount = amount;
        student.paymentHistory[paymentIndex].monnifyReference = responseBody.paymentReference;

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