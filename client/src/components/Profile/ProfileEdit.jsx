import { useState } from 'react';
import {
    Button,
    Card,
    Toast,
    Form,
    Input,
    List,
    Popup,
    NavBar,
    Collapse,
    Avatar,
} from 'antd-mobile';
import ImageUpload from '../Post/ImageUpload';
import useVerifyCode from '../../hooks/useVerifyCode';
import CaptchaModal from '../Captcha/CaptchaModal';
import { IconLock, IconUser, IconImage, IconDoubleDown } from '@arco-design/web-react/icon';
import { getThumbnailUrl } from '../../utils/image';
import '@arco-design/web-react/dist/css/arco.css';
import '../../styles/components/ProfileEdit.css';

export default function ProfileEdit({ user, updateUserInfo }) {
    // 'avatar' | 'name' | 'password' | null
    const [activePopup, setActivePopup] = useState(null);
    // Loading states
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    // Avatar state
    const [fileList, setFileList] = useState([]);
    // Form instances
    const [nameForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const {
        countdown,
        isSending,
        sendCode,
        captchaVisible,
        captchaKey,
        handleCaptchaSuccess,
        closeCaptcha,
    } = useVerifyCode();

    // Handlers for Opening Popups
    const openAvatarPopup = () => {
        if (user?.avatar) {
            setFileList([
                {
                    id: 'current-avatar',
                    url: user.avatar,
                    serverUrl: user.avatar,
                    status: 'success',
                    percent: 100,
                },
            ]);
        } else {
            setFileList([]);
        }
        setActivePopup('avatar');
    };

    const openNamePopup = () => {
        if (user?.username) {
            nameForm.setFieldsValue({ username: user.username });
        }
        setActivePopup('name');
    };

    const openPasswordPopup = () => {
        passwordForm.resetFields();
        setActivePopup('password');
    };

    // Handlers for Saving
    const handleSaveAvatar = async () => {
        const currentAvatarUrl = fileList.length > 0 ? fileList[0].serverUrl : '';
        if (currentAvatarUrl === user.avatar) {
            setActivePopup(null);
            return;
        }
        try {
            await updateUserInfo({ avatar: currentAvatarUrl });
            Toast.show('头像更新成功');
            setActivePopup(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveName = async () => {
        try {
            const values = await nameForm.validateFields();
            if (values.username === user.username) {
                setActivePopup(null);
                return;
            }
            setIsSavingName(true);
            await updateUserInfo({ username: values.username });
            Toast.show('用户名更新成功');
            setActivePopup(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleSavePassword = async () => {
        try {
            const values = await passwordForm.validateFields();
            if (values.newPassword !== values.confirmPassword) {
                Toast.show('两次输入的密码不一致');
                return;
            }

            setIsSavingPassword(true);
            await updateUserInfo({
                password: values.newPassword,
                code: values.code,
            });

            Toast.show('密码修改成功');
            setActivePopup(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleGetCode = () => {
        if (!user?.email) return;
        sendCode(user.email, 'update_password');
    };

    // Check if any file is currently uploading
    const isUploading = fileList.some((file) => file.status === 'uploading');

    return (
        <>
            {/* Settings List */}
            <Card className="profile-edit-card">
                <Collapse arrow={<IconDoubleDown className="profile-edit-collapse-icon" />}>
                    <Collapse.Panel
                        key="settings"
                        title={
                            <div className="profile-edit-header">
                                <Avatar
                                    src={getThumbnailUrl(user.avatar, 100)}
                                    className="profile-edit-avatar"
                                />
                                <div>
                                    <h2 className="profile-edit-username">{user.username}</h2>
                                    <p className="profile-edit-email">{user.email}</p>
                                </div>
                            </div>
                        }
                    >
                        <List>
                            <List.Item prefix={<IconImage />} onClick={openAvatarPopup} arrow>
                                修改头像
                            </List.Item>
                            <List.Item prefix={<IconUser />} onClick={openNamePopup} arrow>
                                修改用户名
                            </List.Item>
                            <List.Item prefix={<IconLock />} onClick={openPasswordPopup} arrow>
                                重设密码
                            </List.Item>
                        </List>
                    </Collapse.Panel>
                </Collapse>
            </Card>

            {/* Avatar Popup */}
            <Popup
                visible={activePopup === 'avatar'}
                onMaskClick={() => setActivePopup(null)}
                position="right"
                bodyClassName="profile-popup-body"
            >
                <NavBar onBack={() => setActivePopup(null)} back="返回">
                    修改头像
                </NavBar>
                <div className="profile-popup-content">
                    <Card>
                        <div className="profile-avatar-upload-wrapper">
                            <ImageUpload
                                fileList={fileList}
                                setFileList={setFileList}
                                maxCount={1}
                            />
                        </div>
                        <Button
                            block
                            color="primary"
                            onClick={handleSaveAvatar}
                            disabled={isUploading}
                        >
                            {isUploading ? '上传中...' : '保存头像'}
                        </Button>
                    </Card>
                </div>
            </Popup>

            {/* Name Popup */}
            <Popup
                visible={activePopup === 'name'}
                onMaskClick={() => setActivePopup(null)}
                position="right"
                bodyClassName="profile-popup-body"
            >
                <NavBar onBack={() => setActivePopup(null)} back="返回">
                    修改用户名
                </NavBar>
                <div className="profile-popup-content">
                    <Card>
                        <Form form={nameForm} layout="horizontal">
                            <Form.Item
                                name="username"
                                label="用户名"
                                rules={[{ required: true, message: '用户名不能为空' }]}
                            >
                                <Input placeholder="请输入新的用户名" />
                            </Form.Item>
                        </Form>
                        <div className="profile-form-button-wrapper">
                            <Button
                                block
                                color="primary"
                                onClick={handleSaveName}
                                loading={isSavingName}
                                disabled={isSavingName}
                            >
                                {isSavingName ? '保存中...' : '保存'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </Popup>

            {/* Password Popup */}
            <Popup
                visible={activePopup === 'password'}
                onMaskClick={() => setActivePopup(null)}
                position="right"
                bodyClassName="profile-popup-body"
            >
                <NavBar onBack={() => setActivePopup(null)} back="返回">
                    重设密码
                </NavBar>
                <div className="profile-popup-content">
                    <Card>
                        <Form form={passwordForm} layout="horizontal">
                            <Form.Item label="邮箱">
                                <span className="profile-email-text">{user.email}</span>
                            </Form.Item>

                            <Form.Item
                                label="验证码"
                                extra={
                                    <Button
                                        size="small"
                                        color="primary"
                                        disabled={countdown > 0 || isSending}
                                        onClick={handleGetCode}
                                    >
                                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
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

                            <Form.Item
                                name="newPassword"
                                label="新密码"
                                rules={[{ required: true, message: '请输入新密码' }]}
                            >
                                <Input
                                    type="password"
                                    placeholder="设置新密码"
                                    autoComplete="new-password"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                label="确认密码"
                                rules={[{ required: true, message: '请确认新密码' }]}
                            >
                                <Input
                                    type="password"
                                    placeholder="再次输入新密码"
                                    autoComplete="new-password"
                                />
                            </Form.Item>
                        </Form>

                        <div className="profile-form-button-wrapper">
                            <Button
                                block
                                color="primary"
                                onClick={handleSavePassword}
                                loading={isSavingPassword}
                                disabled={isSavingPassword}
                            >
                                {isSavingPassword ? '修改中...' : '确认修改'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </Popup>

            <CaptchaModal
                visible={captchaVisible}
                onClose={closeCaptcha}
                onSuccess={handleCaptchaSuccess}
                captchaKey={captchaKey}
            />
        </>
    );
}
