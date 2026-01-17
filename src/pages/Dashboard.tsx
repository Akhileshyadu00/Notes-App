import React from 'react';
import Sidebar from '../components/Sidebar';
import NotesList from '../components/NotesList';
import Editor from '../components/Editor';
import { NotesProvider } from '../context/NotesContext';

const Dashboard: React.FC = () => {
    return (
        <NotesProvider>
            <div className="app-container">
                <Sidebar />
                <NotesList />
                <Editor />
            </div>
        </NotesProvider>
    );
};

export default Dashboard;
