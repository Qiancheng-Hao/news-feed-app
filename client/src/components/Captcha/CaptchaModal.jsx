import { CenterPopup } from 'antd-mobile';
import SliderCaptcha from './SliderCaptcha';

export default function CaptchaModal({ visible, onClose, onSuccess, captchaKey }) {
    return (
        <CenterPopup visible={visible} onMaskClick={onClose}>
            <div
                style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    width: '300px',
                }}
            >
                <div
                    style={{
                        marginBottom: '24px',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '18px',
                    }}
                >
                    安全验证
                </div>

                {/* Slide Captcha */}
                <SliderCaptcha key={captchaKey} onSuccess={onSuccess} />
                
                {/* close button */}
                <div
                    style={{
                        marginTop: '20px',
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '14px',
                        cursor: 'pointer',
                    }}
                    onClick={onClose}
                >
                    关闭
                </div>
            </div>
        </CenterPopup>
    );
}
