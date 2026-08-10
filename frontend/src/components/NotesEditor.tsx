import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface NoteEditorProps {
  content: string
  onChange: (content: string) => void
}

const NoteEditor = ({ content, onChange }: NoteEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div>
      <div className="flex gap-2 mb-3 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`text-sm px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-[#1D2939] text-white' : 'text-gray-600'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`text-sm px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-[#1D2939] text-white' : 'text-gray-600'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`text-sm px-2 py-1 rounded ${editor.isActive('bulletList') ? 'bg-[#1D2939] text-white' : 'text-gray-600'}`}
        >
          List
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