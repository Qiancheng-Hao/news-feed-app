import { useEffect } from 'react';
import { NavBar, PullToRefresh, ErrorBlock, DotLoading, InfiniteScroll } from 'antd-mobile';
import { Skeleton } from 'antd-mobile';
import PostCard from '../components/PostCard';
import usePostStore from '../stores/usePostStore';
import '../App.css';

const PostSkeleton = () => (
    <div style={{ padding: 16, background: '#fff', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton.Title animated style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div style={{ marginLeft: 12, flex: 1 }}>
                <Skeleton.Paragraph lineCount={1} animated style={{ width: '30%' }} />
                <Skeleton.Paragraph lineCount={1} animated style={{ width: '20%', marginTop: 4 }} />
            </div>
        </div>
        <Skeleton.Paragraph lineCount={3} animated style={{ marginTop: 12 }} />
        <div style={{ marginTop: 12, height: 200, background: '#f5f5f5' }} />
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
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#f5f5f5',
                overflow: 'hidden',
            }}
        >
            {/* NavBar */}
            <div
                style={{
                    flexShrink: 0,
                    background: '#fff',
                    borderBottom: '1px solid #eee',
                    position: 'sticky',
                }}
            >
                <div className="centerStyle">
                    <NavBar back={null}>最新动态</NavBar>
                </div>
            </div>

            {/* PullToRefresh */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    position: 'relative',
                    WebkitOverflowScrolling: 'touch',
                }}
            >
                <PullToRefresh onRefresh={handleRefresh}>
                    {/* Scroll area container */}
                    <div className="centerStyle" style={{ paddingBottom: 20 }}>
                        {/* first loading*/}
                        {isLoading && posts.length === 0 ? (
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
                                    <div key={post.id} style={{ marginBottom: 12 }}>
                                        <PostCard post={post} priority={index < 2} />
                                    </div>
                                ))}

                                <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
                                    {hasMore ? (
                                        <div
                                            style={{
                                                padding: 16,
                                                textAlign: 'center',
                                                color: '#999',
                                            }}
                                        >
                                            <DotLoading />
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                textAlign: 'center',
                                                color: '#ccc',
                                            }}
                                        >
                                            - 没有更多了 -
                                        </div>
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
