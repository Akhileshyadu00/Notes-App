import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Note from './models/Note';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = "mongodb+srv://akhileshyadu001_db_user:v4ENQQ88NjpdyOku@cluster0.izxut3b.mongodb.net/notes_app?retryWrites=true&w=majority";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// API Routes
app.get('/api/notes', async (req, res) => {
    try {
        const notes = await Note.find().sort({ pinned: -1, lastModified: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ message: 'Error creating note' });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: 'Error updating note' });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
