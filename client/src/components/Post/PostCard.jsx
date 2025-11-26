import { Card, Avatar, Image, ImageViewer, Popover, Toast, Button } from 'antd-mobile';
import { useState } from 'react';
import { MoreOutline, EditSOutline, DeleteOutline } from 'antd-mobile-icons';
import useUserStore from '../../stores/useUserStore';
import usePostStore from '../../stores/usePostStore';
import request from '../../utils/request';
import { useNavigate } from 'react-router-dom';
import './TipTap.css';

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
        navigate('/publish', { state: { post } });
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
                    style={{
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'inline-block',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        setImageIndex(0);
                        setVisible(true);
                    }}
                >
                    <img
                        src={getThumbnailUrl(singleImg)}
                        loading={priority ? 'eager' : 'lazy'}
                        alt="post"
                        style={{
                            display: 'block',
                            maxWidth: '80%',
                            minWidth: '30%',

                            maxHeight: '350px',

                            width: 'auto',
                            height: 'auto',

                            objectFit: 'cover',
                        }}
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
                style={{
                    display: 'grid',
                    gridTemplateColumns: gridColumns,
                    gap: '8px',
                }}
            >
                {post.images.map((img, index) => (
                    <div
                        key={index}
                        style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '4px' }}
                    >
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
        <Card
            style={{
                marginBottom: '12px',
                borderRadius: 0,
                border: 'none',
                padding: '16px',
            }}
        >
            {/* user info */}
            <div style={{ display: 'flex', marginBottom: '12px', minHeight: '40px' }}>
                <div style={{ flexShrink: 0, width: '40px', height: '40px', marginRight: '12px' }}>
                    <Avatar
                        src={post.User?.avatar}
                        style={{
                            '--size': '40px',
                            width: '40px',
                            height: '40px',
                        }}
                    />
                </div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {post.User?.username || '未知用户'}
                    </div>
                </div>
            </div>

            {/* content */}
            <div
                className="tiptap rich-text-content"
                style={{
                    fontSize: '15px',
                    marginBottom: '12px',
                    whiteSpace: 'pre-wrap',
                    minHeight: '20px',
                    lineHeight: '1.5',
                }}
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

            {/* Footer with time and actions */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    color: '#999',
                    fontSize: '12px',
                }}
            >
                <div>
                    {post.updated_at &&
                    new Date(post.updated_at) >
                        new Date(new Date(post.created_at).getTime() + 1000)
                        ? `编辑于 ${formatDate(post.updated_at)}`
                        : formatDate(post.created_at)}
                </div>

                {isAuthor && (
                    <Popover
                        placement="left"
                        visible={popoverVisible}
                        onVisibleChange={handlePopoverVisibleChange}
                        content={
                            isConfirmingDelete ? (
                                // Confirmation view
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Button size="small" fill="none" onClick={handleCancelDelete}>
                                        返回
                                    </Button>
                                    <div
                                        style={{
                                            height: '14px',
                                            borderLeft: '1px solid var(--adm-color-border)',
                                            margin: '0 4px',
                                        }}
                                    ></div>
                                    <Button size="small" fill="none" color="danger" onClick={executeDelete}>
                                        删除
                                    </Button>
                                </div>
                            ) : (
                                // Initial view
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Button size="small" fill="none" onClick={handleEdit}>
                                        <EditSOutline />
                                    </Button>
                                    <div
                                        style={{
                                            height: '14px',
                                            borderLeft: '1px solid var(--adm-color-border)',
                                            margin: '0 4px',
                                        }}
                                    ></div>
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
                        <div style={{ padding: '0 8px', color: '#999' }}>
                            <MoreOutline fontSize={20} />
                        </div>
                    </Popover>
                )}
            </div>
        </Card>
    );
}
