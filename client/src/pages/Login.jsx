import { useState } from 'react';
import { Toast, Card, Tabs } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import useUserStore from '../stores/useUserStore';
import PasswordLoginForm from '../components/PasswordLoginForm';
import EmailCodeLoginForm from '../components/EmailCodeLoginForm';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const setToken = useUserStore((state) => state.setToken);
    const [loginType, setLoginType] = useState('password');

    // on form submit
    const onFinish = async (values) => {
        try {
            setLoading(true);

            // call backend login API
            const res = await request.post('/auth/login', values);

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
                <Tabs
                    activeKey={loginType}
                    onChange={(key) => setLoginType(key)}
                    style={{ '--content-padding': '0' }}
                >
                    <Tabs.Tab title="账号密码登录" key="password" />
                    <Tabs.Tab title="邮箱验证码登录" key="email" />
                </Tabs>

                {/* 2 different login types */}
                <div className="form-content" style={{ marginTop: '24px' }}>
                    {loginType === 'password' ? (
                        <PasswordLoginForm loading={loading} onFinish={onFinish} />
                    ) : (
                        <EmailCodeLoginForm loading={loading} onFinish={onFinish} />
                    )}
                </div>

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
