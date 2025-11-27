import { useState, useEffect, useRef } from 'react';
import { Toast } from 'antd-mobile';
import request from '../utils/request';

export default function useVerifyCode() {
    const [isSending, setIsSending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [captchaVisible, setCaptchaVisible] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);

    const pendingEmailRef = useRef('');
    const typeRef = useRef('');

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    // send code after captcha success
    const handleSubmission = async () => {
        const email = pendingEmailRef.current;
        const type = typeRef.current;
        setIsSending(true);
        try {
            setCaptchaVisible(false);
            await request.post('/auth/send-code', { email, type });
            Toast.show('验证码已发送');
            setCountdown(60);
        } catch {
            // request.js handle
        } finally {
            setIsSending(false);
        }
    };

    // trigger verify process
    const sendCode = (email, type) => {
        pendingEmailRef.current = email; 
        typeRef.current = type;
        setCaptchaKey(Date.now()); // update key to reset captcha
        setCaptchaVisible(true); // show captcha modal
    };

    // success on captcha
    const handleCaptchaSuccess = () => {
        setTimeout(() => {
            handleSubmission();
        }, 500);
    };

    const closeCaptcha = () => {
        setCaptchaVisible(false);
        setIsSending(false);
    };

    return {
        countdown,
        isSending,
        setIsSending,
        captchaVisible,
        captchaKey,
        sendCode,
        handleCaptchaSuccess,
        closeCaptcha,
    };
}
