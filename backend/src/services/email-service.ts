import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (
  email: string,
  studentName: string,
  amount: number,
  transactionReference: string
) => {
  try {
    const mailOptions = {
      from: `"Web3Nova Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Payment Confirmation - Web3Nova Academy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${studentName},</p>
              <p>Your payment has been successfully verified and confirmed!</p>
              
              <div class="details">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
                <p><strong>Transaction Reference:</strong> ${transactionReference}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Thank you for your payment. Your account has been updated accordingly.</p>
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>Web3Nova Academy Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Web3Nova Academy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment confirmation email sent to ${email}`);
  } catch (error) {
    console.log('Error sending email:', error);
    throw error;
  }
};

// Send payment pending email
export const sendPaymentPendingEmail = async (
  email: string,
  studentName: string,
  amount: number
) => {
  try {
    const mailOptions = {
      from: `"Web3Nova Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Payment Received - Verification Pending',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received</h1>
            </div>
            <div class="content">
              <p>Dear ${studentName},</p>
              <p>We have received your payment notification for ₦${amount.toLocaleString()}.</p>
              <p>Your payment is currently being verified. You will receive another email once the verification is complete.</p>
              <p>This process typically takes a few minutes to a few hours.</p>
              
              <p>Best regards,<br>Web3Nova Academy Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Web3Nova Academy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment pending email sent to ${email}`);
  } catch (error) {
    console.log('Error sending email:', error);
  }
};

// Send task assignment email
export const sendTaskAssignmentEmail = async (
  email: string,
  studentName: string,
  taskTitle: string,
  deadline: Date
) => {
  try {
    const mailOptions = {
      from: `"Web3Nova Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `New Task Assigned: ${taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Task Assigned</h1>
            </div>
            <div class="content">
              <p>Dear ${studentName},</p>
              <p>A new task has been assigned to you.</p>
              
              <div style="background-color: white; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0;">
                <h3 style="margin-top: 0;">${taskTitle}</h3>
                <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString()}</p>
              </div>
              
              <p>Please log in to your dashboard to view details and submit your work.</p>
              
              <p>Best regards,<br>Web3Nova Academy Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Web3Nova Academy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Task assignment email sent to ${email}`);
  } catch (error) {
    console.log('Error sending task email:', error);
  }
};

// Send grade notification email
export const sendGradeNotificationEmail = async (
  email: string,
  studentName: string,
  taskTitle: string,
  grade: string,
  feedback?: string
) => {
  try {
    const mailOptions = {
      from: `"Web3Nova Academy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Task Graded: ${taskTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; } /* Green header for success/grade */
            .content { background-color: #f9fafb; padding: 20px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .grade-box { background-color: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Task Graded</h1>
            </div>
            <div class="content">
              <p>Dear ${studentName},</p>
              <p>Your submission for <strong>${taskTitle}</strong> has been graded.</p>
              
              <div class="grade-box">
                <h2 style="margin-top: 0; color: #10b981;">Grade: ${grade}</h2>
                ${feedback ? `<p><strong>Feedback:</strong><br>${feedback}</p>` : ''}
              </div>
              
              <p>Keep up the great work!</p>
              
              <p>Best regards,<br>Web3Nova Academy Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Web3Nova Academy. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Grade notification email sent to ${email}`);
  } catch (error) {
    console.log('Error sending grade email:', error);
  }
};