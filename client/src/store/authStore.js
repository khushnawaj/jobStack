import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/auth/me');
            set({ user: res.data, isAuthenticated: true, isLoading: false });
        } catch {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        set({ user: res.data, isAuthenticated: true });
        return res.data;
    },
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) { console.error(e) }
        set({ user: null, isAuthenticated: false });
    },
    register: async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        set({ user: res.data, isAuthenticated: true });
        return res.data;
    },
}));

export default useAuthStore;
