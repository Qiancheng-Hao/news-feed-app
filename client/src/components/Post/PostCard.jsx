import { Card, Avatar, Image, ImageViewer, Popover, Toast, Button } from 'antd-mobile';
import { useState } from 'react';
import { MoreOutline, EditSOutline, DeleteOutline } from 'antd-mobile-icons';
import useUserStore from '../../stores/useUserStore';
import usePostStore from '../../stores/usePostStore';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import { getThumbnailUrl, getAcceleratedUrl } from '../../utils/image';
import '../../styles/components/TipTap.css';
import '../../styles/components/PostCard.css';

export default function PostCard({ post, priority = false, clickable = false, mode = 'original' }) {
    const [visible, setVisible] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const navigate = useNavigate();

    const { user } = useUserStore(); // Correctly get user
    const { removePost } = usePostStore(); // Get removePost function from the store

    const isAuthor = user?.id === post.User?.id;

    const handleCardClick = (e) => {
        if (visible) {
            e?.stopPropagation();
            return;
        }
        if (clickable) {
            navigate(`/posts/${post.id}`, { state: { post } });
        }
    };

    const handlePopoverVisibleChange = (visible) => {
        setPopoverVisible(visible);
        if (!visible) {
            // Reset confirmation state when popover is hidden
            setIsConfirmingDelete(false);
        }
    };

    // The actual deletion logic
    const executeDelete = async () => {
        setPopoverVisible(false); // Close popover
        try {
            await request.delete(`/posts/${post.id}`);
            Toast.show('删除成功');
            removePost(post.id);
        } catch {
            // request.js handles error
        }
    };

    // User clicks the initial delete icon
    const handleDeleteClick = () => {
        setIsConfirmingDelete(true);
    };

    // User clicks "Back" during confirmation
    const handleCancelDelete = () => {
        setIsConfirmingDelete(false);
    };

    // edit post
    const handleEdit = () => {
        setPopoverVisible(false);
        setIsConfirmingDelete(false);
        navigate(`/publish?id=${post.id}`, { state: { post } });
    };

    // format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}月${day}日 ${hours}:${minutes}`;
    };

    // --- Render Logic for News Mode ---
    if (mode === 'news') {
        let validImages = Array.isArray(post.images) ? post.images.filter((img) => !!img) : [];
        
        // If no images in fileList, try to extract from content
        if (validImages.length === 0 && post.content) {
            const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
            if (imgMatch && imgMatch[1]) {
                validImages = [imgMatch[1]];
            }
        }

        const hasImage = validImages.length > 0;
        const firstImage = hasImage ? validImages[0] : null;

        // Replace headings and lists with paragraphs for uniform styling in news card
        let contentWithHeadingsReplaced = post.content
            ? post.content
                  .replace(/<h[1-6][^>]*>/g, '<p>')
                  .replace(/<\/h[1-6]>/g, '</p>')
                  .replace(/<li[^>]*>/g, '<p>')
                  .replace(/<\/li>/g, '</p>')
                  .replace(/<\/?ul[^>]*>/g, '')
                  .replace(/<\/?ol[^>]*>/g, '')
            : '';

        // Check if content is effectively empty
        const strippedContent = contentWithHeadingsReplaced.replace(/<[^>]+>/g, '').trim();
        if (!strippedContent) {
            contentWithHeadingsReplaced = '<p>分享了图片</p>';
        }

        return (
            <Card
                className={`post-card-news ${hasImage ? 'has-image' : 'no-image'}`}
                onClick={handleCardClick}
            >
                <div className="news-card-body-wrapper">
                    {/* Left side */}
                    <div className="news-content-left">
                        <div className="news-text-wrapper">
                            <div
                                className="tiptap rich-text-content news-text"
                                dangerouslySetInnerHTML={{ __html: contentWithHeadingsReplaced }}
                            />
                        </div>

                        <div className="news-meta">
                            <div className="news-info-left">
                                <Avatar
                                    src={getThumbnailUrl(post.User?.avatar)}
                                    className="news-avatar"
                                />
                                <span className="news-username">
                                    {post.User?.username || '未知用户'}
                                </span>
                                <span className="news-date">{formatDate(post.created_at)}</span>
                            </div>
                            {isAuthor && (
                                <div onClick={(e) => e.stopPropagation()} className="news-actions">
                                    <Popover
                                        placement="left"
                                        visible={popoverVisible}
                                        onVisibleChange={handlePopoverVisibleChange}
                                        content={
                                            isConfirmingDelete ? (
                                                <div className="popover-actions">
                                                    <Button
                                                        size="small"
                                                        fill="none"
                                                        onClick={handleCancelDelete}
                                                    >
                                                        返回
                                                    </Button>
                                                    <div className="action-divider"></div>
                                                    <Button
                                                        size="small"
                                                        fill="none"
                                                        color="danger"
                                                        onClick={executeDelete}
                                                    >
                                                        删除
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="popover-actions">
                                                    <Button
                                                        size="small"
                                                        fill="none"
                                                        onClick={handleEdit}
                                                    >
                                                        <EditSOutline />
                                                    </Button>
                                                    <div className="action-divider"></div>
                                                    <Button
                                                        size="small"
                                                        fill="none"
                                                        color="danger"
                                                        onClick={handleDeleteClick}
                                                    >
                                                        <DeleteOutline />
                                                    </Button>
                                                </div>
                                            )
                                        }
                                        trigger="click"
                                    >
                                        <div className="more-icon-wrapper">
                                            <MoreOutline fontSize={16} />
                                        </div>
                                    </Popover>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    {hasImage && (
                        <div className="news-image-right">
                            <img
                                src={getThumbnailUrl(firstImage)}
                                loading={priority ? 'eager' : 'lazy'}
                                fetchpriority={priority ? 'high' : 'auto'}
                                alt="cover"
                            />
                        </div>
                    )}
                </div>
            </Card>
        );
    }

    // Original Mode
    const validImages = Array.isArray(post.images) ? post.images.filter((img) => !!img) : [];
    const imageCount = validImages.length;
    const renderImages = () => {
        if (imageCount === 0) return null;

        // one image case
        if (imageCount === 1) {
            const singleImg = validImages[0];
            return (
                <div
                    className="single-image-wrapper"
                    onClick={(e) => {
                        e.stopPropagation();
                        setImageIndex(0);
                        setVisible(true);
                    }}
                >
                    <img
                        src={getThumbnailUrl(singleImg)}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchpriority={priority ? 'high' : 'auto'}
                        alt="post"
                        className="single-image"
                    />
                </div>
            );
        }
        let gridColumns = 'repeat(3, 1fr)';
        if (imageCount === 2 || imageCount === 4) gridColumns = 'repeat(2, 1fr)';
        return (
            <div className="image-grid" style={{ gridTemplateColumns: gridColumns }}>
                {validImages.map((img, index) => (
                    <div key={index} className="image-grid-item">
                        <img
                            src={getThumbnailUrl(img)}
                            loading={priority ? 'eager' : 'lazy'}
                            fetchpriority={priority && index === 0 ? 'high' : 'auto'}
                            alt={`post-img-${index}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setImageIndex(index);
                                setVisible(true);
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="post-card" onClick={handleCardClick}>
            {/* user info */}
            <div className="post-header">
                <div className="post-avatar-wrapper">
                    <Avatar src={getThumbnailUrl(post.User?.avatar)} className="post-avatar" />
                </div>
                <div>
                    <div className="post-username">{post.User?.username || '未知用户'}</div>
                </div>
            </div>

            {/* content */}
            <div
                className="tiptap rich-text-content post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* call renderImages function */}
            {renderImages()}
            {visible && (
                <ImageViewer.Multi
                    images={post.images?.map((img) => getAcceleratedUrl(img)) || []}
                    visible={visible}
                    defaultIndex={imageIndex}
                    onClose={() => setVisible(false)}
                    key={imageIndex}
                />
            )}

            {/* Tags */}
            {/* {post.tags && post.tags.length > 0 && (
                <div className="tags-wrapper">
                    {post.tags.map((tag, index) => (
                        <span
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/publish', { state: { topic: tag } });
                            }}
                            className="tag-item"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )} */}

            {/* Footer with time and actions */}
            <div className="post-footer">
                <div>
                    {/* {post.updated_at &&
                    new Date(post.updated_at) >
                        new Date(new Date(post.created_at).getTime() + 1000)
                        ? `编辑于 ${formatDate(post.updated_at)}`
                        : formatDate(post.created_at)} */}
                    {formatDate(post.created_at)}
                </div>

                {isAuthor && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Popover
                            placement="left"
                            visible={popoverVisible}
                            onVisibleChange={handlePopoverVisibleChange}
                            content={
                                isConfirmingDelete ? (
                                    // Confirmation view
                                    <div className="popover-actions">
                                        <Button
                                            size="small"
                                            fill="none"
                                            onClick={handleCancelDelete}
                                        >
                                            返回
                                        </Button>
                                        <div className="action-divider"></div>
                                        <Button
                                            size="small"
                                            fill="none"
                                            color="danger"
                                            onClick={executeDelete}
                                        >
                                            删除
                                        </Button>
                                    </div>
                                ) : (
                                    // Initial view
                                    <div className="popover-actions">
                                        <Button size="small" fill="none" onClick={handleEdit}>
                                            <EditSOutline />
                                        </Button>
                                        <div className="action-divider"></div>
                                        <Button
                                            size="small"
                                            fill="none"
                                            color="danger"
                                            onClick={handleDeleteClick}
                                        >
                                            <DeleteOutline />
                                        </Button>
                                    </div>
                                )
                            }
                            trigger="click"
                        >
                            <div className="more-icon-wrapper">
                                <MoreOutline fontSize={20} />
                            </div>
                        </Popover>
                    </div>
                )}
            </div>
        </Card>
    );
}
