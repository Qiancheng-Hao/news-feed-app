import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavBar, Button, Toast } from 'antd-mobile';
import { useNavigate, useLocation } from 'react-router-dom';
import request from '../utils/request';
import useUserStore from '../stores/useUserStore';
import usePostStore from '../stores/usePostStore';
import ImageUpload from '../components/Post/ImageUpload';
import Tiptap from '../components/Post/Tiptap';
import '../App.css';

export default function Publish() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we are in edit mode by looking for a post in the location state
    const isEditMode = location.state?.post;
    const postToEdit = location.state?.post || {};

    const [content, setContent] = useState(postToEdit.content || '');
    const [fileList, setFileList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = usePostStore((state) => state.fetchPosts);

    // Populate fileList if in edit mode
    useEffect(() => {
        if (isEditMode && postToEdit.images) {
            const imageFiles = postToEdit.images.map((url, index) => ({
                id: `${Date.now()}-${index}`,
                url: `${!url.includes('.volces.com') ? url : `${url}?x-tos-process=image/resize,w_300`}`,
                serverUrl: url,
                status: 'success',
            }));
            setFileList(imageFiles);
        }
    }, [isEditMode, postToEdit.images]);

    const handleSubmit = async () => {
        if (!content.trim() && fileList.length === 0) return Toast.show('写点什么吧...');
        if (fileList.some((item) => item.status === 'uploading'))
            return Toast.show('图片还在上传中...');

        setIsSubmitting(true);
        try {
            const images = fileList.map((item) => item.serverUrl).filter(Boolean);

            if (isEditMode) {
                // Update existing post
                await request.put(`/posts/${postToEdit.id}`, { content, images });
                Toast.show({ content: '更新成功！', icon: 'success' });
            } else {
                // Create new post
                await request.post('/posts', { content, images });
                Toast.show({ content: '发布成功！', icon: 'success' });
            }

            await fetchPosts(true); // Refresh the post list
            navigate('/'); // Go back to home page
        } catch {
            // request.js will handle errors, no need for a separate toast here
        } finally {
            setIsSubmitting(false);
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
            <div
                style={{
                    flexShrink: 0,
                    background: '#fff',
                    borderBottom: '1px solid #eee',
                    position: 'sticky',
                }}
            >
                <NavBar
                    back={null}
                    right={
                        <Button
                            color="primary"
                            size="small"
                            onClick={handleSubmit}
                            loading={isSubmitting}
                        >
                            {isEditMode ? '更新' : '发布'}
                        </Button>
                    }
                >
                    {isEditMode ? '编辑动态' : '发布动态'}
                </NavBar>
            </div>

            <div
                className="centerStyle"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    position: 'relative',
                    WebkitOverflowScrolling: 'touch',
                    background: '#fff',
                }}
            >
                <div style={{ padding: '16px', flex: 1 }}>
                    <div style={{ marginBottom: '20px', flex: 1 }}>
                        <Tiptap value={content} onChange={(html) => setContent(html)} />
                    </div>
                    <ImageUpload fileList={fileList} setFileList={setFileList} maxCount={9} />
                </div>
            </div>
        </div>
    );
}
