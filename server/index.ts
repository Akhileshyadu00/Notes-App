import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Note from './models/Note';
import User from './models/User';
import { authenticateToken, AuthRequest } from './middleware/auth';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already taken' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: role === 'admin' ? 'admin' : 'user'
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, role: user.role, username: user.username });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Protected Note Routes
app.get('/api/notes', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const notes = await Note.find({ createdBy: req.user?.userId }).sort({ pinned: -1, lastModified: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

app.post('/api/notes', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const newNote = new Note({
            ...req.body,
            createdBy: req.user?.userId
        });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ message: 'Error creating note' });
    }
});

app.put('/api/notes/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        // Ensure the note belongs to the user
        const note = await Note.findOne({ _id: req.params.id, createdBy: req.user?.userId });
        if (!note) return res.status(404).json({ message: 'Note not found or unauthorized' });

        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: 'Error updating note' });
    }
});

app.delete('/api/notes/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, createdBy: req.user?.userId });
        if (!note) return res.status(404).json({ message: 'Note not found or unauthorized' });

        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
