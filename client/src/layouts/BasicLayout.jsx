import React, { useEffect, useState } from 'react';
import { TabBar } from 'antd-mobile';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppOutline, AddCircleOutline, UserOutline } from 'antd-mobile-icons';
import useUserStore from '../stores/useUserStore';
import '../styles/layouts/BasicLayout.css';

export default function BasicLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    // control active tab state
    const [activeKey, setActiveKey] = useState(pathname);

    const { fetchUserInfo, user } = useUserStore();
    // on App start, fetch user info if not present
    useEffect(() => {
        if (!user) {
            fetchUserInfo();
        }
    }, []);

    // update activeKey when pathname changes
    useEffect(() => {
        setActiveKey(pathname);
    }, [pathname]);

    // define three tabs
    const tabs = [
        {
            key: '/',
            title: '首页',
            icon: <AppOutline />,
        },
        {
            key: '/publish',
            title: '发布',
            icon: <AddCircleOutline />,
        },
        {
            key: '/profile',
            title: '我的',
            icon: <UserOutline />,
        },
    ];

    return (
        <div className="basic-layout-container">
            {/* 内容区域 渲染子路由组件 */}
            <div className="basic-layout-content">
                <Outlet />
            </div>

            {/* 底部导航 */}
            <div className="basic-layout-tabbar">
                <TabBar activeKey={activeKey} onChange={(key) => navigate(key)}>
                    {tabs.map((item) => (
                        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                    ))}
                </TabBar>
            </div>
        </div>
    );
}
