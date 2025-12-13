const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const { authenticate } = require('../middleware/auth-middleware');
const { validateBody, validateQuery } = require('../middleware/validator');
const { rateLimiter } = require('../middleware/rate-limiter');
const authValidator = require('../validators/auth-validator');

// Public routes with rate limiting
router.post('/register',
  rateLimiter({ maxRequests: 5, windowMs: 900000 }),
  validateBody(authValidator.registerSchema),
  authController.register
);

router.post('/login',
  rateLimiter({ maxRequests: 10, windowMs: 900000 }),
  validateBody(authValidator.loginSchema),
  authController.login
);

router.post('/refresh',
  validateBody(authValidator.refreshTokenSchema),
  authController.refreshToken
);

router.get('/verify-email',
  validateQuery(authValidator.verifyEmailSchema),
  authController.verifyEmail
);

router.post('/forgot-password',
  rateLimiter({ maxRequests: 3, windowMs: 900000 }),
  validateBody(authValidator.forgotPasswordSchema),
  authController.forgotPassword
);

router.post('/reset-password',
  validateBody(authValidator.resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.post('/change-password',
  authenticate,
  validateBody(authValidator.changePasswordSchema),
  authController.changePassword
);

router.post('/logout',
  authenticate,
  authController.logout
);

router.get('/me',
  authenticate,
  authController.getCurrentUser
);

module.exports = router;