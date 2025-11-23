import React, { useEffect, useState } from 'react';
import { TabBar } from 'antd-mobile';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AppOutline, AddCircleOutline, UserOutline } from 'antd-mobile-icons';

export default function BasicLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { pathname } = location;

    // control active tab state
    const [activeKey, setActiveKey] = useState(pathname);

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
        <div
            style={{
                height: '100dvh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* 内容区域 渲染子路由组件 */}
            <div style={{ flex: 1, overflow: 'hidden', background: '#f5f5f5' }}>
                <Outlet />
            </div>

            {/* 底部导航 */}
            <div style={{ borderTop: '1px solid #eee', background: '#fff' }}>
                <TabBar activeKey={activeKey} onChange={(key) => navigate(key)}>
                    {tabs.map((item) => (
                        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                    ))}
                </TabBar>
            </div>
        </div>
    );
}
