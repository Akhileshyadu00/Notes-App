import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const { currentFilter, setCurrentFilter, selectedTag, setSelectedTag, notes } = useNotes();
    const { theme, toggleTheme } = useTheme();

    const tags = ['Design', 'Project', 'Personal', 'Ideas'];

    const allCount = notes.length;
    const pinnedCount = notes.filter(n => n.pinned).length;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">
                        <i className="fas fa-feather-alt"></i>
                    </div>
                    <h1>Notes</h1>
                </div>
            </div>

            <div className="search-container">
                <div className="search-bar">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search notes..."
                        onChange={() => {/* Handle search via context if needed, but we have setSearchQuery in context */ }}
                    />
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div
                        className={`nav-item ${currentFilter === 'all' && !selectedTag ? 'active' : ''}`}
                        onClick={() => { setCurrentFilter('all'); setSelectedTag(null); }}
                    >
                        <i className="fas fa-layer-group"></i>
                        <span>All Notes</span>
                        <span className="count">{allCount}</span>
                    </div>
                    <div
                        className={`nav-item ${currentFilter === 'pinned' ? 'active' : ''}`}
                        onClick={() => { setCurrentFilter('pinned'); setSelectedTag(null); }}
                    >
                        <i className="fas fa-thumbtack"></i>
                        <span>Pinned</span>
                        <span className="count">{pinnedCount}</span>
                    </div>
                    {/* Trash placeholder for now */}
                    <div className="nav-item">
                        <i className="fas fa-trash-alt"></i>
                        <span>Trash</span>
                    </div>
                </div>

                <div className="nav-section">
                    <h3 className="section-title">Tags</h3>
                    <div className="tag-list">
                        {tags.map(tag => (
                            <div
                                key={tag}
                                className={`tag-chip ${tag.toLowerCase()} ${selectedTag === tag ? 'active' : ''}`}
                                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                            >
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>
            </nav>

            <div className="user-profile">
                <div className="user-avatar">
                    <i className="fas fa-user-circle"></i>
                </div>
                <div className="user-info">
                    <h4>{user?.username || 'Guest'}</h4>
                    <p>{user?.role === 'admin' ? 'Administrator' : 'Basic User'}</p>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">
                    <i className="fas fa-sign-out-alt"></i>
                </button>
            </div>

            <div className="sidebar-footer">
                <div className="theme-toggle" onClick={toggleTheme}>
                    <i className={`fas fa-${theme === 'dark' ? 'moon' : 'sun'}`}></i>
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    <div className="toggle-switch"></div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
