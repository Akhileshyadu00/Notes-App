import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../api/ApiService';

interface User {
    username: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, role: 'user' | 'admin') => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('notes_token');
        const savedRole = localStorage.getItem('user_role') as 'user' | 'admin';
        const savedUsername = localStorage.getItem('username');

        if (savedToken && savedRole && savedUsername) {
            setToken(savedToken);
            setUser({ username: savedUsername, role: savedRole });
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const result = await ApiService.login(username, password);
        localStorage.setItem('notes_token', result.token);
        localStorage.setItem('user_role', result.role);
        localStorage.setItem('username', result.username);
        setToken(result.token);
        setUser({ username: result.username, role: result.role });
    };

    const register = async (username: string, password: string, role: 'user' | 'admin') => {
        await ApiService.register(username, password, role);
    };

    const logout = () => {
        localStorage.removeItem('notes_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('username');
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
