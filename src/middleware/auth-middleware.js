/**
 * Authentication Middleware
 * JWT verification and user authentication
 */

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/auth-utils');
const { AuthenticationError } = require('../utils/error-utils');
const UserModel = require('../models/user-model');
const { unauthorizedResponse } = require('../utils/response-utils');

/**
 * Authenticate user from JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      throw new AuthenticationError('Authentication token is required');
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const user = await UserModel.findById(decoded.id);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (!user.is_active) {
      throw new AuthenticationError('Account is suspended');
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isEmailVerified: user.is_email_verified
    };
    
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorizedResponse(res, error.message);
    }
    return unauthorizedResponse(res, 'Invalid or expired token');
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await UserModel.findById(decoded.id);
      
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.is_email_verified
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Require email verification
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return unauthorizedResponse(res, 'Authentication required');
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Email verification required',
        code: 'EMAIL_NOT_VERIFIED'
      }
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireEmailVerification
};