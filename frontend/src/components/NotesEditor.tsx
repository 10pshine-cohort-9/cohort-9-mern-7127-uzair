import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'

interface NoteEditorProps {
  content: string
  onChange: (content: string) => void
}

const NoteEditor = ({ content, onChange }: NoteEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const toolbarBtn = (isActive: boolean) =>
    `text-sm px-2 py-1 rounded ${isActive ? 'bg-[#1D2939] text-white' : 'text-gray-600'}`

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={toolbarBtn(editor.isActive('heading', { level: 1 }))}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarBtn(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive('bold'))}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive('italic'))}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarBtn(editor.isActive('underline'))}
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarBtn(editor.isActive('strike'))}
        >
          Strike
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtn(editor.isActive('bulletList'))}
        >
          List
        </button>

        <div className="w-px bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="text-sm px-2 py-1 rounded text-gray-600 disabled:opacity-30"
          disabled={!editor.can().undo()}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="text-sm px-2 py-1 rounded text-gray-600 disabled:opacity-30"
          disabled={!editor.can().redo()}
        >
          Redo
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="text-base text-gray-700 leading-relaxed min-h-[200px] focus:outline-none"
      />
    </div>
  )
}

export default NoteEditor;