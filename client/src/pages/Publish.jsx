import React, { useState } from 'react';
import { NavBar, TextArea, ImageUploader, Button, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import usePostStore from '../stores/usePostStore';
import axios from 'axios';

// convert File to Base64 data URL
const fileToDataURL = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    });
};

export default function Publish() {
    const navigate = useNavigate();

    const [content, setContent] = useState('');
    const [fileList, setFileList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPosts = usePostStore((state) => state.fetchPosts);

    // Upload logic
    const mockUpload = async (file) => {
        // 1. Convert to Base64 locally (this step is very fast)
        const base64Url = await fileToDataURL(file);

        // Prepare to upload to TOS
        const formData = new FormData();
        formData.append('file', file);

        try {
            // get presigned URL
            const signRes = await request.get('/upload/presign', {
                params: { fileName: file.name, fileType: file.type },
            });

            const { uploadUrl, publicUrl } = signRes;

            // Directly upload to TOS using the presigned URL
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
            });

            return {
                url: base64Url,
                serverUrl: publicUrl,
                status: 'success',
            };
        } catch (e) {
            Toast.show('图片上传失败');
            throw e;
        }
    };

    // Submit post
    const handleSubmit = async () => {
        if (!content.trim() && fileList.length === 0) {
            Toast.show('写点什么吧...');
            return;
        }

        setIsSubmitting(true);
        try {
            // get the url of uploaded images
            const images = fileList.map((item) => item.serverUrl || item.url);
            // only send http links to backend
            const finalImages = images.filter((url) => url && url.startsWith('http'));

            await request.post('/posts', {
                content,
                images: finalImages,
            });

            Toast.show({ content: '发布成功！', icon: 'success' });

            await fetchPosts(true);

            setContent('');
            setFileList([]);
            navigate('/');
        } catch {
            // request.js will handle errors
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete handler
    const handleDelete = async (item) => {
        if (item.serverUrl) {
            try {
                // delete from backend
                request.delete('/upload', {
                    data: { url: item.serverUrl },
                });
            } catch {
                // no need to handle errors here
            }
        }
        return true;
    };

    // Handle image size update
    const handleImgSize = (file) => {
        // Limit max size to 10MB
        const maxMb = 10;
        const maxSize = maxMb * 1024 * 1024;

        if (file.size > maxSize) {
            Toast.show(`图片太大，请上传 ${maxMb}MB 以内的图片`);
            return null;
        }

        return file;
    };

    return (
        <div
            style={{
                background: '#fff',
                minHeight: '100dvh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* 顶部导航 */}
            <NavBar
                back={null}
                right={
                    <Button
                        color="primary"
                        size="small"
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        发布
                    </Button>
                }
            >
                发布动态
            </NavBar>

            <div style={{ padding: '16px', flex: 1 }}>
                <TextArea
                    placeholder="分享新鲜事..."
                    value={content}
                    onChange={(val) => setContent(val)}
                    autoSize={{ minRows: 4, maxRows: 10 }}
                    style={{ fontSize: '16px', marginBottom: '20px' }}
                />

                <ImageUploader
                    value={fileList}
                    onChange={(items) => {
                        setFileList(items.filter((item) => item.status !== 'failed'));
                    }}
                    upload={mockUpload}
                    onDelete={handleDelete}
                    beforeUpload={handleImgSize}
                    multiple={true}
                    maxCount={9}
                />
            </div>
        </div>
    );
}
