import { Button, Card, Avatar, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// import request from '../utils/request';
import useUserStore from '../stores/useUserStore';

export default function Profile() {
    const navigate = useNavigate();

    const { user, fetchUserInfo, logout } = useUserStore();

    useEffect(() => {
        if (!user) {
            fetchUserInfo();
        }
    }, [user, fetchUserInfo]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        Toast.show('已退出');
    };

    return (
        <div style={{ padding: 20 }}>
            <Card>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    {/* 显示头像和用户名 */}
                    <Avatar src={user?.avatar} style={{ '--size': '64px', marginRight: 16 }} />
                    <div>
                        <h2 style={{ margin: 0 }}>{user?.username || '加载中...'}</h2>
                        <p style={{ color: '#666', margin: '5px 0 0' }}>{user?.email}</p>
                    </div>
                </div>

                <Button block color="danger" onClick={handleLogout}>
                    退出登录
                </Button>
            </Card>
        </div>
    );
}
