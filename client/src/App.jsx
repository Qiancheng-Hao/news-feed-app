import { Routes, Route } from 'react-router-dom';
import BasicLayout from './layouts/BasicLayout';
import AuthRoute from './components/AuthRoute';
import { Suspense, lazy } from 'react';
import { DotLoading } from 'antd-mobile';
import Home from './pages/Home';

const Publish = lazy(() => import('./pages/Publish'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const PageLoading = () => (
    <div style={{ padding: 20, textAlign: 'center' }}>
        <DotLoading /> 页面加载中...
    </div>
);

function App() {
    return (
        <Suspense fallback={<PageLoading />}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<BasicLayout />}>
                    <Route index element={<Home />} />

                    <Route
                        path="publish"
                        element={
                            <AuthRoute>
                                <Publish />
                            </AuthRoute>
                        }
                    />

                    <Route
                        path="profile"
                        element={
                            <AuthRoute>
                                <Profile />
                            </AuthRoute>
                        }
                    />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
