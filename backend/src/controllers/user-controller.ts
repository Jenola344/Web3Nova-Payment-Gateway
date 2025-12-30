import { Response } from 'express';
import { AuthRequest } from '../types/index';
import Student from '../models/Student';
import bcrypt from 'bcryptjs';

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { skill: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const students = await Student.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Student.countDocuments(query);

    return res.status(200).json({
      success: true,
      students,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
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
    delete (updatedStudent as any).password;

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

// Create new student (Admin only)
export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, phoneNumber, skill, location, scholarshipType, password } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate fees based on scholarship type
    let totalFees = 100000;
    let remainingBalance = 100000;

    if (scholarshipType === 'Fully Funded') { // Fully funded paying 20k as per existing logic
      totalFees = 20000;
      remainingBalance = 20000;
    } else if (scholarshipType === 'Half Funded') {
      totalFees = 50000;
      remainingBalance = 50000;
    } else if (scholarshipType === 'Full Payment') {
      totalFees = 100000;
      remainingBalance = 100000;
    }

    // Create new student
    const student = await Student.create({
      fullName,
      email,
      phoneNumber,
      skill,
      location,
      scholarshipType,
      totalFees,
      amountPaid: 0,
      remainingBalance,
      password: hashedPassword,
      paymentHistory: []
    });

    return res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email
      }
    });

  } catch (error: any) {
    console.error('Create student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating student'
    });
  }
};

// Update student (Admin - Full Access)
export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, skill, location, scholarshipType } = req.body;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    if (fullName) student.fullName = fullName;
    if (email) student.email = email;
    if (phoneNumber) student.phoneNumber = phoneNumber;
    if (skill) student.skill = skill;
    if (location) student.location = location;
    if (scholarshipType) {
      student.scholarshipType = scholarshipType;
      // Recalculate fees if scholarship changes? 
      // For now, let's assuming manual fee adjustment via updatePayment if needed, or basic logic:
      if (scholarshipType === 'Fully Funded') student.totalFees = 20000;
      else if (scholarshipType === 'Half Funded') student.totalFees = 50000;
      else student.totalFees = 100000;

      // Adjust remaining balance based on new total and already paid
      student.remainingBalance = Math.max(0, student.totalFees - student.amountPaid);
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student
    });

  } catch (error: any) {
    console.error('Update student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating student'
    });
  }
};
// Get student statistics (Admin & Public Tracker)
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalStudents = await Student.countDocuments();
    const fullyPaid = await Student.countDocuments({ remainingBalance: 0 });
    const partiallyPaid = await Student.countDocuments({ amountPaid: { $gt: 0 }, remainingBalance: { $gt: 0 } });
    const notPaid = await Student.countDocuments({ amountPaid: 0 });

    return res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        fullyPaid,
        partiallyPaid,
        notPaid
      }
    });

  } catch (error: any) {
    console.error('Get student stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};