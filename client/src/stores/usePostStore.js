import { create } from 'zustand';
import request from '../utils/request';

const pageSize = 10;

const usePostStore = create((set, get) => ({
    posts: [],
    isLoading: false,
    page: 1, // next page to fetch
    hasMore: true, // more posts to load

    // fetch posts
    fetchPosts: async (forceRefresh = false) => {

        const { isLoading, hasMore, page, posts } = get();

        // if not force refresh and we have cached posts, return directly
        if (!forceRefresh && (isLoading || !hasMore)) {
            return;
        }

        // avoid duplicate loading
        if (isLoading) return;

        set({ isLoading: true });

        const currentPage = forceRefresh ? 1 : page;

        try {
            const res = await request.get('/posts', {
                params: {
                    page: currentPage,
                    pageSize: pageSize,
                },
            });

            const noMoreData = res.length < pageSize;

            if (forceRefresh) {
                // cover old data
                set({
                    posts: res,
                    page: 2,
                    hasMore: !noMoreData,
                    isLoading: false,
                });
            } else {
                // append to old data
                set({
                    posts: [...posts, ...res],
                    page: currentPage + 1,
                    hasMore: !noMoreData,
                    isLoading: false,
                });
            }
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // clear posts
    clearPosts: () => set({ posts: [], page: 1, hasMore: true }),
}));

export default usePostStore;
