const PaymentModel = require('../models/payment-model');
const EnrollmentModel = require('../models/enrollment-model');
const UserModel = require('../models/user-model');

const analyticsService = {
  async getDashboardStats() {
    const paymentStats = await PaymentModel.getStatistics();
    const enrollmentStats = await EnrollmentModel.getStatistics();
    const userCounts = await UserModel.countByRole();
    
    return {
      payments: paymentStats,
      enrollments: enrollmentStats,
      users: userCounts,
      revenue: {
        total: parseFloat(paymentStats.total_revenue || 0),
        average: parseFloat(paymentStats.average_payment || 0)
      }
    };
  },
  
  async getPaymentAnalytics(startDate, endDate) {
    const options = { startDate, endDate };
    const payments = await PaymentModel.findAll(options);
    
    return {
      totalPayments: payments.pagination.total,
      payments: payments.payments
    };
  }
};

module.exports = {
  redisService,
  emailService,
  notificationService,
  userService,
  webhookService,
  transactionService,
  analyticsService
};
