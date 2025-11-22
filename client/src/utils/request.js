import axios from 'axios';
import { Toast } from 'antd-mobile';

// create axios instance
const request = axios.create({
    baseURL: '/api', // all requests will automatically have the /api prefix
    timeout: 60000,
});

// request interceptor: automatically add Token before each request
request.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// response interceptor: handle errors uniformly
request.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // 1. Extract error message from response
        const errorMessage = error.response?.data?.message || '请求失败';

        if (error.response && error.response.status === 403) {
            window.location.href = '/login';
        } else if (error.response && error.response.status === 401) {
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (isLoginRequest) {
                Toast.show({ content: errorMessage, icon: 'fail' });
            } else {
                // If other endpoints return 401, it means the Token has truly expired
                Toast.show({ content: '登录过期，请重新登录' });
                localStorage.removeItem('token');

                // Only redirect if not already on the login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        } else {
            // 3. Handle other errors
            Toast.show({ content: errorMessage, icon: 'fail' });
        }

        return Promise.reject(error);
    }
);

export default request;
