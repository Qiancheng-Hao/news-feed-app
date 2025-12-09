import { NodeViewWrapper } from '@tiptap/react';
import { ProgressBar } from 'antd-mobile';
import { CloseCircleFill } from 'antd-mobile-icons';
import { useState, useEffect } from 'react';
import '../../styles/components/TipTap.css';

export default function TiptapImage(props) {
    const { node, selected, deleteNode } = props;
    const { src, alt, title, uploadProgress } = node.attrs;

    // Local state to manage the displayed image source for smooth transitions
    const [displaySrc, setDisplaySrc] = useState(src);

    useEffect(() => {
        if (src === displaySrc) return;

        // preload the new image before switching to avoid flicker.
        if (src.startsWith('http') && displaySrc?.startsWith('data:')) {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                setDisplaySrc(src);
            };
            img.onerror = () => {
                setDisplaySrc(src);
            };
        } else {
            // use setTimeout to avoid "setState synchronously within an effect" warning
            const timer = setTimeout(() => {
                setDisplaySrc(src);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [src, displaySrc]);

    return (
        <NodeViewWrapper className="tiptap-image-view">
            {/* Outer wrapper for centering and spacing */}
            <div
                className={`image-outer-wrapper ${selected ? 'is-selected' : ''}`}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '1rem 0',
                    width: '100%',
                }}
            >
                {/* Inner container relative to image size */}
                <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    <img
                        src={displaySrc}
                        alt={alt}
                        title={title}
                        className={selected ? 'ProseMirror-selectednode' : ''}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block',
                            borderRadius: '8px',
                            opacity: uploadProgress !== null ? 0.7 : 1,
                            transition: 'opacity 0.3s',
                            border: selected ? '2px solid #165dff' : '2px solid transparent',
                            boxSizing: 'border-box',
                        }}
                    />

                    {/* Delete Button - Show when selected OR uploading */}
                    {(selected || uploadProgress !== null) && (
                        <div
                            onClick={() => deleteNode()}
                            style={{
                                position: 'absolute',
                                top: '0px',
                                right: '0px',
                                cursor: 'pointer',
                                zIndex: 20,
                                background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                backdropFilter: 'blur(2px)' // Optional: adds a nice blur effect
                            }}
                        >
                            <CloseCircleFill fontSize={20} color="#fff" /> {/* White icon */}
                        </div>
                    )}

                    {/* Progress Bar Overlay */}
                    {uploadProgress !== null && (
                        <div
                            className="upload-progress-overlay"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '60%', // Relative to image width
                                minWidth: '100px',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                padding: '12px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 10,
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: '6px',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    color: '#333',
                                    fontWeight: 500,
                                }}
                            >
                                上传中 {uploadProgress}%
                            </div>
                            <ProgressBar
                                percent={uploadProgress}
                                style={{ height: '6px', borderRadius: '3px' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </NodeViewWrapper>
    );
}
