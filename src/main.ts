import { ApiService, Note } from './api';
import { StorageManager } from './storage';

// State Management
let notes: Note[] = [];
let currentNoteId: string | null = null;
let searchQuery = '';
let currentFilter = 'all'; // all, pinned
let selectedTag: string | null = null;

// DOM Elements
const pinnedNotesList = document.getElementById('pinned-notes') as HTMLDivElement;
const regularNotesList = document.getElementById('regular-notes') as HTMLDivElement;
const editorTitle = document.querySelector('.editor-title-input') as HTMLInputElement;
const editorBody = document.querySelector('.editor-body') as HTMLDivElement;
const syncStatus = document.getElementById('sync-status') as HTMLSpanElement;
const syncIcon = document.getElementById('sync-icon') as HTMLElement;
const allCount = document.getElementById('all-count') as HTMLSpanElement;
const pinnedCount = document.getElementById('pinned-count') as HTMLSpanElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const addNoteBtn = document.getElementById('add-note-btn') as HTMLButtonElement;
const deleteBtn = document.getElementById('delete-btn') as HTMLButtonElement;
const pinBtn = document.getElementById('pin-btn') as HTMLButtonElement;
const navItems = document.querySelectorAll('.nav-item');
const tagChips = document.querySelectorAll('.tag-chip');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Check Authentication
  const token = localStorage.getItem('notes_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const savedTheme = StorageManager.getTheme();
  document.body.classList.toggle('light-theme', savedTheme === 'light');
  updateThemeUI(savedTheme);

  // Update UI with user info
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('user_role');
  const userHeader = document.querySelector('.user-info h4');
  const userRoleText = document.querySelector('.user-info p');
  if (userHeader) userHeader.textContent = username || 'User';
  if (userRoleText) userRoleText.textContent = userRole === 'admin' ? 'Administrator' : 'Basic User';

  await fetchNotes();

  if (notes.length > 0) {
    selectNote(notes[0]._id!);
  }

  setupEventListeners();
});

async function fetchNotes() {
  showSyncing();
  try {
    notes = await ApiService.getNotes();
    renderNotesList();
    showSynced('Database');
  } catch (err) {
    console.error('Failed to fetch notes', err);
    syncStatus.textContent = 'Error fetching notes';
  }
}

function setupEventListeners() {
  // Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      const theme = isLight ? 'light' : 'dark';
      StorageManager.saveTheme(theme);
      updateThemeUI(theme);
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      ApiService.logout();
    });
  }

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
    renderNotesList();
  });

  // Add Note
  addNoteBtn.addEventListener('click', async () => {
    const newNote: Note = {
      title: 'Untitled Note',
      content: '<p>Start writing...</p>',
      tags: [],
      pinned: false,
      lastModified: Date.now()
    };

    showSyncing();
    try {
      const savedNote = await ApiService.addNote(newNote);
      notes.unshift(savedNote);
      renderNotesList();
      selectNote(savedNote._id!);
      showSynced('Database');
    } catch (err) {
      console.error('Failed to add note', err);
    }
  });

  // Delete Note
  deleteBtn.addEventListener('click', async () => {
    if (currentNoteId) {
      showSyncing();
      try {
        await ApiService.deleteNote(currentNoteId);
        notes = notes.filter(n => n._id !== currentNoteId);
        renderNotesList();
        if (notes.length > 0) {
          selectNote(notes[0]._id!);
        } else {
          clearEditor();
        }
        showSynced('Database');
      } catch (err) {
        console.error('Failed to delete note', err);
      }
    }
  });

  // Pin Toggle
  pinBtn.addEventListener('click', async () => {
    if (currentNoteId) {
      const note = notes.find(n => n._id === currentNoteId);
      if (note) {
        const updatedPinned = !note.pinned;
        showSyncing();
        try {
          const updatedNote = await ApiService.updateNote(currentNoteId, {
            pinned: updatedPinned,
            lastModified: Date.now()
          });
          // Update local state
          const index = notes.findIndex(n => n._id === currentNoteId);
          if (index !== -1) notes[index] = updatedNote;

          renderNotesList();
          updatePinUI(updatedNote.pinned);
          showSynced('Database');
        } catch (err) {
          console.error('Failed to update pin status', err);
        }
      }
    }
  });

  // Editor Changes (Auto-save)
  let saveTimeout: number;
  [editorTitle, editorBody].forEach(el => {
    el.addEventListener('input', () => {
      if (!currentNoteId) return;

      clearTimeout(saveTimeout);
      showSyncing();

      saveTimeout = window.setTimeout(async () => {
        const note = notes.find(n => n._id === currentNoteId);
        if (note) {
          try {
            const updatedNote = await ApiService.updateNote(currentNoteId!, {
              title: editorTitle.value,
              content: editorBody.innerHTML,
              lastModified: Date.now()
            });
            // Update local state
            const index = notes.findIndex(n => n._id === currentNoteId);
            if (index !== -1) notes[index] = updatedNote;

            renderNotesList();
            showSynced('Database');
          } catch (err) {
            console.error('Failed to auto-save', err);
          }
        }
      }, 1000);
    });
  });

  // Filter switching
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      currentFilter = (item as HTMLElement).dataset.filter || 'all';
      selectedTag = null;
      tagChips.forEach(chip => chip.classList.remove('active'));
      renderNotesList();
    });
  });

  // Tag selection
  tagChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const tag = chip.textContent?.trim() || '';
      if (selectedTag === tag) {
        selectedTag = null;
        chip.classList.remove('active');
      } else {
        selectedTag = tag;
        tagChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      }
      renderNotesList();
    });
  });
}

