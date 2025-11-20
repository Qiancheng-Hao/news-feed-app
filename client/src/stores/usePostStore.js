import { create } from 'zustand';
import request from '../utils/request';

const usePostStore = create((set, get) => ({
    posts: [],
    isLoading: false,

    // fetch posts
    fetchPosts: async (forceRefresh = false) => {
        const currentPosts = get().posts;
        const isLoading = get().isLoading;

        // if not force refresh and we have cached posts, return directly
        if (!forceRefresh && currentPosts.length > 0) {
            return;
        }

        // avoid duplicate loading
        if (isLoading) return;

        set({ isLoading: true });

        try {
            const res = await request.get('/posts');
            set({ posts: res, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // clear posts
    clearPosts: () => set({ posts: [] }),
}));

export default usePostStore;
