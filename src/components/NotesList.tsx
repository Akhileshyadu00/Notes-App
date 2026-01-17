import React from 'react';
import { useNotes } from '../context/NotesContext';
import { Note } from '../api/ApiService';

const NotesList: React.FC = () => {
    const {
        notes,
        currentNote,
        setCurrentNote,
        searchQuery,
        setSearchQuery,
        currentFilter,
        selectedTag,
        addNote
    } = useNotes();

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = currentFilter === 'all' || (currentFilter === 'pinned' && note.pinned);
        const matchesTag = !selectedTag || note.tags.includes(selectedTag);
        return matchesSearch && matchesFilter && matchesTag;
    });

    // Sort: Pinned first, then lastModified descending
    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.lastModified - a.lastModified;
    });

    const pinned = sortedNotes.filter(n => n.pinned);
    const regular = sortedNotes.filter(n => !n.pinned);

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getPreviewText = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const NoteCard = ({ note }: { note: Note }) => (
        <div
            className={`note-card ${note._id === currentNote?._id ? 'active' : ''} ${note.pinned ? 'pinned' : ''}`}
            onClick={() => setCurrentNote(note)}
        >
            <div className="note-card-header">
                <h4 className="note-title">{note.title || 'Untitled'}</h4>
                <i className={`fas fa-thumbtack pin-icon ${note.pinned ? '' : 'hidden'}`}></i>
            </div>
            <p className="note-preview">{getPreviewText(note.content)}</p>
            <div className="note-meta">
                <div className="note-tags">
                    {note.tags.map(tag => (
                        <span key={tag} className={`tag-dot ${tag.toLowerCase()}`}></span>
                    ))}
                </div>
                <span className="note-time">{formatTime(note.lastModified)}</span>
            </div>
        </div>
    );

    return (
        <section className="notes-list-section">
            <header className="list-header">
                <h2>{selectedTag ? `${selectedTag} Notes` : (currentFilter === 'pinned' ? 'Pinned Notes' : 'All Notes')}</h2>
                <div className="list-actions">
                    <button className="icon-btn"><i className="fas fa-sort-amount-down"></i></button>
                    <button className="add-note-btn" onClick={addNote}><i className="fas fa-plus"></i></button>
                </div>
            </header>

            <div className="search-container" style={{ padding: '0 16px 16px' }}>
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search in list..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="notes-scroll-area">
                {pinned.length > 0 && (
                    <div className="notes-group">
                        <h3 className="group-title">Pinned</h3>
                        {pinned.map(note => <NoteCard key={note._id} note={note} />)}
                    </div>
                )}

                <div className="notes-group">
                    <h3 className="group-title">Recent</h3>
                    {regular.map(note => <NoteCard key={note._id} note={note} />)}
                    {regular.length === 0 && pinned.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                            No notes found
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NotesList;
