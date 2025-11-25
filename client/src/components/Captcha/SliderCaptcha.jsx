import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SliderCaptcha.css';

export default function SliderCaptcha({ onSuccess, onFail }) {
    const [isMoving, setIsMoving] = useState(false);
    const [x, setX] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const sliderRef = useRef(null);  // slider ref
    const bgRef = useRef(null);     // background ref

    const handleMouseDown = () => {
        if (isSuccess) return;
        setIsMoving(true);
    };

    // useCallback to memoize the function
    const handleMouseMove = useCallback(
        (e) => {
            if (!isMoving || isSuccess) return;

            const bgWidth = bgRef.current.clientWidth;          // background width 
            const sliderWidth = sliderRef.current.clientWidth;  // slider width
            const maxMove = bgWidth - sliderWidth;              // max move distance

            let moveX = e.clientX || e.touches[0].clientX;
            const rect = bgRef.current.getBoundingClientRect();  // background bounding rect
            let offset = moveX - rect.left - sliderWidth / 2;

            if (offset < 0) offset = 0;
            if (offset > maxMove) offset = maxMove;

            setX(offset);

            if (offset >= maxMove - 2) {
                setIsSuccess(true);
                setIsMoving(false);
                if (onSuccess) onSuccess();
            }
        },
        [isMoving, isSuccess, onSuccess]
    );

    const handleMouseUp = useCallback(() => {
        if (!isSuccess) {
            setIsMoving(false);
            setX(0);
            if (onFail) onFail();
        }
    }, [isSuccess, onFail]);

    // attach and detach event listeners
    useEffect(() => {
        if (isMoving) {
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchend', handleMouseUp);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchmove', handleMouseMove);
        }
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchend', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleMouseMove);
        };
    }, [isMoving, handleMouseUp, handleMouseMove]);

    return (
        <div className="slider-captcha-container" ref={bgRef}>
            <div className="slider-bg" style={{ width: x }}>
                {isSuccess && <span className="success-text">验证通过</span>}
            </div>
            <div className="slider-text">{!isSuccess && '向右滑动验证'}</div>
            <div
                className={`slider-btn ${isSuccess ? 'success' : ''}`}
                style={{ left: x }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                ref={sliderRef}
            >
                {isSuccess ? '✔' : '>>'}
            </div>
        </div>
    );
}
