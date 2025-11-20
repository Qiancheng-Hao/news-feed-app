import { useState, useEffect } from 'react';
import { Form, Input, Button, Toast, Card } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSending, setIsSending] = useState(false); // whether the code is being sent

    // validate code countdown state
    const [countdown, setCountdown] = useState(0);

    // handle countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    // 1. send verification code
    const sendCode = async () => {
        const email = form.getFieldValue('email');

        // email validation
        if (!email) {
            Toast.show('请先填写邮箱');
            return;
        }
        if (!email.includes('@')) {
            Toast.show('请输入有效邮箱');
            return;
        }

        setIsSending(true);

        try {
            // send request
            await request.post('/auth/send-code', { email });
            Toast.show('验证码已发送，请查收');
            setCountdown(60); // start 60s countdown
        } catch {
            //  Errors are intercepted in request.js, no need for additional handling here
        } finally {
            setIsSending(false);
        }
    };

    // 2. handle form submit
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

    // create form instance to get form values
    const [form] = Form.useForm();

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
                    {/* 邮箱输入框 */}
                    <Form.Item
                        name="email"
                        label="邮箱"
                        rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}
                    >
                        <Input placeholder="example@outlook.com" />
                    </Form.Item>

                    {/* 验证码行 */}
                    <Form.Item
                        label="验证码"
                        extra={
                            <Button
                                size="small"
                                color="primary"
                                disabled={countdown > 0 || isSending} // Disabled during countdown or while sending
                                loading={isSending} // show loading when sending
                                onClick={sendCode}
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
                            <Input placeholder="6位数字" />
                        </Form.Item>
                    </Form.Item>

                    {/* 用户名 */}
                    <Form.Item name="username" label="用户名">
                        <Input placeholder="设置一个用户名" />
                    </Form.Item>

                    {/* 密码 */}
                    <Form.Item name="password" label="密码" rules={[{ required: true }]}>
                        <Input placeholder="设置密码" type="password" />
                    </Form.Item>

                    {/* 确认密码 */}
                    <Form.Item name="confirmPassword" label="确认密码" rules={[{ required: true }]}>
                        <Input placeholder="再次输入密码" type="password" />
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
            </Card>
        </div>
    );
}
