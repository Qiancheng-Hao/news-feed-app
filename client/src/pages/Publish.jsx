import React, { useState } from 'react';
import { NavBar, Button, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import usePostStore from '../stores/usePostStore';
import ImageUpload from '../components/Post/ImageUpload';
import Tiptap from '../components/Post/Tiptap';
import '../App.css';

export default function Publish() {
    const navigate = useNavigate();

    const [content, setContent] = useState('');
    const [fileList, setFileList] = useState([]); // { id, url, serverUrl, status, percent }
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = usePostStore((state) => state.fetchPosts);

    const handleSubmit = async () => {
        if (!content.trim() && fileList.length === 0) return Toast.show('写点什么吧...');
        if (fileList.some((item) => item.status === 'uploading'))
            return Toast.show('图片还在上传中...');

        setIsSubmitting(true);
        try {
            const images = fileList.map((item) => item.serverUrl).filter(Boolean);
            await request.post('/posts', { content, images });
            Toast.show({ content: '发布成功！', icon: 'success' });
            await fetchPosts(true);
            navigate('/');
        } catch {
            // request.js will handle errors
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
                            发布
                        </Button>
                    }
                >
                    发布动态
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
