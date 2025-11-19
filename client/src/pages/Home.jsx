import { Button, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // remove Token
        Toast.show('已退出登录');
        navigate('/login'); // Redirect to login page
    };

    return (
        <div style={{ padding: 20, textAlign: 'center', marginTop: 100 }}>
            <h1>🏠 首页</h1>
            <p>恭喜！你已经成功登录进来了！</p>
            <Button color="danger" onClick={handleLogout}>
                退出登录
            </Button>
        </div>
    );
}
