import { useState } from 'react';
import { Form, Input, Button, Toast, Card } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import useUserStore from '../stores/useUserStore';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const setToken = useUserStore((state) => state.setToken);

    // on form submit
    const onFinish = async (values) => {
        try {
            setLoading(true);
            // call backend login API
            const res = await request.post('/auth/login', {
                username: values.username,
                password: values.password,
            });

            // login successful: store Token and navigate to home page
            Toast.show({ content: '登录成功', icon: 'success' });
            setToken(res.token);
            navigate('/');
        } catch {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', marginTop: '50px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>欢迎回来</h1>

            <Card>
                <Form
                    layout="horizontal"
                    onFinish={onFinish}
                    footer={
                        <Button block type="submit" color="primary" loading={loading} size="large">
                            登录
                        </Button>
                    }
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名/邮箱' }]}
                    >
                        <Input placeholder="请输入用户名/邮箱" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input placeholder="请输入密码" type="password" />
                    </Form.Item>
                </Form>

                {/* 去注册的链接 */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <span style={{ color: '#666' }}>还没有账号？</span>
                    <span
                        style={{ color: '#1677ff', cursor: 'pointer' }}
                        onClick={() => navigate('/register')}
                    >
                        去注册
                    </span>
                </div>
            </Card>
        </div>
    );
}
