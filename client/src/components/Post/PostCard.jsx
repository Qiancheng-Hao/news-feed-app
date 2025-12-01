import { Card, Avatar, Image, ImageViewer, Popover, Toast, Button } from 'antd-mobile';
import { useState } from 'react';
import { MoreOutline, EditSOutline, DeleteOutline } from 'antd-mobile-icons';
import useUserStore from '../../stores/useUserStore';
import usePostStore from '../../stores/usePostStore';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import '../../styles/components/TipTap.css';
import '../../styles/components/PostCard.css';

// function to get thumbnail URL
const getThumbnailUrl = (url) => {
    if (!url) return '';
    if (!url.includes('.volces.com')) return url;

    return `${url}?x-tos-process=image/resize,w_300`;
};

export default function PostCard({ post, priority = false }) {
    const [visible, setVisible] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);
    const [popoverVisible, setPopoverVisible] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const navigate = useNavigate();

    const { user } = useUserStore(); // Correctly get user
    const { removePost } = usePostStore(); // Get removePost function from the store

    const isAuthor = user?.id === post.User?.id;

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

    const imageCount = post.images?.length || 0;

    // render images based on count
    const renderImages = () => {
        if (imageCount === 0) return null;

        // one image case
        if (imageCount === 1) {
            const singleImg = post.images[0];
            return (
                <div
                    className="single-image-wrapper"
                    onClick={() => {
                        setImageIndex(0);
                        setVisible(true);
                    }}
                >
                    <img
                        src={getThumbnailUrl(singleImg)}
                        loading={priority ? 'eager' : 'lazy'}
                        alt="post"
                        className="single-image"
                    />
                </div>
            );
        }

        // multiple images case
        let gridColumns = 'repeat(3, 1fr)';
        if (imageCount === 2 || imageCount === 4) {
            gridColumns = 'repeat(2, 1fr)';
        }

        return (
            <div
                className="image-grid"
                style={{
                    gridTemplateColumns: gridColumns,
                }}
            >
                {post.images.map((img, index) => (
                    <div key={index} className="image-grid-item">
                        <Image
                            src={getThumbnailUrl(img)}
                            lazy={!priority}
                            fit="cover"
                            width="100%"
                            height="100%"
                            onClick={() => {
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
        <Card className="post-card">
            {/* user info */}
            <div className="post-header">
                <div className="post-avatar-wrapper">
                    <Avatar
                        src={`${post.User?.avatar.includes('.volces.com') ? `${post.User?.avatar}?x-tos-process=image/resize,w_300` : post.User?.avatar}`}
                        className="post-avatar"
                    />
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
                    images={post.images || []}
                    visible={visible}
                    defaultIndex={imageIndex}
                    onClose={() => setVisible(false)}
                    key={imageIndex}
                />
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="tags-wrapper">
                    {post.tags.map((tag, index) => (
                        <span
                            key={index}
                            onClick={() => navigate('/publish', { state: { topic: tag } })}
                            className="tag-item"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

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
                    <Popover
                        placement="left"
                        visible={popoverVisible}
                        onVisibleChange={handlePopoverVisibleChange}
                        content={
                            isConfirmingDelete ? (
                                // Confirmation view
                                <div className="popover-actions">
                                    <Button size="small" fill="none" onClick={handleCancelDelete}>
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
                )}
            </div>
        </Card>
    );
}
