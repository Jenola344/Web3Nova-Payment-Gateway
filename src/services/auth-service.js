/**
 * Authentication Service
 * Handles user authentication and authorization
 */

const UserModel = require('../models/user-model');
const {
  hashPassword,
  comparePassword,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  generateEmailVerificationToken,
  hashToken,
  sanitizeUserForResponse
} = require('../utils/auth-utils');
const { addDays, addHours } = require('../utils/date-utils');
const { AuthenticationError, ConflictError } = require('../utils/error-utils');
const logger = require('../config/logger-config');
const AuditLogModel = require('../models/audit-log-model');

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @param {Object} requestInfo - Request information (IP, user agent)
 * @returns {Promise<Object>}
 */
const register = async (userData, requestInfo = {}) => {
  const { email, password, fullName, phoneNumber, role = 'student' } = userData;
  
  // Check if user exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }
  
  // Hash password
  const passwordHash = await hashPassword(password);
  
  // Create user
  const user = await UserModel.create({
    email,
    passwordHash,
    fullName,
    phoneNumber,
    role
  });
  
  // Generate email verification token
  const verificationToken = generateEmailVerificationToken();
  const hashedToken = hashToken(verificationToken);
  const expiresAt = addDays(new Date(), 1);
  
  await UserModel.setEmailVerificationToken(user.id, hashedToken, expiresAt);
  
  // Log registration
  await AuditLogModel.create({
    userId: user.id,
    action: 'register',
    entityType: 'user',
    entityId: user.id,
    ipAddress: requestInfo.ipAddress,
    userAgent: requestInfo.userAgent,
    metadata: { email, role }
  });
  
  logger.logAuth('user_registered', { userId: user.id, email });
  
  return {
    user: sanitizeUserForResponse(user),
    verificationToken // Send in email
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} requestInfo - Request information
 * @returns {Promise<Object>}
 */
const login = async (email, password, requestInfo = {}) => {
  // Find user
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }
  
  // Check if account is active
  if (!user.is_active) {
    throw new AuthenticationError('Account is suspended');
  }
  
  // Verify password
  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    logger.logAuth('login_failed', { email, reason: 'invalid_password' });
    throw new AuthenticationError('Invalid email or password');
  }
  
  // Generate tokens
  const tokens = generateTokenPair(user);
  
  // Update last login
  await UserModel.updateLastLogin(user.id);
  
  // Log login
  await AuditLogModel.create({
    userId: user.id,
    action: 'login',
    entityType: 'auth',
    ipAddress: requestInfo.ipAddress,
    userAgent: requestInfo.userAgent
  });
  
  logger.logAuth('login_successful', { userId: user.id, email });
  
  return {
    user: sanitizeUserForResponse(user),
    tokens
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>}
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      throw new AuthenticationError('Invalid refresh token');
    }
    
    const tokens = generateTokenPair(user);
    
    return {
      user: sanitizeUserForResponse(user),
      tokens
    };
  } catch (error) {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
};

/**
 * Verify email
 * @param {string} token - Verification token
 * @returns {Promise<Object>}
 */
const verifyEmail = async (token) => {
  const hashedToken = hashToken(token);
  const user = await UserModel.verifyEmail(hashedToken);
  
  logger.logAuth('email_verified', { userId: user.id });
  
  return sanitizeUserForResponse(user);
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
const requestPasswordReset = async (email) => {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists
    return { message: 'If email exists, reset link sent' };
  }
  
  const resetToken = generatePasswordResetToken();
  const hashedToken = hashToken(resetToken);
  const expiresAt = addHours(new Date(), 1);
  
  await UserModel.setPasswordResetToken(email, hashedToken, expiresAt);
  
  logger.logAuth('password_reset_requested', { userId: user.id });
  
  return {
    resetToken, // Send in email
    message: 'Password reset link sent'
  };
};

/**
 * Reset password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>}
 */
const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);
  
  // Verify token
  await UserModel.verifyPasswordResetToken(hashedToken);
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  // Reset password
  const user = await UserModel.resetPassword(hashedToken, passwordHash);
  
  logger.logAuth('password_reset_completed', { userId: user.id });
  
  return {
    message: 'Password reset successful'
  };
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AuthenticationError('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  // Update password
  await UserModel.updatePassword(userId, passwordHash);
  
  logger.logAuth('password_changed', { userId });
  
  return {
    message: 'Password changed successfully'
  };
};

/**
 * Logout user (invalidate tokens on client side)
 * @param {string} userId - User ID
 * @param {Object} requestInfo - Request information
 * @returns {Promise<Object>}
 */
const logout = async (userId, requestInfo = {}) => {
  await AuditLogModel.create({
    userId,
    action: 'logout',
    entityType: 'auth',
    ipAddress: requestInfo.ipAddress,
    userAgent: requestInfo.userAgent
  });
  
  logger.logAuth('user_logged_out', { userId });
  
  return {
    message: 'Logged out successfully'
  };
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  logout
};