export interface Note {
    _id?: string;
    title: string;
    content: string;
    tags: string[];
    pinned: boolean;
    lastModified: number;
}

const API_URL = 'http://localhost:5001/api/notes';

export class ApiService {
    static async getNotes(): Promise<Note[]> {
        const response = await fetch(API_URL);
        return response.json();
    }

    static async addNote(note: Note): Promise<Note> {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        });
        return response.json();
    }

    static async updateNote(id: string, note: Partial<Note>): Promise<Note> {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        });
        return response.json();
    }

    static async deleteNote(id: string): Promise<void> {
        await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
    }
}
