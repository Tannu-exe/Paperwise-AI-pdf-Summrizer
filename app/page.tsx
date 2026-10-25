'use client';

import { ChangeEvent, DragEvent, useRef, useState } from 'react';

type Result = { summary: string; title?: string; pages?: number; name?: string };

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  function accept(candidate?: File) {
    setError(''); setResult(null);
    if (!candidate) return;
    if (candidate.type !== 'application/pdf' && !candidate.name.toLowerCase().endsWith('.pdf')) {
      setFile(null); setError('Please choose a PDF file.'); return;
    }
    if (candidate.size > 20 * 1024 * 1024) {
      setFile(null); setError('This file is larger than 20 MB. Try a smaller PDF.'); return;
    }
    setFile(candidate);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) { accept(e.target.files?.[0]); }
  function onDrop(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files?.[0]); }

  async function summarize() {
    if (!file) return;
    setBusy(true); setError(''); setResult(null);
    try {
      const body = new FormData(); body.append('file', file);
      const response = await fetch('/api/summarize', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not summarize this PDF.');
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  async function copySummary() {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
  }

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Paperwise home"><span className="brand-mark"><span /><span /><span /></span><span>paperwise</span></a>
      <div className="top-note"><span className="sparkle">✳</span> A little clarity, powered by AI</div>
    </header>

    <section className="hero">
      <div className="eyebrow"><span className="eyebrow-dot" /> YOUR READING COMPANION</div>
      <h1>Big documents.<br /><em>Small summaries.</em></h1>
      <p className="subtitle">Drop in a PDF and get to the good part.<br className="desktop-break" /> Clear, thoughtful summaries in seconds.</p>
    </section>

    <section className="workspace" aria-label="PDF summarizer">
      <div className={`upload-card ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        {!file ? <>
          <input ref={inputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={onChange} />
          <div className="upload-icon"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 31V10m0 0-8 8m8-8 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 27v8a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></div>
          <h2>Bring your PDF along</h2>
          <p>Drag it in, or <button className="text-button" onClick={() => inputRef.current?.click()}>browse files</button></p>
          <div className="file-hint"><span className="pdf-chip">PDF</span> Up to 20 MB <span className="hint-divider">·</span> Your file stays yours</div>
        </> : <>
          <div className="file-row"><div className="file-badge">PDF</div><div className="file-info"><strong>{file.name}</strong><span>{(file.size / (1024 * 1024)).toFixed(2)} MB <span className="hint-divider">·</span> Ready to read</span></div><button className="remove-button" onClick={() => { setFile(null); setResult(null); }} aria-label="Remove PDF">×</button></div>
          <button className="summarize-button" onClick={summarize} disabled={busy}>{busy ? <><span className="spinner" /> Reading your PDF…</> : <>Make my summary <span>↗</span></>}</button>
        </>}
      </div>

      {error && <div className="error-box" role="alert"><span>!</span>{error}</div>}

      {result && <article className="result-card">
        <div className="result-top"><div><div className="result-label"><span className="result-dot" /> YOUR SUMMARY</div><h2>{result.title || 'The short version'}</h2></div><button className="copy-button" onClick={copySummary}>Copy <span>↗</span></button></div>
        <div className="summary-text">{result.summary.split('\n').filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph.replace(/^[-•*]\s*/, '')}</p>)}</div>
        <div className="result-footer"><span>{result.name || file?.name}</span><span>{result.pages ? `${result.pages} pages · ` : ''}Summarized with Gemini</span></div>
      </article>}

      <div className="trust-row"><span className="lock-icon">♧</span> Private by design <span className="tiny-divider" /> Your PDF is processed securely and never stored.</div>
    </section>

    <footer><span>Made for curious minds</span><span className="footer-spark">✳</span><span>Less scrolling, more knowing.</span></footer>
  </main>;
}
