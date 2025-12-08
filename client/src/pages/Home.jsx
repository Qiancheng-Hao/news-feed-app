import { useEffect, useRef, useLayoutEffect } from 'react';
import { NavBar, PullToRefresh, ErrorBlock, DotLoading, InfiniteScroll } from 'antd-mobile';
import PostCard from '../components/Post/PostCard';
import PostSkeleton from '../components/Post/PostSkeleton';
import usePostStore from '../stores/usePostStore';
import '../App.css';
import '../styles/pages/Home.css';

export default function Home() {
    const { posts, isLoading, fetchPosts, hasMore, scrollPosition, setScrollPosition } =
        usePostStore();
    const scrollRef = useRef(null);
    const scrollTopRef = useRef(scrollPosition);

    const handleScroll = (e) => {
        scrollTopRef.current = e.target.scrollTop;
    };

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (el && scrollPosition > 0) {
            // Restore scroll position
            el.scrollTop = scrollPosition;
            scrollTopRef.current = scrollPosition;

            // Retry in case of layout shifts
            const attemptRestore = () => {
                if (el.scrollHeight >= scrollPosition + el.clientHeight) {
                    el.scrollTop = scrollPosition;
                }
            };

            const timers = [
                setTimeout(attemptRestore, 50),
                setTimeout(attemptRestore, 150),
                setTimeout(attemptRestore, 300),
            ];

            return () => timers.forEach(clearTimeout);
        }
    }, [scrollPosition]);

    useEffect(() => {
        return () => {
            setScrollPosition(scrollTopRef.current);
        };
    }, [setScrollPosition]);

    useEffect(() => {
        if (posts.length === 0) {
            fetchPosts(true);
        }
    }, [fetchPosts, posts.length]);

    // force refresh handler
    const handleRefresh = async () => {
        await fetchPosts(true);
    };

    const loadMore = async () => {
        if (hasMore && !isLoading) {
            await fetchPosts(false);
        }
    };

    return (
        <div className="home-container">
            {/* NavBar */}
            <div className="home-navbar-wrapper">
                <div className="centerStyle">
                    <NavBar back={null}>最新资讯</NavBar>
                </div>
            </div>

            {/* PullToRefresh */}
            <div className="home-content-area" ref={scrollRef} onScroll={handleScroll}>
                <PullToRefresh onRefresh={handleRefresh}>
                    {/* Scroll area container */}
                    <div className="centerStyle home-scroll-container">
                        {/* first loading */}
                        {isLoading && posts.length === 0 ? (
                            <>
                                <PostSkeleton />
                                <PostSkeleton />
                                <PostSkeleton />
                                <PostSkeleton />
                                <PostSkeleton />
                                <PostSkeleton />
                            </>
                        ) : /* empty state */
                        posts.length === 0 && !hasMore ? (
                            <ErrorBlock
                                status="empty"
                                title="暂无内容"
                                description="快去发布第一条资讯吧！"
                            />
                        ) : (
                            <div>
                                {posts.map((post, index) => (
                                    <div key={post.id} className="post-item-wrapper">
                                        <PostCard
                                            post={post}
                                            priority={index < 6}
                                            clickable={true}
                                            mode="news"
                                        />
                                    </div>
                                ))}

                                <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                                    {hasMore ? (
                                        <div className="loading-more-wrapper">
                                            <DotLoading />
                                        </div>
                                    ) : (
                                        <div className="no-more-wrapper">- 没有更多了 -</div>
                                    )}
                                </InfiniteScroll>
                            </div>
                        )}
                    </div>
                </PullToRefresh>
            </div>
        </div>
    );
}
