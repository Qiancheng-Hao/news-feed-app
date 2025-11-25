import { useEffect } from 'react';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from '@arco-design/web-react';
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
} from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import { Extension } from '@tiptap/core';
import './TipTap.css';

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
    TabKeyExtension,
];

function MenuBar({ editor }) {
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
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: editorState.isBlockquote,
            icon: <IconQuote />,
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
        // { label: 'Hard break', action: () => editor.chain().focus().setHardBreak().run() },
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
    ];

    return (
        <div className="button-group" aria-label="Formatting toolbar" role="toolbar">
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
            console.log('Content updated:', editor.getHTML());
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
