import { useEffect } from 'react';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { EditorContent, useEditor, useEditorState, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import { common, createLowlight } from 'lowlight';
import { Button } from '@arco-design/web-react';
import { Toast } from 'antd-mobile';
import useUpload from '../../hooks/useUpload';
import TiptapImage from './TiptapImage';
import { getThumbnailUrl } from '../../utils/image';
import {
    IconH1,
    IconH2,
    IconH3,
    IconH4,
    IconH5,
    IconH6,
    IconBold,
    IconItalic,
    IconStrikethrough,
    IconCode,
    IconCodeSquare,
    IconQuote,
    IconOrderedList,
    IconUnorderedList,
    IconUndo,
    IconRedo,
    IconUnderline,
    IconImage,
} from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import { Extension } from '@tiptap/core';
import { liftTarget } from '@tiptap/pm/transform';
import { findWrapping } from '@tiptap/pm/transform';
import '../../styles/components/TipTap.css';

// Initialize lowlight with common languages (js, css, html, python, etc.)
const lowlight = createLowlight(common);

// Custom extension to handle the Tab key
const TabKeyExtension = Extension.create({
    name: 'tabKey',
    addKeyboardShortcuts() {
        return {
            Tab: () => {
                return this.editor.commands.insertContent('    ');
            },
        };
    },
});

// Custom Image Extension with Node View and uploadProgress attribute
const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            uploadProgress: {
                default: null,
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(TiptapImage);
    },
});

const extensions = [
    TextStyleKit,
    // Disable the default CodeBlock so we don't have duplicates
    StarterKit.configure({
        codeBlock: false,
    }),
    Underline,
    Placeholder.configure({
        placeholder: '写点什么...',
    }),
    // Add the new Lowlight extension
    CodeBlockLowlight.configure({
        lowlight,
    }),
    CustomImage,
    TabKeyExtension,
];

const toggleBlockquoteCommand = (editor) => {
    // 判断是否在引用块里
    const isBlockquote = editor.isActive('blockquote');

    if (!isBlockquote) {
        // 如果不在引用块，直接加上
        return editor
            .chain()
            .focus()
            .command(({ state, tr, dispatch }) => {
                const { $from, $to } = state.selection;
                const blockquoteType = state.schema.nodes.blockquote;

                // findWrappingUntil 算法
                let $pos = $from;
                let range;
                let wrap;

                // 死循环向上查找，直到找到能包的位置，或者到顶为止
                while (true) {
                    // 获取当前层级的范围
                    range = $pos.blockRange($to);
                    if (!range) break;

                    wrap = findWrapping(range, blockquoteType);

                    // 能包括
                    if (wrap) {
                        break;
                    }

                    if (range.depth > 0) {
                        $pos = state.doc.resolve(range.start - 1);
                    } else {
                        break;
                    }
                }

                // --- 执行包裹 ---
                if (wrap && range) {
                    if (dispatch) {
                        tr.wrap(range, wrap);
                    }
                    return true;
                }

                return false;
            })
            .run();
    }

    // 如果在引用块里，检查是否在列表里
    if (editor.isActive('bulletList') || editor.isActive('orderedList')) {
        // --- 核心修复逻辑 ---
        return editor
            .chain()
            .focus()
            .command(({ state, tr, dispatch }) => {
                const { $from, $to } = state.selection;

                // 获取 blockquote 的节点类型
                const blockquoteType = state.schema.nodes.blockquote;

                // 寻找包裹当前选区的 blockquote 范围
                const range = $from.blockRange($to, (node) => node.type === blockquoteType);

                if (range) {
                    //  计算提升的目标深度
                    const target = liftTarget(range);

                    // 检查是否是数字
                    if (typeof target === 'number') {
                        if (dispatch) {
                            tr.lift(range, target);
                        }
                        return true;
                    }
                }
                return false;
            })
            .run();
    }

    // 普通情况（不在列表里），直接移除
    return editor.chain().focus().unsetBlockquote().run();
};

// convert File to Base64 data URL
const fileToDataURL = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        reader.readAsDataURL(file);
    });
};

