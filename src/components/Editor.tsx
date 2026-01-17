import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../context/NotesContext';

const Editor: React.FC = () => {
    const { currentNote, updateNote, deleteNote, isSyncing } = useNotes();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    const saveTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (currentNote) {
            setTitle(currentNote.title);
            setContent(currentNote.content);
            if (editorRef.current) {
                editorRef.current.innerHTML = currentNote.content;
            }
        } else {
            setTitle('');
            setContent('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
        }
    }, [currentNote?._id]);

    const handleAutoSave = (newTitle: string, newContent: string) => {
        if (!currentNote?._id) return;

        if (saveTimeout.current) window.clearTimeout(saveTimeout.current);

        saveTimeout.current = window.setTimeout(() => {
            updateNote(currentNote._id!, {
                title: newTitle,
                content: newContent,
                lastModified: Date.now()
            });
        }, 1000);
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        handleAutoSave(val, content);
    };

    const handleBodyInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setContent(html);
            handleAutoSave(title, html);
        }
    };

    if (!currentNote) {
        return (
            <main className="editor-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                    <i className="fas fa-edit" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block' }}></i>
                    <p>Select a note to start editing</p>
                </div>
            </main>
        );
    }

    return (
        <main className="editor-section">
            <header className="editor-header">
                <div className="editor-toolbar-top">
                    <div className="note-status">
                        <i className={`fas ${isSyncing ? 'fa-sync fa-spin' : 'fa-cloud-check'} sync-icon`}></i>
                        <span className="sync-status">{isSyncing ? 'Syncing...' : 'Synced to Cloud'}</span>
                    </div>
                    <div className="editor-actions-top">
                        <button
                            className={`action-btn ${currentNote.pinned ? 'active' : ''}`}
                            onClick={() => updateNote(currentNote._id!, { pinned: !currentNote.pinned })}
                            title="Pin Note"
                        >
                            <i className="fas fa-thumbtack"></i>
                        </button>
                        <button className="action-btn" title="Share"><i className="fas fa-share-nodes"></i></button>
                        <button
                            className="action-btn danger"
                            onClick={() => { if (confirm('Delete note?')) deleteNote(currentNote._id!); }}
                            title="Delete"
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>

                <div className="editor-metadata">
                    <div className="editor-tags">
                        {currentNote.tags.map(tag => (
                            <span key={tag} className={`tag-chip-sm ${tag.toLowerCase()}`}>
                                {tag} <i className="fas fa-times"></i>
                            </span>
                        ))}
                        <button className="add-tag-btn"><i className="fas fa-plus"></i></button>
                    </div>
                </div>

                <div className="rich-toolbar">
                    <button className="tool-btn active"><i className="fas fa-bold"></i></button>
                    <button className="tool-btn"><i className="fas fa-italic"></i></button>
                    <button className="tool-btn"><i className="fas fa-underline"></i></button>
                    <div className="tool-divider"></div>
                    <button className="tool-btn"><i className="fas fa-list-ul"></i></button>
                    <button className="tool-btn"><i className="fas fa-highlighter"></i></button>
                    <button className="tool-btn"><i className="fas fa-code"></i></button>
                </div>
            </header>

            <div className="editor-content-wrapper">
                <input
                    type="text"
                    className="editor-title-input"
                    placeholder="Note Title"
                    value={title}
                    onChange={handleTitleChange}
                />
                <div
                    className="editor-body"
                    contentEditable="true"
                    ref={editorRef}
                    onInput={handleBodyInput}
                    onBlur={handleBodyInput}
                >
                </div>
            </div>
        </main>
    );
};

export default Editor;
