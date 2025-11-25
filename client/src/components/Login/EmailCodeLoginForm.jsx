import { Form, Input, Button } from 'antd-mobile';
import useVerifyCode from '../../hooks/useVerifyCode';
import CaptchaModal from '../Captcha/CaptchaModal';
import useEmailValidator from '../../hooks/useEmailValidator';

export default function EmailCodeLoginForm({ onFinish, loading }) {
    const [form] = Form.useForm();
    const emailValidator = useEmailValidator(true);

    const handleFinish = (values) => {
        onFinish({
            ...values,
            type: 'email_code',
        });
    };

    const {
        countdown,
        isSending,
        setIsSending,
        sendCode,
        captchaVisible,
        captchaKey,
        handleCaptchaSuccess,
        closeCaptcha,
    } = useVerifyCode();

    const handleGetCodeClick = async () => {
        try {
            setIsSending(true);
            await form.validateFields(['email']);
            const email = form.getFieldValue('email');
            sendCode(email); // handle sending code with captcha verification
        } catch {
            setIsSending(false);
        }
    };

    return (
        <Form
            form={form}
            layout="horizontal"
            onFinish={handleFinish}
            footer={
                <Button block type="submit" color="primary" loading={loading} size="large">
                    登录
                </Button>
            }
        >
            <Form.Item
                name="email"
                label="邮箱"
                validateTrigger="onBlur"
                rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效邮箱' },
                    { validator: emailValidator },
                ]}
            >
                <Input placeholder="请输入邮箱" autoComplete="email" />
            </Form.Item>
            <Form.Item
                label="验证码"
                extra={
                    <Button
                        size="small"
                        color="primary"
                        disabled={countdown > 0 || isSending}
                        loading={isSending}
                        onClick={handleGetCodeClick}
                    >
                        {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                    </Button>
                }
            >
                <Form.Item
                    name="code"
                    noStyle
                    rules={[{ required: true, message: '请输入验证码' }]}
                >
                    <Input placeholder="6位数字" autoComplete="one-time-code" />
                </Form.Item>
            </Form.Item>
            <CaptchaModal
                visible={captchaVisible}
                captchaKey={captchaKey}
                onSuccess={handleCaptchaSuccess}
                onClose={closeCaptcha}
            />
        </Form>
    );
}
