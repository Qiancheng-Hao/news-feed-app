import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BasicLayout from './layouts/BasicLayout';
import Publish from './pages/Publish';
import Profile from './pages/Profile';

function App() {
    return (
        <Routes>
            {/* visit /login to show Login component */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* visit / (home) temporarily redirect to login page (for debugging) */}
            {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

            {/* 所有在 BasicLayout 里的页面，都会带底部导航栏 */}
            <Route path="/" element={<BasicLayout />}>
                {/* index 代表默认子路由 (即访问 / 时显示 Home) */}
                <Route index element={<Home />} />

                {/* 访问 /publish 显示 Publish */}
                <Route path="publish" element={<Publish />} />

                {/* 访问 /profile 显示 Profile */}
                <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 page (optional) */}
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}

export default App;
