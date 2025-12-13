const TransactionModel = require('../models/transaction-model');

const transactionService = {
  async createTransaction(data) {
    return await TransactionModel.create(data);
  },
  
  async getTransactionsByPayment(paymentId) {
    return await TransactionModel.findByPaymentId(paymentId);
  },
  
  async getUserTransactions(userId) {
    return await TransactionModel.findByUserId(userId);
  }
};

module.exports = transactionService;