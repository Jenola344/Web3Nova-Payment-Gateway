/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/auth-service');
const emailService = require('../services/email-service');
const { successResponse, createdResponse } = require('../utils/response-utils');
const { asyncHandler } = require('../utils/error-utils');

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, fullName, phoneNumber, role } = req.body;
    
    const result = await authService.register(
        { email, password, fullName, phoneNumber, role },
        { ipAddress: req.ip, userAgent: req.get('user-agent') }
    );
    
    // Send verification email
    await emailService.sendVerificationEmail(email, result.verificationToken);
    
    createdResponse(res, {
        user: result.user,
        message: 'Registration successful. Please check your email for verification link.'
    }, 'User registered successfully');
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.login(
    email,
    password,
    { ipAddress: req.ip, userAgent: req.get('user-agent') }
  );
  
  successResponse(res, result, 'Login successful');
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  const result = await authService.refreshAccessToken(refreshToken);
  
  successResponse(res, result, 'Token refreshed successfully');
});

/**
 * Verify email
 * GET /api/v1/auth/verify-email?token=xxx
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  
  const user = await authService.verifyEmail(token);
  
  successResponse(res, { user }, 'Email verified successfully');
});

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const result = await authService.requestPasswordReset(email);
  
  // Send reset email (if user exists)
  if (result.resetToken) {
    // Send email with reset token (in production)
    // await emailService.sendPasswordResetEmail(email, result.resetToken);
  }
  
  successResponse(res, { message: result.message });
});

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  const result = await authService.resetPassword(token, password);
  
  successResponse(res, result, 'Password reset successful');
});

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;
  
  const result = await authService.changePassword(userId, currentPassword, newPassword);
  
  successResponse(res, result, 'Password changed successfully');
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(
    req.user.id,
    { ipAddress: req.ip, userAgent: req.get('user-agent') }
  );
  
  successResponse(res, result, 'Logged out successfully');
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  successResponse(res, { user: req.user }, 'User retrieved successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
  getCurrentUser
};