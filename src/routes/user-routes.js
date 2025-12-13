const express = require('express');
const router = express.Router();
const { userController } = require('../controllers/user-controller');
const { authenticate } = require('../middleware/auth-middleware');
const { validateBody } = require('../middleware/validator');
const userValidator = require('../validators/user-validator');

// All user routes require authentication
router.use(authenticate);

router.get('/profile', userController.getProfile);

router.put('/profile',
  validateBody(userValidator.updateProfileSchema),
  userController.updateProfile
);

router.get('/enrollments', userController.getEnrollments);

module.exports = router;