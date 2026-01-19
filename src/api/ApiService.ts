export interface Note {
    _id?: string;
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
    lastModified: number;
}

const API_URL = '/api';

export class ApiService {
    private static getHeaders() {
        const token = localStorage.getItem('notes_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    static async register(username: string, password: string, role: 'user' | 'admin') {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    }

    static async login(username: string, password: string) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    }

    static async getNotes(): Promise<Note[]> {
        const response = await fetch(`${API_URL}/notes`, {
            headers: this.getHeaders()
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('unauthorized');
            }
            throw new Error('Failed to fetch notes');
        }
        return response.json();
    }

    static async addNote(note: Note): Promise<Note> {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(note)
        });
        return response.json();
    }

    static async updateNote(id: string, note: Partial<Note>): Promise<Note> {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(note)
        });
        return response.json();
    }

    static async deleteNote(id: string): Promise<void> {
        await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
    }
}
