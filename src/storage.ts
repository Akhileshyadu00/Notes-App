export class StorageManager {
    static getTheme(): string {
        return localStorage.getItem('theme_preference') || 'dark';
    }

    static saveTheme(theme: string): void {
        localStorage.setItem('theme_preference', theme);
    }
}
