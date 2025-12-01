import { create } from 'zustand';
import request from '../utils/request';

const pageSize = 10;

const usePostStore = create((set, get) => ({
    posts: [],
    isLoading: false,
    page: 1, // next page to fetch
    hasMore: true, // more posts to load
    scrollPosition: 0, // save scroll position

    setScrollPosition: (position) => set({ scrollPosition: position }),

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
                // Prepend new posts to existing posts & remove duplicates
                const combinedPosts = [...res, ...posts];
                const uniquePosts = [];
                const seenIds = new Set();

                for (const post of combinedPosts) {
                    if (!seenIds.has(post.id)) {
                        seenIds.add(post.id);
                        uniquePosts.push(post);
                    }
                }

                set({
                    posts: uniquePosts,
                    page: posts.length > 0 ? page : 2,
                    hasMore: !noMoreData,
                    isLoading: false,
                });
            } else {
                // Append new posts to the end and remove duplicates
                const combinedPosts = [...posts, ...res];
                const uniquePosts = [];
                const seenIds = new Set();

                for (const post of combinedPosts) {
                    if (!seenIds.has(post.id)) {
                        seenIds.add(post.id);
                        uniquePosts.push(post);
                    }
                }

                set({
                    posts: uniquePosts,
                    page: currentPage + 1,
                    hasMore: !noMoreData,
                    isLoading: false,
                });

                // how many new posts added
                const addedCount = uniquePosts.length - posts.length;

                if (addedCount < 5 && !noMoreData) {
                    get().fetchPosts(false);
                }
            }
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    // clear posts
    clearPosts: () => set({ posts: [], page: 1, hasMore: true }),

    // remove post by id
    removePost: (postId) =>
        set((state) => ({ posts: state.posts.filter((post) => post.id !== postId) })),
}));

export default usePostStore;
