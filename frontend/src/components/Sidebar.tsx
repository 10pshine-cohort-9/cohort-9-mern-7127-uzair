import { NotebookPen, Trash2, LogOut, User, Upload, Download, X, FileText, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useRef } from 'react'
import { logout } from '../services/authService'
import { getNotes, createNote } from '../services/noteService'

const escapeHtml = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

const plainTextToHtml = (text: string) =>
  text.split('\n').filter(Boolean).map((line) => `<p>${escapeHtml(line)}</p>`).join('')

const htmlToPlainText = (html: string) =>
  html
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

interface ParsedNote {
  title: string
  content: string
}

const parseImportFile = (text: string): ParsedNote[] => {
  const noteRegex = /=== (.+?) ===\n([\s\S]*?)(?=\n=== |$)/g
  const notes: ParsedNote[] = []
  let match
  while ((match = noteRegex.exec(text)) !== null) {
    const title = match[1].trim()
    const content = match[2].trim()
    if (title) notes.push({ title, content })
  }
  return notes
}

type ImportStage = 'preview' | 'importing' | 'done'

const Sidebar = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [exportPreview, setExportPreview] = useState<{ text: string; count: number } | null>(null)

  const [importNotes, setImportNotes] = useState<ParsedNote[] | null>(null)
  const [importStage, setImportStage] = useState<ImportStage>('preview')
  const [importResult, setImportResult] = useState<{ succeeded: number; failed: number } | null>(null)

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed!')
    }
  }

  const handleExportClick = async () => {
    clearMessages()
    setBusy(true)
    try {
      const notes = await getNotes()
      if (notes.length === 0) {
        throw new Error('You have no notes to export yet')
      }
      const text = notes
        .map((note) => `=== ${note.title} ===\n${htmlToPlainText(note.content)}`)
        .join('\n\n')
      setExportPreview({ text, count: notes.length })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export notes!')
    } finally {
      setBusy(false)
    }
  }

  const confirmExport = () => {
    if (!exportPreview) return
    const blob = new Blob([exportPreview.text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `marginal-notes-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setSuccess(`Exported ${exportPreview.count} note${exportPreview.count === 1 ? '' : 's'}`)
    setExportPreview(null)
  }

  const handleImportClick = () => {
    clearMessages()
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('That file is too large (max 5MB)')
      return
    }

    try {
      const text = await file.text()
      const notes = parseImportFile(text)
      if (notes.length === 0) {
        throw new Error('No valid notes found in that file')
      }
      setImportStage('preview')
      setImportResult(null)
      setImportNotes(notes)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to read that file!')
    }
  }

  const confirmImport = async () => {
    if (!importNotes) return
    setImportStage('importing')

    const results = await Promise.allSettled(
      importNotes.map((note) => createNote(note.title, plainTextToHtml(note.content)))
    )
    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.length - succeeded

    setImportResult({ succeeded, failed })
    setImportStage('done')
  }

  const closeImportModal = () => {
    const shouldRefresh = importStage === 'done' && (importResult?.succeeded ?? 0) > 0
    setImportNotes(null)
    setImportResult(null)
    setImportStage('preview')
    if (shouldRefresh) {
      setSuccess(`Imported ${importResult?.succeeded} note${importResult?.succeeded === 1 ? '' : 's'}`)
      navigate('/dashboard')
    }
  }

  return (
    <div className="w-16 md:w-56 bg-[#1D2939] text-white flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-2 mb-8">
        <NotebookPen size={24} />
        <span className="hidden md:inline text-lg font-bold">Notify</span>
      </div>

      <nav className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
        >
          <NotebookPen size={16} />
          <span className="hidden md:inline">Notes</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard?view=trash')}
          className="flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10"
        >
          <Trash2 size={16} />
          <span className="hidden md:inline">Trash</span>
        </button>
      </nav>

      <div className="h-px bg-white/10 my-4 mx-2" />

      <button
        type="button"
        onClick={handleImportClick}
        disabled={busy}
        aria-label="Import notes from file"
        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50"
      >
        <Download size={16} />
        <span className="hidden md:inline">Import notes</span>
      </button>
      <button
        type="button"
        onClick={handleExportClick}
        disabled={busy}
        aria-label="Export notes to file"
        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-white/10 disabled:opacity-50"
      >
        <Upload size={16} />
        <span className="hidden md:inline">{busy ? 'Preparing...' : 'Export notes'}</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        onChange={handleFileSelected}
        aria-label="Choose a notes file to import"
        className="hidden"
      />

      <div className="h-px bg-white/10 my-4 mx-2" />

      <button
        type="button"
        onClick={() => navigate('/profile')}
        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10"
      >
        <User size={16} />
        <span className="hidden md:inline">Profile</span>
      </button>

      {error && <p className="text-xs text-red-400 px-2 mt-2">{error}</p>}
      {success && <p className="text-xs text-emerald-400 px-2 mt-2">{success}</p>}

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-300 hover:bg-white/10"
      >
        <LogOut size={16} />
        <span className="hidden md:inline">Log out</span>
      </button>

      {exportPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white text-[#1D2939] shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Download size={18} className="text-[#1D2939]" />
                <h2 className="text-sm font-semibold">Export notes</h2>
              </div>
              <button
                type="button"
                onClick={() => setExportPreview(null)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-gray-600 mb-3">
                Found <span className="font-semibold text-[#1D2939]">{exportPreview.count}</span> note
                {exportPreview.count === 1 ? '' : 's'} to export.
              </p>
              <p className="text-xs font-medium text-gray-500 mb-1">Preview</p>
              <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                {exportPreview.text.slice(0, 2000)}
                {exportPreview.text.length > 2000 ? '\n…' : ''}
              </pre>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
              <button
                type="button"
                onClick={() => setExportPreview(null)}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmExport}
                className="rounded-md bg-[#1D2939] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1D2939]/90"
              >
                Download file
              </button>
            </div>
          </div>
        </div>
      )}

      {importNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white text-[#1D2939] shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-[#1D2939]" />
                <h2 className="text-sm font-semibold">Import notes</h2>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4">
              {importStage === 'preview' && (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    Found <span className="font-semibold text-[#1D2939]">{importNotes.length}</span> note
                    {importNotes.length === 1 ? '' : 's'} in this file. Review them below, then import.
                  </p>
                  <ul className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200">
                    {importNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 px-3 py-2">
                        <FileText size={14} className="mt-0.5 shrink-0 text-gray-400" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{note.title}</p>
                          <p className="truncate text-xs text-gray-500">
                            {note.content.slice(0, 80) || 'Empty note'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {importStage === 'importing' && (
                <div className="flex items-center gap-2 py-6 text-sm text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#1D2939]" />
                  Importing {importNotes.length} note{importNotes.length === 1 ? '' : 's'}…
                </div>
              )}

              {importStage === 'done' && importResult && (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                  <p className="text-sm font-medium">
                    Imported {importResult.succeeded} of {importNotes.length} note
                    {importNotes.length === 1 ? '' : 's'}
                  </p>
                  {importResult.failed > 0 && (
                    <p className="text-xs text-red-500">
                      {importResult.failed} note{importResult.failed === 1 ? '' : 's'} failed to import
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
              {importStage === 'preview' && (
                <>
                  <button
                    type="button"
                    onClick={closeImportModal}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmImport}
                    className="rounded-md bg-[#1D2939] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1D2939]/90"
                  >
                    Import {importNotes.length} note{importNotes.length === 1 ? '' : 's'}
                  </button>
                </>
              )}
              {importStage === 'done' && (
                <button
                  type="button"
                  onClick={closeImportModal}
                  className="rounded-md bg-[#1D2939] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1D2939]/90"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar