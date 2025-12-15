import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.ts';
import Admin from '../models/Admin.ts';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/jwt';

// Student/Admin Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    let user;
    let userId;

    if (role === 'student') {
      user = await Student.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      userId = user._id?.toString();
    } else if (role === 'admin') {
      user = await Admin.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
      userId = user._id?.toString();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token and set cookie
    const token = generateToken(userId!, role);
    setTokenCookie(res, token);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      role
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response) => {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Register new student (for initial setup)
export const registerStudent = async (req: Request, res: Response) => {
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

    if (scholarshipType === 'Fully Funded') {
      totalFees = 0;
      remainingBalance = 0;
    } else if (scholarshipType === 'Half Funded') {
      totalFees = 50000;
      remainingBalance = 50000;
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
      message: 'Student registered successfully',
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Register new admin (for initial setup)
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await Admin.create({
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });

  } catch (error: any) {
    console.error('Admin registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during admin registration'
    });
  }
};