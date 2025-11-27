import { useState, useEffect, useRef, useCallback } from 'react';
import { Toast, Dialog } from 'antd-mobile';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import request from '../utils/request';
import useUserStore from '../stores/useUserStore';
import usePostStore from '../stores/usePostStore';

export default function usePublishLogic() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { user } = useUserStore();
    const fetchPosts = usePostStore((state) => state.fetchPosts);

    // Determine mode
    const editPostId = searchParams.get('id');
    const isEditMode = !!editPostId;

    // Storage Key Strategy
    const DRAFT_LOCAL_STORAGE_KEY = user?.id
        ? isEditMode
            ? `draft_edit_${user.id}_${editPostId}`
            : `draft_new_${user.id}`
        : null;

    const [draftId, setDraftId] = useState(null); // ID of the draft (for new posts) or the post being edited
    const [content, setContent] = useState('');
    const [fileList, setFileList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine); // Network status
    const [statusText, setStatusText] = useState('准备就绪');

    const contentRef = useRef(content);
    const fileListRef = useRef(fileList);
    const draftIdRef = useRef(draftId);
    const originalDataRef = useRef(null); // Store original data for reset

    useEffect(() => {
        contentRef.current = content;
    }, [content]);
    useEffect(() => {
        fileListRef.current = fileList;
    }, [fileList]);
    useEffect(() => {
        draftIdRef.current = draftId;
    }, [draftId]);

    // Network Status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
        };
        const handleOffline = () => {
            setIsOnline(false);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Initialization
    useEffect(() => {
        const initialize = async () => {
            if (!user) return;

            const localDraft = DRAFT_LOCAL_STORAGE_KEY
                ? JSON.parse(localStorage.getItem(DRAFT_LOCAL_STORAGE_KEY))
                : null;

            if (isEditMode) {
                // EDIT MODE
                setDraftId(editPostId);

                // get initial data from location state
                let initialData = location.state?.post;

                if (!initialData) {
                    try {
                        // fetch from server
                        initialData = await request.get(`/posts/${editPostId}`);
                    } catch {
                        console.error('Failed to fetch post details');
                    }
                }

                // Store original data for reset functionality
                if (initialData) {
                    originalDataRef.current = initialData;

                    // reload edit draft from local storage
                    // }

                    // // Check if we have a local draft that is newer/different
                    // if (localDraft) {
                    //     // If we have a local draft, it takes precedence for the *content* being edited
                    //     setContent(localDraft.content || '');
                    //     const images =
                    //         localDraft.images?.map((url) => ({
                    //             id: url,
                    //             url: url,
                    //             serverUrl: url,
                    //             status: 'done',
                    //         })) || [];
                    //     setFileList(images);
                    //     setStatusText('已恢复本地编辑草稿');
                    // } else if (initialData) {
                    //     // Fallback to the original post data

                    setContent(initialData.content || '');
                    const images =
                        initialData.images?.map((url) => ({
                            id: url,
                            url: url,
                            serverUrl: url,
                            status: 'done',
                        })) || [];
                    setFileList(images);
                    setStatusText('正在编辑');
                } else {
                    setStatusText('无法加载原帖，请从列表重新进入');
                }
            } else {
                // NEW POST MODE

                let serverDraft = null;
                try {
                    serverDraft = await request.get('/posts/draft');
                } catch {
                    // Ignore
                }

                let dataToLoad = null;

                if (
                    localDraft &&
                    (!serverDraft ||
                        new Date(localDraft.updated_at) > new Date(serverDraft.updated_at))
                ) {
                    // local draft is newer
                    dataToLoad = localDraft;
                    setStatusText('已恢复本地草稿');
                } else if (serverDraft) {
                    // server draft is newer
                    dataToLoad = serverDraft;
                    setStatusText('已恢复云端草稿');
                }

                if (dataToLoad) {
                    setDraftId(dataToLoad.id);
                    setContent(dataToLoad.content || '');
                    const images =
                        dataToLoad.images?.map((url) => ({
                            id: url,
                            url: url,
                            serverUrl: url,
                            status: 'done',
                        })) || [];
                    setFileList(images);
                }
            }
        };

        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, editPostId, user, DRAFT_LOCAL_STORAGE_KEY]);

    //  Save to Local Storage
    useEffect(() => {
        if (!DRAFT_LOCAL_STORAGE_KEY) return;

        // Don't save empty state if we haven't initialized yet
        if (!content && fileList.length === 0) return;

        const localDraft = {
            id: draftId, // For edit: original post ID. For new: draft ID. For brand new: null
            content: content,
            images: fileList.map((f) => f.serverUrl).filter(Boolean),
            updated_at: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_LOCAL_STORAGE_KEY, JSON.stringify(localDraft));
        setStatusText('更改已保存至本地');
    }, [content, fileList, draftId, DRAFT_LOCAL_STORAGE_KEY]);

    //  Auto-save to Cloud (NEW POSTS ONLY)
    const saveDraftToCloud = useCallback(
        async (force = false) => {
            // We DO NOT auto-save to cloud for Edit Mode to prevent overwriting live posts
            if (isEditMode) return;

            if (!isOnline) {
                setStatusText('离线状态');
                return;
            }

            const currentContent = contentRef.current;
            const currentFileList = fileListRef.current;

            if (!force && currentContent === '' && currentFileList.length === 0) {
                return;
            }

            setStatusText('正在同步至云端...');
            try {
                const payload = {
                    content: currentContent,
                    images: currentFileList.map((f) => f.serverUrl).filter(Boolean),
                    status: 'draft',
                };

                let savedDraft;
                const currentDraftId = draftIdRef.current;

                if (currentDraftId) {
                    savedDraft = await request.put(`/posts/${currentDraftId}`, payload);
                } else {
                    savedDraft = await request.post('/posts', payload);
                    setDraftId(savedDraft.id);
                }
                setStatusText('所有更改已同步至云端');
            } catch {
                setStatusText('云端同步失败');
            }
        },
        [isOnline, isEditMode]
    );

    // Background sync timer
    useEffect(() => {
        if (isEditMode) return; // Disable for edit mode

        const interval = setInterval(() => {
            saveDraftToCloud();
        }, 30000);
        return () => clearInterval(interval);
    }, [saveDraftToCloud, isEditMode]);

    // Trigger immediate save when coming back online
    useEffect(() => {
        if (isOnline && !isEditMode) {
            saveDraftToCloud();
        }
    }, [isOnline, isEditMode, saveDraftToCloud]);

    // Clear / Reset Functionality
    const handleClear = async () => {
        const result = await Dialog.confirm({
            content: isEditMode ? '确定要重置为原帖内容吗？' : '确定要清空当前内容吗？',
        });

        if (!result) return;

        // Remove from Local Storage
        if (DRAFT_LOCAL_STORAGE_KEY) {
            localStorage.removeItem(DRAFT_LOCAL_STORAGE_KEY);
        }

        // Reset State
        if (isEditMode && originalDataRef.current) {
            const { content, images } = originalDataRef.current;
            setContent(content || '');
            const formattedImages =
                images?.map((url) => ({
                    id: url,
                    url: url,
                    serverUrl: url,
                    status: 'done',
                })) || [];
            setFileList(formattedImages);
            setStatusText('已重置为原帖内容');
        } else {
            // Clear everything
            setContent('');
            setFileList([]);
            setStatusText('内容已清空');
        }
    };

    //  Final Publish
    const handleSubmit = async () => {
        if (contentRef.current === '' && fileListRef.current.length === 0)
            return Toast.show('写点什么吧...');
        if (fileListRef.current.some((item) => item.status === 'uploading'))
            return Toast.show('图片还在上传中...');

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                //  UPDATE EXISTING POST
                await request.put(`/posts/${editPostId}`, {
                    content: contentRef.current,
                    images: fileListRef.current.map((item) => item.serverUrl).filter(Boolean),
                    status: 'published',
                });
                Toast.show({ content: '更新成功！', icon: 'success' });
            } else {
                //  PUBLISH NEW POST
                await request.post('/posts', {
                    content: contentRef.current,
                    images: fileListRef.current.map((item) => item.serverUrl).filter(Boolean),
                    status: 'published',
                });

                // Delete the server draft if it exists
                const currentDraftId = draftIdRef.current;
                if (currentDraftId) {
                    try {
                        await request.delete(`/posts/${currentDraftId}`);
                    } catch (e) {
                        console.error('Failed to delete draft', e);
                    }
                }

                Toast.show({ content: '发布成功！', icon: 'success' });
            }

            // Cleanup
            if (DRAFT_LOCAL_STORAGE_KEY) {
                localStorage.removeItem(DRAFT_LOCAL_STORAGE_KEY);
            }
            await fetchPosts(true);
            navigate('/');
        } catch {
            // request.js handle
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        content,
        setContent,
        fileList,
        setFileList,
        isSubmitting,
        statusText,
        isEditMode,
        handleClear,
        handleSubmit,
    };
}
