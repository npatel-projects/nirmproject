import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase, BUCKET } from '../lib/supabase'

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '🖼️'
  if (['pdf'].includes(ext)) return '📄'
  if (['doc', 'docx'].includes(ext)) return '📝'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊'
  if (['zip', 'tar', 'gz'].includes(ext)) return '📦'
  if (['mp4', 'mov', 'avi'].includes(ext)) return '🎬'
  if (['mp3', 'wav'].includes(ext)) return '🎵'
  return '📁'
}

export default function StoragePage() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const inputRef = useRef()

  async function fetchFiles() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      sortBy: { column: 'created_at', order: 'desc' },
    })
    if (error) setError(error.message)
    else setFiles(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [])

  async function uploadFile(file) {
    setUploading(true)
    setUploadProgress(0)
    setError(null)
    setSuccess(null)

    const path = `${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (error) setError(error.message)
    else {
      setSuccess(`"${file.name}" uploaded successfully.`)
      await fetchFiles()
    }
    setUploading(false)
    setUploadProgress(0)
  }

  async function handleFiles(fileList) {
    for (const file of fileList) await uploadFile(file)
  }

  async function deleteFile(name) {
    setDeleting(name)
    setError(null)
    const { error } = await supabase.storage.from(BUCKET).remove([name])
    if (error) setError(error.message)
    else {
      setSuccess(`"${name}" deleted.`)
      await fetchFiles()
    }
    setDeleting(null)
  }

  async function downloadFile(name) {
    const { data, error } = await supabase.storage.from(BUCKET).download(name)
    if (error) { setError(error.message); return }
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = name.replace(/^\d+_/, '')
    a.click()
    URL.revokeObjectURL(url)
  }

  function getPublicUrl(name) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name)
    return data.publicUrl
  }

  function isImage(name) {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">

      {/* Header */}
      <div className="bg-white border-b border-[#f0f2f4] px-4 sm:px-8 md:px-14 py-4 sm:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="size-2 rounded-full bg-green-500" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#9ca7b4]">Supabase Storage</span>
            </div>
            <h1 className="text-[20px] sm:text-[24px] font-bold text-[#1b1c1e]">File Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="px-3 py-1.5 text-xs sm:text-sm border border-[#e8eaed] rounded-lg text-[#9ca7b4] hover:bg-[#f4f6f8] transition-colors">DIT</Link>
            <Link to="/mui" className="px-3 py-1.5 text-xs sm:text-sm border border-[#e8eaed] rounded-lg text-[#9ca7b4] hover:bg-[#f4f6f8] transition-colors">MUI</Link>
            <Link to="/ark" className="px-3 py-1.5 text-xs sm:text-sm border border-[#e8eaed] rounded-lg text-[#9ca7b4] hover:bg-[#f4f6f8] transition-colors">Ark</Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-8 md:px-14 py-6 sm:py-10 flex flex-col gap-6 max-w-4xl">

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <span>⚠️</span>
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <span>✓</span>
            <p>{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}

        {/* Upload Zone */}
        <div
          className={`bg-white rounded-xl border-2 border-dashed transition-colors p-8 sm:p-12 text-center cursor-pointer
            ${dragging ? 'border-[#006296] bg-[#f0f8fd]' : 'border-[#e8eaed] hover:border-[#006296]'}
            ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            handleFiles([...e.dataTransfer.files])
          }}
        >
          <input ref={inputRef} type="file" multiple className="hidden"
            onChange={e => handleFiles([...e.target.files])} />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="size-12 rounded-full border-4 border-[#006296] border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-[#1b1c1e]">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="size-14 rounded-full bg-[#e6f3fa] flex items-center justify-center text-2xl">☁️</div>
              <div>
                <p className="text-sm font-semibold text-[#1b1c1e]">
                  {dragging ? 'Drop to upload' : 'Drag & drop files here'}
                </p>
                <p className="text-xs text-[#9ca7b4] mt-1">or <span className="text-[#006296] underline">click to browse</span></p>
              </div>
            </div>
          )}
        </div>

        {/* File List */}
        <div className="bg-white rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#f0f2f4]">
            <h2 className="text-[15px] font-bold text-[#1b1c1e]">
              Files
              {!loading && <span className="ml-2 text-xs font-normal text-[#9ca7b4]">({files.filter(f => f.name !== '.emptyFolderPlaceholder').length})</span>}
            </h2>
            <button onClick={fetchFiles} className="text-xs text-[#9ca7b4] hover:text-[#1b1c1e] transition-colors px-2 py-1 rounded hover:bg-[#f4f6f8]">
              ↺ Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="size-8 rounded-full border-4 border-[#006296] border-t-transparent animate-spin" />
            </div>
          ) : files.filter(f => f.name !== '.emptyFolderPlaceholder').length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-[#9ca7b4]">
              <span className="text-4xl">📭</span>
              <p className="text-sm font-semibold">No files yet</p>
              <p className="text-xs">Upload something to get started</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#f0f2f4]">
              {files.filter(f => f.name !== '.emptyFolderPlaceholder').map(file => (
                <li key={file.name} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-[#fafafa] transition-colors">

                  {/* Thumbnail or icon */}
                  <div className="size-10 rounded-lg bg-[#f4f6f8] flex items-center justify-center shrink-0 overflow-hidden">
                    {isImage(file.name)
                      ? <img src={getPublicUrl(file.name)} alt={file.name} className="size-full object-cover" />
                      : <span className="text-xl">{fileIcon(file.name)}</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1b1c1e] truncate">
                      {file.name.replace(/^\d+_/, '')}
                    </p>
                    <p className="text-xs text-[#9ca7b4] mt-0.5">
                      {formatBytes(file.metadata?.size)} · {formatDate(file.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => downloadFile(file.name)}
                      className="p-2 rounded-lg text-[#9ca7b4] hover:text-[#006296] hover:bg-[#e6f3fa] transition-colors"
                      title="Download"
                    >
                      ⬇
                    </button>
                    <button
                      onClick={() => deleteFile(file.name)}
                      disabled={deleting === file.name}
                      className="p-2 rounded-lg text-[#9ca7b4] hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      {deleting === file.name ? '…' : '🗑'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
