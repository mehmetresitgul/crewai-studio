'use client'

import { useRef, useState } from 'react'

interface PdfUploaderProps {
  onExtracted: (text: string, filename: string) => void
}

const BACKEND = 'http://localhost:8000'

export function PdfUploader({ onExtracted }: PdfUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<{ name: string; chars: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Sadece PDF dosyası yüklenebilir.')
      return
    }

    setLoading(true)
    setError(null)
    setUploaded(null)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch(`${BACKEND}/api/extract-pdf`, { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) throw new Error(data.detail ?? 'Bilinmeyen hata')

      setUploaded({ name: file.name, chars: data.char_count })
      onExtracted(data.text, file.name)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'PDF yüklenemedi.')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  const borderColor = dragging ? 'var(--accent)' : uploaded ? 'var(--green)' : error ? 'var(--red)' : 'var(--border)'
  const bgColor     = dragging ? 'var(--accent-glow)' : 'var(--surface)'

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
        PDF Yükle
      </label>

      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${borderColor}`,
          borderRadius: '10px',
          background: bgColor,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={onInputChange} />

        {loading ? (
          <p style={{ color: 'var(--accent)', fontSize: '13px' }}>PDF okunuyor...</p>
        ) : uploaded ? (
          <div>
            <p style={{ color: 'var(--green)', fontSize: '13px', fontWeight: 600 }}>✓ {uploaded.name}</p>
            <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>
              {(uploaded.chars / 1000).toFixed(1)}k karakter çıkarıldı — Görev tanımına eklendi
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '6px' }}>Başka bir dosya için tıkla</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '24px', marginBottom: '6px' }}>📄</p>
            <p style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 600 }}>PDF sürükle veya tıkla</p>
            <p style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px' }}>Maks 20 MB</p>
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>{error}</p>
      )}
    </div>
  )
}
