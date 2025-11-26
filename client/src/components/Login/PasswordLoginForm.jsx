import { Form, Input, Button } from 'antd-mobile';

export default function PasswordLoginForm({ onFinish, loading }) {
    const handleFinish = (values) => {
        onFinish({
            ...values,
            type: 'password',
        });
    };
    return (
        <Form
            layout="horizontal"
            onFinish={handleFinish}
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
                <Input placeholder="请输入用户名/邮箱" autoComplete="username" />
            </Form.Item>
            <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
            >
                <Input placeholder="请输入密码" type="password" autoComplete="current-password" />
            </Form.Item>
        </Form>
    );
}
