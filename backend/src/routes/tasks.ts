import express from 'express';
import {
    createTask,
    getStudentTasks,
    submitTask,
    getAllTasks,
    getTaskSubmissions,
    gradeTask
} from '../controllers/task-controller';

import { authenticate, authorizeAdmin, authorizeStudent } from '../middleware/authmiddleware';

const router = express.Router();

// Admin routes
router.post('/', authenticate, authorizeAdmin, createTask);
router.get('/all', authenticate, authorizeAdmin, getAllTasks);
router.get('/:taskId/submissions', authenticate, authorizeAdmin, getTaskSubmissions);
router.put('/submissions/:submissionId/grade', authenticate, authorizeAdmin, gradeTask);


// Student routes
router.get('/student', authenticate, authorizeStudent, getStudentTasks);
router.post('/submit', authenticate, authorizeStudent, submitTask);

export default router;
