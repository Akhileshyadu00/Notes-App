import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
    lastModified: number;
    createdBy: mongoose.Types.ObjectId;
}

const NoteSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
    lastModified: { type: Number, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
