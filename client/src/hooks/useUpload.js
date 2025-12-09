import { useRef, useCallback } from 'react';
import request from '../utils/request';
import axios from 'axios';

export default function useUpload() {
    const uploadControllersRef = useRef(new Map());

    // Uploads a file to the cloud
    const uploadImage = useCallback(async (file, { onProgress, customId } = {}) => {
        const tempId = customId;
        const abortController = new AbortController();

        // Store controller for cancellation
        uploadControllersRef.current.set(tempId, abortController);

        try {
            // Get presigned URL
            const signRes = await request.get('/upload/presign', {
                params: { fileName: file.name, fileType: file.type },
            });
            const { uploadUrl, publicUrl } = signRes;

            // Upload to cloud
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                signal: abortController.signal,
                onUploadProgress: (e) => {
                    if (onProgress && e.total) {
                        const percent = Math.round((e.loaded * 100) / e.total);
                        onProgress(percent);
                    }
                },
            });

            return publicUrl;
        } catch (error) {
            // Attach ID to error for identification if needed
            error.uploadId = tempId;
            throw error;
        } finally {
            // Cleanup
            uploadControllersRef.current.delete(tempId);
        }
    }, []);

    // Cancels an ongoing upload by its ID.
    const cancelUpload = useCallback((id) => {
        if (uploadControllersRef.current.has(id)) {
            uploadControllersRef.current.get(id).abort();
            uploadControllersRef.current.delete(id);
        }
    }, []);

    return { uploadImage, cancelUpload };
}
