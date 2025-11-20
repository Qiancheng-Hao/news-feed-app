import { create } from 'zustand';
import request from '../utils/request';

const useUserStore = create((set, get) => ({

    token: localStorage.getItem('token') || null,
    user: null,

    // login
    setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
    },

    // fetch user info action: call backend API
    fetchUserInfo: async () => {
        try {
            const res = await request.get('/auth/me');
            set({ user: res.yourData });
        } catch (error) {
            console.error('获取用户信息失败', error);
        }
    },

    // logout
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
    },
}));

export default useUserStore;
