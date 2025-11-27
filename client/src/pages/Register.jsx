import { useState } from 'react';
import { Form, Input, Button, Toast, Card } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import useVerifyCode from '../hooks/useVerifyCode';
import CaptchaModal from '../components/Captcha/CaptchaModal';
import useEmailValidator from '../hooks/useEmailValidator';

export default function Register() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const emailValidator = useEmailValidator(false);

    const {
        countdown,
        isSending,
        setIsSending,
        sendCode,
        captchaVisible,
        captchaKey,
        handleCaptchaSuccess,
        closeCaptcha,
    } = useVerifyCode();

    const handleGetCodeClick = async () => {
        try {
            setIsSending(true);
            await form.validateFields(['email']);
            const email = form.getFieldValue('email');
            sendCode(email, 'register');
        } catch {
            setIsSending(false);
        }
    };

    // handle form submit
    const onFinish = async (values) => {
        // double-check password
        if (values.password !== values.confirmPassword) {
            Toast.show({ content: '两次密码不一致', icon: 'fail' });
            return;
        }

        try {
            setLoading(true);
            // call register API
            await request.post('/auth/register', {
                email: values.email,
                code: values.code,
                username: values.username,
                password: values.password,
            });

            Toast.show({ content: '注册成功！', icon: 'success' });
            navigate('/login');
        } catch {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', marginTop: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>用户注册</h1>

            <Card>
                <Form
                    form={form}
                    layout="horizontal"
                    onFinish={onFinish}
                    footer={
                        <Button block type="submit" color="primary" loading={loading} size="large">
                            注册
                        </Button>
                    }
                >
                    {/* 用户名 */}
                    <Form.Item name="username" label="用户名">
                        <Input placeholder="设置一个用户名" autoComplete="username" />
                    </Form.Item>

                    {/* 邮箱输入框 */}
                    <Form.Item
                        name="email"
                        label="邮箱"
                        validateTrigger="onBlur"
                        rules={[
                            { required: true, message: '请输入邮箱' },
                            { type: 'email', message: '请输入有效邮箱' },
                            { validator: emailValidator },
                        ]}
                    >
                        <Input placeholder="example@outlook.com" autoComplete="email" />
                    </Form.Item>

                    {/* 验证码行 */}
                    <Form.Item
                        label="验证码"
                        extra={
                            <Button
                                size="small"
                                color="primary"
                                disabled={countdown > 0 || isSending}
                                loading={isSending}
                                onClick={handleGetCodeClick}
                            >
                                {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                            </Button>
                        }
                    >
                        <Form.Item
                            name="code"
                            noStyle
                            rules={[{ required: true, message: '请输入验证码' }]}
                        >
                            <Input placeholder="6位数字" autoComplete="one-time-code" />
                        </Form.Item>
                    </Form.Item>

                    {/* 密码 */}
                    <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                        <Input placeholder="设置密码" type="password" autoComplete="new-password" />
                    </Form.Item>

                    {/* 确认密码 */}
                    <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true }]}>
                        <Input
                            placeholder="再次输入密码"
                            type="password"
                            autoComplete="new-password"
                        />
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <span style={{ color: '#666' }}>已有账号？</span>
                    <span
                        style={{ color: '#1677ff', cursor: 'pointer' }}
                        onClick={() => navigate('/login')}
                    >
                        去登录
                    </span>
                </div>

                <CaptchaModal
                    visible={captchaVisible}
                    onClose={closeCaptcha}
                    onSuccess={handleCaptchaSuccess}
                    captchaKey={captchaKey}
                />
            </Card>
        </div>
    );
}
