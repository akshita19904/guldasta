import mongoose, { Document, Schema } from 'mongoose';

export interface IPerson extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: string;
  birthday?: Date;
  anniversary?: Date;
  interests?: string[];
  notes?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}

const PersonSchema = new Schema<IPerson>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Relationship type is required'],
    enum: ['Partner', 'Family', 'Best Friend', 'Friend', 'Colleague', 'Mentor', 'Other']
  },
  birthday: { type: Date },
  anniversary: { type: Date },
  interests: [{ type: String }],
  notes: { type: String },
  avatar: { type: String, default: '' },
  phone: { type: String },
  email: { type: String }
}, { timestamps: true });

export default mongoose.model<IPerson>('Person', PersonSchema);