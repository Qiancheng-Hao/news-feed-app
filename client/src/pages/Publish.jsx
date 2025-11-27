import { NavBar, Button } from 'antd-mobile';
import ImageUpload from '../components/Post/ImageUpload';
import Tiptap from '../components/Post/Tiptap';
import usePublishLogic from '../hooks/usePublishLogic';
import '../App.css';

export default function Publish() {
    const {
        content,
        setContent,
        fileList,
        setFileList,
        isSubmitting,
        statusText,
        isEditMode,
        handleClear,
        handleSubmit,
    } = usePublishLogic();

    return (
        <div
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: '#f5f5f5',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    flexShrink: 0,
                    background: '#fff',
                    borderBottom: '1px solid #eee',
                    position: 'sticky',
                }}
            >
                <NavBar
                    back={null}
                    left={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                style={{ fontSize: '14px', color: '#1677ff', cursor: 'pointer' }}
                                onClick={handleClear}
                            >
                                {isEditMode ? '重置' : '清空'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#999' }}>| {statusText}</span>
                        </div>
                    }
                    right={
                        <Button
                            color="primary"
                            size="small"
                            onClick={handleSubmit}
                            loading={isSubmitting}
                        >
                            {isEditMode ? '更新' : '发布'}
                        </Button>
                    }
                >
                    {isEditMode ? '编辑动态' : '发布动态'}
                </NavBar>
            </div>

            <div
                className="centerStyle"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    position: 'relative',
                    WebkitOverflowScrolling: 'touch',
                    background: '#fff',
                }}
            >
                <div style={{ padding: '16px', flex: 1 }}>
                    <div style={{ marginBottom: '20px', flex: 1 }}>
                        <Tiptap value={content} onChange={(html) => setContent(html)} />
                    </div>
                    <ImageUpload fileList={fileList} setFileList={setFileList} maxCount={9} />
                </div>
            </div>
        </div>
    );
}
