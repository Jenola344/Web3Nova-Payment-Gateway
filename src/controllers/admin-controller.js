const PaymentModel = require('../models/payment-model');
const EnrollmentModel = require('../models/enrollment-model');
const analyticsService = require('../services/analytics-service');

const adminController = {
    getDashboard: asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats();

    successResponse(res, stats, 'Dashboard data retrieved successfully');
    }),

    getAllPayments: asyncHandler(async (req, res) => {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status,
        stage: parseInt(req.query.stage),
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };

    const result = await PaymentModel.findAll(options);

    successResponse(res, result, 'Payments retrieved successfully');
    }),

    getAllUsers: asyncHandler(async (req, res) => {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        role: req.query.role,
        isActive: req.query.isActive === 'true',
        search: req.query.search
    };

    const result = await userService.getAllUsers(options);

    successResponse(res, result, 'Users retrieved successfully');
    }),

    updatePaymentStatus: asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    const { status, reason } = req.body;

    const payment = await PaymentModel.updateStatus(paymentId, status, { error_message: reason });

    successResponse(res, { payment }, 'Payment status updated successfully');
    }),

    getAllEnrollments: asyncHandler(async (req, res) => {
    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        skill: req.query.skill,
        scholarshipType: req.query.scholarshipType,
        paymentStatus: req.query.paymentStatus
    };

    const result = await EnrollmentModel.findAll(options);

    successResponse(res, result, 'Enrollments retrieved successfully');
    }),

    getAnalytics: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const analytics = await analyticsService.getPaymentAnalytics(startDate, endDate);

    successResponse(res, analytics, 'Analytics retrieved successfully');
    }),

    getAuditLogs: asyncHandler(async (req, res) => {
    const AuditLogModel = require('../models/audit-log-model');

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        action: req.query.action,
        entityType: req.query.entityType,
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
    };

    const result = await AuditLogModel.findAll(options);

    successResponse(res, result, 'Audit logs retrieved successfully');
    })
};

module.exports = adminController;