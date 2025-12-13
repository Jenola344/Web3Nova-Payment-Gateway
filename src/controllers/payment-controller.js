const paymentService = require('../services/payment-service');
const { successResponse, createdResponse } = require('../utils/response-utils');
const { asyncHandler } = require('../utils/error-utils');

const paymentController = {
  initializePayment: asyncHandler(async (req, res) => {
    const { enrollmentId, stage, amount, customerName, customerEmail, customerPhone } = req.body;
    const userId = req.user.id;
    
    const result = await paymentService.initializePayment({
      userId,
      enrollmentId,
      stage,
      amount,
      customerName,
      customerEmail,
      customerPhone
    });
    
    createdResponse(res, result, 'Payment initialized successfully');
  }),
  
  verifyPayment: asyncHandler(async (req, res) => {
    const { paymentReference } = req.params;
    
    const result = await paymentService.verifyPayment(paymentReference);
    
    successResponse(res, result, 'Payment verified successfully');
  }),
  
  getPaymentDetails: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    
    const payment = await paymentService.getPaymentDetails(paymentId);
    
    successResponse(res, { payment }, 'Payment retrieved successfully');
  }),
  
  getUserPayments: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const payments = await paymentService.getUserPayments(userId);
    
    successResponse(res, { payments }, 'Payments retrieved successfully');
  })
};

module.exports = paymentController;