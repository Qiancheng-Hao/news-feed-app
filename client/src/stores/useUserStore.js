import { create } from 'zustand';
import request from '../utils/request';

const useUserStore = create((set, get) => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(sessionStorage.getItem('user')) || null,

    // login
    setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
    },

    setUser: (user) => {
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },

    // fetch user info action: call backend API
    fetchUserInfo: async () => {
        const token = get().token;
        if (!token) {
            return;
        }

        try {
            const res = await request.get('/auth/me');
            get().setUser(res.yourData);
        } catch (error) {
            console.error('获取用户信息失败', error);
        }
    },

    // logout
    logout: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
        set({ token: null, user: null });
    },
}));

export default useUserStore;
