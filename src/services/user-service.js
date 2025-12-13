const UserModel = require('../models/user-model');
const EnrollmentModel = require('../models/enrollment-model');

const userService = {
  async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    const enrollments = await EnrollmentModel.findByUserId(userId);
    return { user, enrollments };
  },
  
  async updateProfile(userId, updates) {
    return await UserModel.update(userId, updates);
  },
  
  async getAllUsers(options) {
    return await UserModel.findAll(options);
  }
};

module.exports = userService;