function renderNotesList() {
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery) ||
      note.content.toLowerCase().includes(searchQuery);
    const matchesFilter = currentFilter === 'all' ||
      (currentFilter === 'pinned' && note.pinned);
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);

    return matchesSearch && matchesFilter && matchesTag;
  });

  // Sort: Pinned first, then lastModified descending
  filteredNotes.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.lastModified - a.lastModified;
  });

  const pinned = filteredNotes.filter(n => n.pinned);
  const regular = filteredNotes.filter(n => !n.pinned);

  // Update counts
  allCount.textContent = notes.length.toString();
  pinnedCount.textContent = notes.filter(n => n.pinned).length.toString();

  // Clear lists
  pinnedNotesList.innerHTML = '<h3 class="group-title">Pinned</h3>';
  regularNotesList.innerHTML = '<h3 class="group-title">Recent</h3>';

  if (pinned.length === 0) pinnedNotesList.style.display = 'none';
  else pinnedNotesList.style.display = 'block';

  pinned.forEach(note => pinnedNotesList.appendChild(createNoteCard(note)));
  regular.forEach(note => regularNotesList.appendChild(createNoteCard(note)));
}

function createNoteCard(note: Note): HTMLElement {
  const card = document.createElement('div');
  const id = note._id!;
  card.className = `note-card ${id === currentNoteId ? 'active' : ''} ${note.pinned ? 'pinned' : ''}`;
  card.innerHTML = `
    <div class="note-card-header">
      <h4 class="note-title">${note.title || 'Untitled'}</h4>
      <i class="fas fa-thumbtack pin-icon ${note.pinned ? '' : 'hidden'}"></i>
    </div>
    <p class="note-preview">${getPreviewText(note.content)}</p>
    <div class="note-meta">
      <div class="note-tags">
        ${note.tags.map(tag => `<span class="tag-dot ${tag.toLowerCase()}"></span>`).join('')}
      </div>
      <span class="note-time">${formatTime(note.lastModified)}</span>
    </div>
  `;

  card.addEventListener('click', () => selectNote(id));
  return card;
}

function selectNote(id: string) {
  currentNoteId = id;
  const note = notes.find(n => n._id === id);
  if (note) {
    editorTitle.value = note.title;
    editorBody.innerHTML = note.content;
    updatePinUI(note.pinned);

    // Update active class on cards
    renderNotesList();
  }
}

function clearEditor() {
  currentNoteId = null;
  editorTitle.value = '';
  editorBody.innerHTML = '';
  syncStatus.textContent = 'No note selected';
}

function updateThemeUI(theme: string) {
  const themeIcon = document.querySelector('.theme-toggle i');
  const themeText = document.querySelector('.theme-toggle span');
  if (themeIcon && themeText) {
    if (theme === 'light') {
      themeIcon.className = 'fas fa-sun';
      themeText.textContent = 'Light Mode';
    } else {
      themeIcon.className = 'fas fa-moon';
      themeText.textContent = 'Dark Mode';
    }
  }
}

function updatePinUI(isPinned: boolean) {
  if (isPinned) {
    pinBtn.classList.add('active');
    pinBtn.style.color = 'var(--accent)';
  } else {
    pinBtn.classList.remove('active');
    pinBtn.style.color = 'var(--text-muted)';
  }
}

function showSyncing() {
  syncStatus.textContent = 'Syncing...';
  syncIcon.className = 'fas fa-sync fa-spin sync-icon';
}

function showSynced(source = 'Cloud') {
  syncStatus.textContent = `Synced to ${source}`;
  syncIcon.className = 'fas fa-cloud-check sync-icon';
}

function getPreviewText(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(timestamp).toLocaleDateString();
}
