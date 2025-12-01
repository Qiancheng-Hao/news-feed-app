import { useEffect } from 'react';
import { NavBar, PullToRefresh, ErrorBlock, DotLoading, InfiniteScroll } from 'antd-mobile';
import { Skeleton } from 'antd-mobile';
import PostCard from '../components/Post/PostCard';
import usePostStore from '../stores/usePostStore';
import '../App.css';
import '../styles/pages/Home.css';

const PostSkeleton = () => (
    <div className="skeleton-container">
        <div className="skeleton-header">
            <Skeleton.Title animated className="skeleton-avatar" />
            <div className="skeleton-user-info">
                <Skeleton.Paragraph lineCount={1} animated className="skeleton-username" />
            </div>
        </div>
        <Skeleton.Paragraph lineCount={3} animated />
        <div className="skeleton-image-placeholder" />
        <div className="skeleton-footer">
            <Skeleton.Paragraph lineCount={1} animated className="skeleton-footer-text" />
        </div>
    </div>
);

export default function Home() {
    const { posts, isLoading, fetchPosts, hasMore } = usePostStore();

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
                    <NavBar back={null}>最新动态</NavBar>
                </div>
            </div>

            {/* PullToRefresh */}
            <div className="home-content-area">
                <PullToRefresh onRefresh={handleRefresh}>
                    {/* Scroll area container */}
                    <div className="centerStyle home-scroll-container">
                        {/* first loading*/}
                        {(isLoading || posts.length === 0) && hasMore ? (
                            <>
                                <PostSkeleton />
                                <PostSkeleton />
                                <PostSkeleton />
                            </>
                        ) : /* empty state */
                        posts.length === 0 && !hasMore ? (
                            <ErrorBlock
                                status="empty"
                                title="暂无内容"
                                description="快去发布第一条动态吧！"
                            />
                        ) : (
                            <div className="centerStyle">
                                {posts.map((post, index) => (
                                    <div key={post.id} className="post-item-wrapper">
                                        <PostCard post={post} priority={index < 4} />
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
