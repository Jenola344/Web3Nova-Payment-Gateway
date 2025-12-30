import { Response } from 'express';
import { AuthRequest } from '../types/index';
import Task from '../models/Task';
import Submission from '../models/Submission';
import Student from '../models/Student';
import { sendTaskAssignmentEmail, sendGradeNotificationEmail } from '../services/email-service';

// Create a new task (Admin only)
export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const adminId = req.user?.id;
        const { title, description, deadline, assignedStudents, assignedSkills } = req.body;

        if (!title || !description || !deadline) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        let studentIds: string[] = [];

        // Add manually assigned students
        if (assignedStudents && Array.isArray(assignedStudents)) {
            studentIds = [...assignedStudents];
        }

        // Find students by skill and add them
        if (assignedSkills && Array.isArray(assignedSkills) && assignedSkills.length > 0) {
            const studentsWithSkill = await Student.find({ skill: { $in: assignedSkills } }).select('_id');
            const skillStudentIds = studentsWithSkill.map(s => s._id.toString());
            // Merge and dedup
            studentIds = Array.from(new Set([...studentIds, ...skillStudentIds]));
        }

        if (studentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No students found for the selected skills or assignment'
            });
        }

        const task = await Task.create({
            title,
            description,
            deadline,
            assignedStudents: studentIds,
            createdBy: adminId,
            status: 'active'
        });

        // Send emails to assigned students - NON-BLOCKING
        try {
            const students = await Student.find({ _id: { $in: studentIds } });

            // Send emails individually and catch individual errors if needed, or catch block for all
            await Promise.allSettled(students.map(student =>
                sendTaskAssignmentEmail(
                    student.email,
                    student.fullName,
                    task.title,
                    task.deadline.toString()
                )
            ));
            console.log('Task assignment email process completed');
        } catch (emailError: any) {
            console.error('Email sending error (Task created):', emailError.message);
        }

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (error: any) {
        console.error('Create task error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while creating task'
        });
    }
};

// Get tasks for logged-in student
export const getStudentTasks = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;

        // Find active tasks where student is assigned
        const tasks = await Task.find({
            assignedStudents: studentId,
            status: 'active'
        }).sort({ deadline: 1 });

        // Also fetch submissions to know which are done
        const submissions = await Submission.find({
            student: studentId,
            task: { $in: tasks.map(t => t._id) }
        });

        const taskList = tasks.map(task => {
            const submission = submissions.find(s => s.task.toString() === task._id.toString());
            return {
                ...task.toObject(),
                isSubmitted: !!submission,
                submissionDate: submission?.submittedAt,
                grade: submission?.grade
            };
        });

        return res.status(200).json({
            success: true,
            tasks: taskList
        });

    } catch (error: any) {
        console.error('Get student tasks error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching tasks'
        });
    }
};

// Submit a task (from student)
export const submitTask = async (req: AuthRequest, res: Response) => {
    try {
        const studentId = req.user?.id;
        const { taskId, content } = req.body;

        if (!taskId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Task ID and content are required'
            });
        }

        // Check if task exists and is active
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (!task.assignedStudents.includes(studentId as any)) { // Casting pending Mongoose type check
            return res.status(403).json({ success: false, message: 'You are not assigned to this task' });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({ task: taskId, student: studentId });
        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'You have already submitted this task' });
        }

        const submission = await Submission.create({
            task: taskId,
            student: studentId,
            content,
            submittedAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: 'Task submitted successfully',
            submission
        });

    } catch (error: any) {
        console.error('Submit task error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during submission'
        });
    }
};

// Get all tasks (Admin)
export const getAllTasks = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Task.countDocuments();

        return res.status(200).json({
            success: true,
            tasks,
            pagination: {
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: 'Error fetching tasks' });
    }
};

// Get submissions for a task (Admin)
export const getTaskSubmissions = async (req: AuthRequest, res: Response) => {
    try {
        const { taskId } = req.params;

        const submissions = await Submission.find({ task: taskId })
            .populate('student', 'fullName email skill')
            .sort({ submittedAt: -1 });

        return res.status(200).json({
            success: true,
            submissions
        });
    } catch (error: any) {
    }
};

// Grade a submission (Admin)
export const gradeTask = async (req: AuthRequest, res: Response) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback } = req.body;

        if (!grade) {
            return res.status(400).json({ success: false, message: 'Grade is required' });
        }

        const submission = await Submission.findByIdAndUpdate(
            submissionId,
            { grade, feedback },
            { new: true }
        ).populate('student', 'fullName email').populate('task', 'title');

        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        // Send email notification to student about the grade
        if (submission.student && submission.task) {
            await sendGradeNotificationEmail(
                (submission.student as any).email,
                (submission.student as any).fullName,
                (submission.task as any).title,
                grade,
                feedback
            );
        }

        return res.status(200).json({
            success: true,
            message: 'Submission graded successfully',
            submission
        });
    } catch (error: any) {
        console.error('Grade task error:', error);
        return res.status(500).json({ success: false, message: 'Error grading submission' });
    }
};

