import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
    task: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    content: string;
    submittedAt: Date;
    grade?: string;
    feedback?: string;
}

const SubmissionSchema = new Schema<ISubmission>(
    {
        task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
        student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        content: { type: String, required: true }, // URL or text
        submittedAt: { type: Date, default: Date.now },
        grade: { type: String },
        feedback: { type: String }
    },
    {
        timestamps: true
    }
);

// Compound index to ensure one submission per student per task
SubmissionSchema.index({ task: 1, student: 1 }, { unique: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
