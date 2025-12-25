import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    assignedStudents: mongoose.Types.ObjectId[];
    deadline: Date;
    createdBy: mongoose.Types.ObjectId;
    status: 'active' | 'archived';
    createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        assignedStudents: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
        deadline: { type: Date, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
        status: {
            type: String,
            enum: ['active', 'archived'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

// Index for faster student task lookups
TaskSchema.index({ assignedStudents: 1 });

const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export default Task;