function MenuBar({ editor }) {
    const fileInputId = 'tiptap-image-upload-input';
    const { uploadImage } = useUpload();

    // Read the current editor's state, and re-render the component when it changes
    const editorState = useEditorState({
        editor,
        selector: (ctx) => {
            return {
                isBold: ctx.editor.isActive('bold') ?? false,
                canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
                isItalic: ctx.editor.isActive('italic') ?? false,
                canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
                isUnderline: ctx.editor.isActive('underline') ?? false,
                canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
                isStrike: ctx.editor.isActive('strike') ?? false,
                canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
                isCode: ctx.editor.isActive('code') ?? false,
                canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
                canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,
                isParagraph: ctx.editor.isActive('paragraph') ?? false,
                isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
                isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
                isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
                isHeading4: ctx.editor.isActive('heading', { level: 4 }) ?? false,
                isHeading5: ctx.editor.isActive('heading', { level: 5 }) ?? false,
                isHeading6: ctx.editor.isActive('heading', { level: 6 }) ?? false,
                isBulletList: ctx.editor.isActive('bulletList') ?? false,
                isOrderedList: ctx.editor.isActive('orderedList') ?? false,
                isCodeBlock: ctx.editor.isActive('codeBlock') ?? false,
                isBlockquote: ctx.editor.isActive('blockquote') ?? false,
                canUndo: ctx.editor.can().chain().undo().run() ?? false,
                canRedo: ctx.editor.can().chain().redo().run() ?? false,
            };
        },
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Clear input so same file can be selected again
        e.target.value = '';

        if (file.size > 20 * 1024 * 1024) {
            Toast.show('图片过大');
            return;
        }

        // Show local preview immediately with progress 0
        const base64Url = await fileToDataURL(file);
        if (editor) {
            editor.chain().focus().setImage({ src: base64Url, uploadProgress: 0 }).run();
        }

        try {
            const publicUrl = await uploadImage(file, {
                onProgress: (percent) => {
                    // Update the specific image node's progress
                    editor.state.doc.descendants((node, pos) => {
                        if (node.type.name === 'image' && node.attrs.src === base64Url) {
                            const transaction = editor.state.tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                uploadProgress: percent,
                            });
                            editor.view.dispatch(transaction);
                            return false; // Stop traversal
                        }
                        return true;
                    });
                },
            });

            // Replace local preview with server URL and remove progress
            if (editor && publicUrl) {
                const optimizedUrl = getThumbnailUrl(publicUrl, 800);

                // Find the image node with the base64 src and update it
                editor.state.doc.descendants((node, pos) => {
                    if (node.type.name === 'image' && node.attrs.src === base64Url) {
                        const transaction = editor.state.tr.setNodeMarkup(pos, undefined, {
                            ...node.attrs,
                            src: optimizedUrl,
                            uploadProgress: null, // Remove progress bar
                        });
                        editor.view.dispatch(transaction);
                        return false; // Stop traversal
                    }
                    return true;
                });

                Toast.show({ icon: 'success', content: '上传成功' });
            }
        } catch (error) {
            console.error(error);
            Toast.show({ icon: 'fail', content: '上传失败' });
        }
    };

    // Button configuration array
    const buttons = [
        {
            label: 'Bold',
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: editorState.isBold,
            disabled: !editorState.canBold,
            icon: <IconBold />,
        },
        {
            label: 'Italic',
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: editorState.isItalic,
            disabled: !editorState.canItalic,
            icon: <IconItalic />,
        },
        {
            label: 'Underline',
            action: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editorState.isUnderline,
            disabled: !editorState.canUnderline,
            icon: <IconUnderline />,
        },
        {
            label: 'Strike',
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: editorState.isStrike,
            disabled: !editorState.canStrike,
            icon: <IconStrikethrough />,
        },
        {
            label: 'H1',
            action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editorState.isHeading1,
            icon: <IconH1 />,
        },
        {
            label: 'H2',
            action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editorState.isHeading2,
            icon: <IconH2 />,
        },
        {
            label: 'H3',
            action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: editorState.isHeading3,
            icon: <IconH3 />,
        },

        {
            label: 'Bullet list',
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: editorState.isBulletList,
            icon: <IconUnorderedList />,
        },
        {
            label: 'Ordered list',
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: editorState.isOrderedList,
            icon: <IconOrderedList />,
        },
        {
            label: 'Blockquote',
            action: () => toggleBlockquoteCommand(editor),
            isActive: editorState.isBlockquote,
            // disabled: editorState.isBulletList || editorState.isOrderedList,
            icon: <IconQuote />,
        },
        {
            label: 'Image',
            action: () => document.getElementById('tiptap-image-upload-input')?.click(),
            isActive: false,
            icon: <IconImage />,
        },
        {
            label: 'Horizontal rule',
            action: () => editor.chain().focus().setHorizontalRule().run(),
            icon: (
                <svg width="20" height="20" viewBox="0 0 48 48" fill="currentColor">
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.006 6h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1V7a1 1 0 011-1zm0 32h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2a1 1 0 011-1zm18 0h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2a1 1 0 011-1zm24 0h-6a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1v-2a1 1 0 00-1-1zm-18-32h-6a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 00-1-1zm12 0h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1V7a1 1 0 011-1zM45 22H3a1 1 0 00-1 1v2a1 1 0 001 1h42a1 1 0 001-1v-2a1 1 0 00-1-1z"
                        fill="currentColor"
                    />
                </svg>
            ),
        },
        {
            label: 'Code',
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: editorState.isCode,
            disabled: !editorState.canCode,
            icon: <IconCode />,
        },
        {
            label: 'Code block',
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: editorState.isCodeBlock,
            icon: <IconCodeSquare />,
        },
        {
            label: 'Undo',
            action: () => editor.chain().focus().undo().run(),
            disabled: !editorState.canUndo,
            icon: <IconUndo />,
        },
        {
            label: 'Redo',
            action: () => editor.chain().focus().redo().run(),
            disabled: !editorState.canRedo,
            icon: <IconRedo />,
        },
        // {
        //     label: 'H4',
        //     action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
        //     isActive: editorState.isHeading4,
        //     icon: <IconH4 />,
        // },
        // {
        //     label: 'H5',
        //     action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(),
        //     isActive: editorState.isHeading5,
        //     icon: <IconH5 />,
        // },
        // {
        //     label: 'H6',
        //     action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(),
        //     isActive: editorState.isHeading6,
        //     icon: <IconH6 />,
        // },

        // { label: 'Clear marks', action: () => editor.chain().focus().unsetAllMarks().run() },
        // { label: 'Clear nodes', action: () => editor.chain().focus().clearNodes().run() },
        // {
        //     label: 'Paragraph',
        //     action: () => editor.chain().focus().setParagraph().run(),
        //     isActive: editorState.isParagraph,
        // },
        // { label: 'Hard break', action: () => editor.chain().focus().setHardBreak().run() },
    ];

    return (
        <div className="button-group" aria-label="Formatting toolbar" role="toolbar">
            <input
                type="file"
                accept="image/*"
                id={fileInputId}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
            />

            {buttons.map((btn, index) => (
                <Button
                    style={{
                        padding: '0',
                        margin: '0 2px',
                        top: btn.label == 'Horizontal rule' ? '2px' : '',
                    }}
                    className={`tool-button${btn.isActive ? ' is-active' : ''}`}
                    key={index}
                    type={btn.isActive ? 'primary' : 'text'}
                    shape="round"
                    onClick={btn.action}
                    disabled={btn.disabled}
                    title={btn.label}
                >
                    {btn.icon || btn.label}
                </Button>
            ))}
        </div>
    );
}
const Tiptap = ({ value = '', onChange = () => {} }) => {
    const editor = useEditor({
        extensions,
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'tiptap',
            },
        },
    });

    // Sync external value changes to editor content
    useEffect(() => {
        if (!editor || editor.getHTML() === value) return;
        editor.commands.setContent(value);
    }, [editor, value]);

    if (!editor) return null;

    return (
        <div className="text-editor">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default Tiptap;
