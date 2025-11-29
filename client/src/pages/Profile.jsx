import { useEffect } from 'react';
import { Button, Card, Avatar, Toast, Dialog } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../stores/useUserStore';
import ProfileEdit from '../components/Profile/ProfileEdit';

export default function Profile() {
    const navigate = useNavigate();
    const { user, fetchUserInfo, logout, updateUserInfo } = useUserStore();

    useEffect(() => {
        if (!user) {
            fetchUserInfo();
        }
    }, [user, fetchUserInfo]);

    const handleLogout = () => {
        Dialog.confirm({
            content: '确定要退出登录吗？',
            onConfirm: () => {
                logout();
                navigate('/login');
                Toast.show('已退出');
            },
        });
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: 20 }}>
            <ProfileEdit user={user} updateUserInfo={updateUserInfo} />

            <Button block color="danger" onClick={handleLogout}>
                退出登录
            </Button>
        </div>
    );
}
