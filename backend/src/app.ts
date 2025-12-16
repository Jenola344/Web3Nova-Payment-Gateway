import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { generalLimiter } from './middleware/rate-limiter';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';
import userRoutes from './routes/user';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
console.log(process.env.FRONTEND_URL);
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);
app.use('/payments', paymentRoutes);
app.use('/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

export default app;