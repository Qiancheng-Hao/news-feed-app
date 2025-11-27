import React, { useState, useRef } from 'react';
import { Toast, ProgressBar } from 'antd-mobile';
import { CloseOutline, AddOutline } from 'antd-mobile-icons';
import request from '../../utils/request';
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

export default function ImageUpload({ fileList, setFileList, maxCount = 9 }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const uploadControllersRef = useRef(new Map()); // Track upload abort controllers

    // upload file
    const uploadFile = async (file) => {
        // set the ID for file
        const tempId = Date.now() + Math.random().toString();
        const abortController = new AbortController();
        uploadControllersRef.current.set(tempId, abortController);
        const base64Url = await fileToDataURL(file);

        // Add the image to the list (status: uploading, progress: 0)
        const newItem = {
            id: tempId,
            url: base64Url,
            serverUrl: null,
            status: 'uploading',
            percent: 0,
        };

        setFileList((prev) => [...prev, newItem]);

        // start uploading
        try {
            const signRes = await request.get('/upload/presign', {
                params: { fileName: file.name, fileType: file.type },
            });

            const { uploadUrl, publicUrl } = signRes;

            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                signal: abortController.signal, // 🔥 Allow cancellation
                // real-time progress update
                onUploadProgress: (e) => {
                    const percent = Math.round((e.loaded * 100) / e.total);
                    // update progress for this specific ID
                    setFileList((prev) =>
                        prev.map((item) => (item.id === tempId ? { ...item, percent } : item))
                    );
                },
            });

            // successful upload
            setFileList((prev) =>
                prev.map((item) =>
                    item.id === tempId
                        ? { ...item, status: 'success', serverUrl: publicUrl, percent: 100 }
                        : item
                )
            );
        } catch (e) {
            // 🔥 Don't show error if user cancelled
            if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
                Toast.show('上传失败');
            }
            // upload failed -- remove the item
            setFileList((prev) => prev.filter((item) => item.id !== tempId));
        } finally {
            // 🔥 Clean up controller
            uploadControllersRef.current.delete(tempId);
        }
    };

    // handle file selection
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // check count limit
        if (fileList.length + files.length > maxCount) {
            Toast.show(`最多只能上传 ${maxCount} 张图片`);
            return;
        }

        // trigger upload for each file
        files.forEach((file) => {
            // size check
            if (file.size > 20 * 1024 * 1024) {
                Toast.show('图片过大，已跳过');
                return;
            }
            uploadFile(file);
        });

        // clear input to allow selecting the same image again
        e.target.value = '';
    };

    // handle delete
    const handleDelete = (targetItem) => {
        // 🔥 If still uploading, abort the upload
        if (targetItem.status === 'uploading' && uploadControllersRef.current.has(targetItem.id)) {
            uploadControllersRef.current.get(targetItem.id).abort();
            uploadControllersRef.current.delete(targetItem.id);
        }

        // If already uploaded successfully, delete from server
        if (targetItem.serverUrl) {
            request.delete('/upload', { data: { url: targetItem.serverUrl } }).catch(() => {});
        }

        setFileList((prev) => prev.filter((item) => item.id !== targetItem.id));
    };

    // drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        if (fileList.length + files.length > maxCount) {
            Toast.show(`最多只能上传 ${maxCount} 张图片`);
            return;
        }

        files.forEach((file) => {
            if (file.size > 20 * 1024 * 1024) {
                Toast.show('图片过大');
                return;
            }
            if (!file.type.startsWith('image/')) {
                Toast.show('只能上传图片');
                return;
            }
            uploadFile(file);
        });
    };

    const getImageUrl = (item) => {
        if (item.status === 'uploading') {
            return item.url;
        }
        // Safety check: ensure serverUrl exists before calling .includes
        if (item.serverUrl?.includes('.volces.com')) {
            return `${item.serverUrl}?x-tos-process=image/resize,w_300`;
        }
        return item.serverUrl;
    };

    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
            }}
        >
            {/* files already uploaded */}
            {fileList.map((item) => (
                <div
                    key={item.id}
                    style={{
                        position: 'relative',
                        width: '100px',
                        height: '100px',
                        aspectRatio: '1/1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#f5f5f5',
                    }}
                >
                    {/* image */}
                    <img
                        src={getImageUrl(item)}
                        alt="upload"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* delete button */}
                    <div
                        onClick={() => handleDelete(item)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.3)',
                            width: '20px',
                            height: '20px',
                            borderBottomLeftRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <CloseOutline color="#fff" fontSize={12} />
                    </div>

                    {/* progress bar */}
                    {item.status === 'uploading' && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.6)',
                                padding: '4px 8px',
                            }}
                        >
                            <ProgressBar
                                percent={item.percent}
                                style={{
                                    '--track-width': '4px',
                                    '--track-color': 'rgba(255,255,255,0.3)',
                                }}
                            />
                            <div
                                style={{
                                    color: '#fff',
                                    fontSize: '10px',
                                    textAlign: 'center',
                                    marginTop: 2,
                                }}
                            >
                                {item.percent}%
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* upload button */}
            {fileList.length < maxCount && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{
                        aspectRatio: '1/1',
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        width: '100px',
                        height: '100px',
                        border: isDragging ? '2px dashed #1677ff' : '2px dashed transparent',
                        borderRadius: '12px',
                        padding: '8px',
                        transition: 'all 0.3s',
                    }}
                >
                    <AddOutline fontSize={32} color="#999" />
                </div>
            )}

            {/* hidden native input */}
            <input
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
        </div>
    );
}
