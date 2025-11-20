import React from 'react';
import { Card, Avatar, Image, ImageViewer } from 'antd-mobile';
import { useState } from 'react';

export default function PostCard({ post }) {
    const [visible, setVisible] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    // format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}`;
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
                        // Container handle border radius and click event
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
                        src={singleImg}
                        alt="post"
                        style={{
                            display: 'block',
                            maxWidth: '70%',
                            minWidth: '30%',

                            maxHeight: '250px',

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
                            src={img}
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
        <Card style={{ marginBottom: '12px', borderRadius: 0, border: 'none' }}>
            {/* user info */}
            <div style={{ display: 'flex', marginBottom: '12px' }}>
                <Avatar src={post.User?.avatar} style={{ '--size': '40px', marginRight: '12px' }} />
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                        {post.User?.username || '未知用户'}
                    </div>
                    <div style={{ color: '#999', fontSize: '12px', marginTop: '2px' }}>
                        {formatDate(post.created_at)}
                    </div>
                </div>
            </div>

            {/* content */}
            <div style={{ fontSize: '15px', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                {post.content}
            </div>

            {/* call renderImages function */}
            {renderImages()}

            <ImageViewer.Multi
                images={post.images || []}
                visible={visible}
                defaultIndex={imageIndex}
                onClose={() => setVisible(false)}
                key={imageIndex}
            />
        </Card>
    );
}
