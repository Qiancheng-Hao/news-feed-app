import React, { useEffect } from 'react';
import { NavBar, PullToRefresh, List, ErrorBlock, DotLoading } from 'antd-mobile';
import PostCard from '../components/PostCard';
import usePostStore from '../stores/usePostStore';

export default function Home() {
    const { posts, isLoading, fetchPosts } = usePostStore();

    useEffect(() => {
        // fetch posts on component mount
        fetchPosts();
    }, [fetchPosts]);

    // force refresh handler
    const handleRefresh = async () => {
        await fetchPosts(true);
    };

    return (
        <div style={{ minHeight: '100%', background: '#f5f5f5' }}>
            <NavBar back={null}>最新动态</NavBar>

            <PullToRefresh onRefresh={handleRefresh}>
                {/* only show loading on "first load" and "no cache" */}
                {isLoading && posts.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                        <DotLoading /> 加载中...
                    </div>
                ) : posts.length === 0 ? (
                    <ErrorBlock
                        status="empty"
                        title="暂无内容"
                        description="快去发布第一条动态吧！"
                    />
                ) : (
                    <div style={{ paddingBottom: 20 }}>
                        <div
                            style={{
                                maxWidth: 600,
                                width: '100%',
                                margin: '0 auto',
                                padding: '0 16px', // small side padding on mobile
                            }}
                        >
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}
            </PullToRefresh>
        </div>
    );
}
