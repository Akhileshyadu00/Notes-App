import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService, Note } from '../api/ApiService';
import { useAuth } from './AuthContext';

interface NotesContextType {
    notes: Note[];
    currentNote: Note | null;
    setCurrentNote: (note: Note | null) => void;
    fetchNotes: () => Promise<void>;
    addNote: () => Promise<void>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentFilter: string;
    setCurrentFilter: (filter: string) => void;
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    isSyncing: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchNotes = async () => {
        if (!token) return;
        setIsSyncing(true);
        try {
            const fetchedNotes = await ApiService.getNotes();
            setNotes(fetchedNotes);
            if (fetchedNotes.length > 0 && !currentNote) {
                // Only auto-select if no note is selected
            }
        } catch (err) {
            console.error('Failed to fetch notes', err);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (token) fetchNotes();
    }, [token]);

    const addNote = async () => {
        setIsSyncing(true);
        try {
            const newNote: Note = {
                title: 'Untitled Note',
                content: '<p>Start writing...</p>',
                tags: [],
                pinned: false,
                lastModified: Date.now()
            };
            const savedNote = await ApiService.addNote(newNote);
            setNotes(prev => [savedNote, ...prev]);
            setCurrentNote(savedNote);
        } catch (err) {
            console.error('Failed to add note', err);
        } finally {
            setIsSyncing(false);
        }
    };

    const updateNote = async (id: string, updates: Partial<Note>) => {
        setIsSyncing(true);
        try {
            const updatedNote = await ApiService.updateNote(id, updates);
            setNotes(prev => prev.map(n => (n._id === id ? updatedNote : n)));
            if (currentNote?._id === id) {
                setCurrentNote(updatedNote);
            }
        } catch (err) {
            console.error('Failed to update note', err);
        } finally {
            setIsSyncing(false);
        }
    };

    const deleteNote = async (id: string) => {
        setIsSyncing(true);
        try {
            await ApiService.deleteNote(id);
            const remainingNotes = notes.filter(n => n._id !== id);
            setNotes(remainingNotes);
            if (currentNote?._id === id) {
                setCurrentNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
            }
        } catch (err) {
            console.error('Failed to delete note', err);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <NotesContext.Provider value={{
            notes, currentNote, setCurrentNote, fetchNotes, addNote, updateNote, deleteNote,
            searchQuery, setSearchQuery, currentFilter, setCurrentFilter, selectedTag, setSelectedTag, isSyncing
        }}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotes = () => {
    const context = useContext(NotesContext);
    if (!context) throw new Error('useNotes must be used within a NotesProvider');
    return context;
};
