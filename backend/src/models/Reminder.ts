import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  personId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  type: 'birthday' | 'anniversary' | 'custom' | 'holiday';
  remindDaysBefore: number;
  isCompleted: boolean;
  recurringYearly: boolean;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  personId: { type: Schema.Types.ObjectId, ref: 'Person' },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  date: { type: Date, required: true },
  type: { type: String, enum: ['birthday', 'anniversary', 'custom', 'holiday'], default: 'custom' },
  remindDaysBefore: { type: Number, default: 7 },
  isCompleted: { type: Boolean, default: false },
  recurringYearly: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IReminder>('Reminder', ReminderSchema);