import { CenterPopup } from 'antd-mobile';
import SliderCaptcha from './SliderCaptcha';
import '../../styles/components/CaptchaModal.css';

export default function CaptchaModal({ visible, onClose, onSuccess, captchaKey }) {
    return (
        <CenterPopup visible={visible} onMaskClick={onClose} className="captcha-modal-popup">
            <div className="captcha-modal-content">
                <div className="captcha-modal-title">安全验证</div>

                {/* Slide Captcha */}
                <SliderCaptcha key={captchaKey} onSuccess={onSuccess} />
                {/* close button */}
                <div className="captcha-modal-close" onClick={onClose}>
                    关闭
                </div>
            </div>
        </CenterPopup>
    );
}
