import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { NavBar, DotLoading, Skeleton } from 'antd-mobile';
import request from '../utils/request';
import PostCard from '../components/Post/PostCard';
import PostSkeleton from '../components/Post/PostSkeleton';
import '../styles/pages/PostDetail.css';

const TagsSkeleton = () => (
    <div className="related-section">
        <div className="section-title">相关话题</div>
        <div className="suggested-tags-list">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton
                    key={i}
                    animated
                    style={{ width: 60, height: 32, borderRadius: 16, margin: 0 }}
                />
            ))}
        </div>
    </div>
);

const RelatedPostsSkeleton = () => (
    <div className="related-section">
        <div className="section-title">相关推荐</div>
        <div className="related-posts-list">
            {[1, 2, 3].map((i) => (
                <PostSkeleton key={i} />
            ))}
        </div>
    </div>
);

export default function PostDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize with passed state if available
    const initialPost = location.state?.post;

    const [post, setPost] = useState(() => {
        return initialPost && initialPost.id === id ? initialPost : null;
    });
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [loading, setLoading] = useState(!post);
    const [isBackgroundLoading, setIsBackgroundLoading] = useState(true);

    useEffect(() => {
        const passedPost = location.state?.post;
        let currentPostData = null;

        // Immediate State Update (Optimistic UI)
        if (passedPost && passedPost.id === id) {
            setPost(passedPost);
            currentPostData = passedPost;
            setLoading(false);
            setRelatedPosts([]);
            setSuggestedTags([]);
            setIsBackgroundLoading(true);
        } else {
            setPost(null);
            setLoading(true);
            setIsBackgroundLoading(true);
        }

        // Fetch Full Data
        const fetchPostDetail = async () => {
            try {
                const res = await request.get(`/posts/${id}`);
                const { relatedPosts, suggestedTags: dbTags, ...postData } = res;

                setPost(postData);
                setRelatedPosts(relatedPosts || []);
                setSuggestedTags(dbTags || []);
            } catch (error) {
                console.error(error);
                if (!currentPostData) {
                    navigate(-1);
                }
            } finally {
                setLoading(false);
                setIsBackgroundLoading(false);
            }
        };

        if (id) {
            fetchPostDetail();
        }
    }, [id, location.state, navigate]);

    if (loading) {
        return (
            <div style={{ padding: 20, textAlign: 'center' }}>
                <DotLoading /> 加载中...
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="post-detail-page">
            <div className="post-detail-navbar">
                <NavBar onBack={() => navigate(-1)}>详情</NavBar>
            </div>

            <div className="centerStyle">
                <div className="detail-content">
                    <PostCard post={post} priority={true} />
                </div>

                {/* Suggested Topics/Tags */}
                {isBackgroundLoading ? (
                    <TagsSkeleton />
                ) : (
                    suggestedTags.length > 0 && (
                        <div className="related-section">
                            <div className="section-title">相关话题</div>
                            <div className="suggested-tags-list">
                                {suggestedTags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="suggested-tag-item"
                                        onClick={() =>
                                            navigate('/publish', { state: { topic: tag } })
                                        }
                                    >
                                        <span className="suggested-tag-symbol">#</span>
                                        {tag}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}

                {/* Related Posts */}
                {isBackgroundLoading ? (
                    <RelatedPostsSkeleton />
                ) : (
                    relatedPosts.length > 0 && (
                        <div className="related-section">
                            <div className="section-title">相关推荐</div>
                            <div className="related-posts-list">
                                {relatedPosts.map((related) => (
                                    <div
                                        key={related.id}
                                        onClick={() => {
                                            const container =
                                                document.querySelector('.post-detail-page');
                                            if (container) container.scrollTop = 0;
                                            navigate(`/posts/${related.id}`, {
                                                state: { post: related },
                                            });
                                        }}
                                    >
                                        <PostCard post={related} clickable={false} mode="news" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
