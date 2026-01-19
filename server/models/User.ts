import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    password: string;
    role: 'user' | 'admin';
}

const UserSchema: Schema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
