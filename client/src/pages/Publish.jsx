import { NavBar, Button } from 'antd-mobile';
import ImageUpload from '../components/Post/ImageUpload';
import Tiptap from '../components/Post/Tiptap';
import usePublishLogic from '../hooks/usePublishLogic';
import '../App.css';
import '../styles/pages/Publish.css';

export default function Publish() {
    const {
        content,
        setContent,
        fileList,
        setFileList,
        tags,
        setTags,
        isSubmitting,
        statusText,
        isEditMode,
        handleClear,
        handleSubmit,
    } = usePublishLogic();

    return (
        <div className="publish-container">
            <div className="publish-navbar-wrapper">
                <NavBar
                    back={null}
                    left={
                        <div className="publish-navbar-left">
                            <span className="publish-clear-btn" onClick={handleClear}>
                                {isEditMode ? '重置' : '清空'}
                            </span>
                            <span className="publish-status-text">| {statusText}</span>
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

            <div className="centerStyle publish-content-area">
                <div className="publish-inner-content">
                    <div className="publish-editor-wrapper">
                        <Tiptap value={content} onChange={(html) => setContent(html)} />
                        {/* Tags Display */}
                        {tags.length > 0 && (
                            <div className="publish-tags-wrapper">
                                {tags.map((tag, index) => (
                                    <span key={index} className="publish-tag-item">
                                        #{tag}
                                        <span
                                            className="publish-tag-close"
                                            onClick={() =>
                                                setTags((prev) => prev.filter((t) => t !== tag))
                                            }
                                        >
                                            ×
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <ImageUpload fileList={fileList} setFileList={setFileList} maxCount={9} />
                </div>
            </div>
        </div>
    );
}
