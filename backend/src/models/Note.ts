import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  personId: mongoose.Types.ObjectId;
  content: string;
  tag: 'preference' | 'milestone' | 'memory';
  createdAt: Date;
}

const NoteSchema = new Schema<INote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  personId: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
  content: { type: String, required: true, trim: true },
  tag: { type: String, enum: ['preference', 'milestone', 'memory'], default: 'memory' },
}, { timestamps: true });

export default mongoose.model<INote>('Note', NoteSchema);