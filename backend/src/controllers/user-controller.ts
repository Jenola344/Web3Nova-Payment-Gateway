import { Response } from 'express';
import { AuthRequest } from '../types/index.ts';
import Student from '../models/Student.ts';

// Get student profile
export const getStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;

    const student = await Student.findById(studentId).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      student
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Get all students (Admin only)
export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await Student.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      students,
      count: students.length
    });

  } catch (error: any) {
    console.error('Get all students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching students'
    });
  }
};

// Get student by ID (Admin only)
export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    return res.status(200).json({
      success: true,
      student
    });

  } catch (error: any) {
    console.error('Get student by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching student'
    });
  }
};

// Update student profile (Student only)
export const updateStudentProfile = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { phoneNumber, location } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update only allowed fields
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (location) student.location = location;

    await student.save();

    const updatedStudent = student.toObject();
    delete updatedStudent.password;

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      student: updatedStudent
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};