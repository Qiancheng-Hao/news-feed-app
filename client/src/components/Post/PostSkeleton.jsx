import React from 'react';
import { Skeleton } from 'antd-mobile';
import '../../styles/components/PostSkeleton.css';

const PostSkeleton = () => (
    <div className="skeleton-container news-skeleton">
        <div className="skeleton-left">
            <div className="skeleton-text-lines">
                <Skeleton.Paragraph lineCount={2} animated />
            </div>
            <div className="skeleton-meta-row">
                <Skeleton.Title animated className="skeleton-avatar-small" />
                <div className="skeleton-meta-text">
                    <Skeleton.Paragraph lineCount={1} animated />
                </div>
            </div>
        </div>
        <div className="skeleton-right">
            <Skeleton.Title animated className="skeleton-image-box" />
        </div>
    </div>
);

export default PostSkeleton;
