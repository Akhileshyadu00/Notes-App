import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
    lastModified: number;
}

const NoteSchema: Schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
    lastModified: { type: Number, default: Date.now }
});

export default mongoose.model<INote>('Note', NoteSchema);
