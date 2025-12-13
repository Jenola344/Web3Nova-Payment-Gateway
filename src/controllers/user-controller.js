const userService = require('../services/user-service');

const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    
    const profile = await userService.getUserProfile(userId);
    
    successResponse(res, profile, 'Profile retrieved successfully');
  }),
  
  updateProfile: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const updates = req.body;
    
    const user = await userService.updateProfile(userId, updates);
    
    successResponse(res, { user }, 'Profile updated successfully');
  }),
  
  getEnrollments: asyncHandler(async (req, res) => {
    const EnrollmentModel = require('../models/enrollment-model');
    const userId = req.user.id;
    
    const enrollments = await EnrollmentModel.findByUserId(userId);
    
    successResponse(res, { enrollments }, 'Enrollments retrieved successfully');
  })
};

module.exports = userController;