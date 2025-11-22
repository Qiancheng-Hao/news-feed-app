import { useRef, useCallback } from 'react';
import request from '../utils/request';

export default function useEmailValidator(mustExist = false) {
    // use to store Promise of last email check
    const emailCheckCache = useRef({
        email: '',
        promise: null,
        timestamp: 0,
    });

    // define the validator function)
    const validator = useCallback(
        async (_, value) => {
            if (!value) return Promise.resolve();

            const now = Date.now();
            const CACHE_DURATION = 3000; // 防连点3秒

            // check cache first if one already exists
            if (
                value === emailCheckCache.current.email &&
                emailCheckCache.current.promise &&
                now - emailCheckCache.current.timestamp < CACHE_DURATION
            ) {
                return emailCheckCache.current.promise;
            }

            // send request to check email existence
            const checkPromise = (async () => {
                try {
                    const res = await request.post('/auth/check-email', {
                        email: value,
                    });
                    if (mustExist) {
                        if (!res.exists) {
                            return Promise.reject(new Error('该邮箱未注册，请先注册'));
                        }
                    } else {
                        if (res.exists) {
                            return Promise.reject(new Error('该邮箱已被注册, 请直接登录'));
                        }
                    }
                    return Promise.resolve();
                } catch {
                    return Promise.reject(new Error('网络错误，请稍后重试'));
                }
            })();

            // update cache
            emailCheckCache.current = {
                email: value,
                promise: checkPromise,
                timestamp: now,
            };

            return checkPromise;
        },
        [mustExist]
    );

    return validator;
}
