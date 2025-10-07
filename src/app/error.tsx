"use client"

import React, { useCallback, useState } from 'react'

// Next.js App Router error boundary expects a default export named anything, but we keep 'Error' for clarity.
export default function Error({ error, reset }: { error: (Error & { digest?: string }); reset: () => void }) {
  // Structured console logging for easier filtering
  const timestamp = new Date().toISOString()
  try {
    // Simple logging to avoid console group issues
    // eslint-disable-next-line no-console
    console.error(`GlobalError ${error?.name || 'Error'} @ ${timestamp}`)
    console.error('Message:', error?.message)
    if (error?.digest) console.error('Digest:', error.digest)
    console.error('Stack:', error?.stack)
    if ((error as any)?.cause) console.error('Cause:', (error as any).cause)
    if (typeof window !== 'undefined') {
      console.error('URL:', window.location.href)
      console.error('UserAgent:', window.navigator.userAgent)
    }
  } catch {/* ignore logging errors */}

  const [copied, setCopied] = useState(false)
  const copyDetails = useCallback(() => {
    const details = [
      `Name: ${error?.name}`,
      `Message: ${error?.message}`,
      error?.digest ? `Digest: ${error.digest}` : '',
      `Timestamp: ${timestamp}`,
      typeof window !== 'undefined' ? `URL: ${window.location.href}` : '',
      error?.stack ? `Stack:\n${error.stack}` : ''
    ].filter(Boolean).join('\n')
    try {
      navigator.clipboard.writeText(details)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {/* ignore */}
  }, [error, timestamp])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow border border-slate-200">
        <h1 className="text-xl font-bold mb-2 text-slate-900">Se ha producido un error</h1>
        <p className="text-sm text-slate-600 mb-4 break-words">
          {error?.message || 'Error desconocido'}
        </p>
        <div className="mb-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-slate-700 select-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              Detalles técnicos
            </summary>
            <div className="mt-2 p-3 bg-slate-100 rounded text-xs font-mono text-slate-800 space-y-1 max-h-72 overflow-auto">
              <div><strong>Name:</strong> {error?.name}</div>
              {error?.digest && <div><strong>Digest:</strong> {error.digest}</div>}
              <div><strong>Timestamp:</strong> {timestamp}</div>
              <div>
                <strong>Stack:</strong>
                <pre className="mt-1 whitespace-pre-wrap leading-relaxed">{error?.stack}</pre>
              </div>
              {(error as any)?.cause && <div><strong>Cause:</strong> {String((error as any).cause)}</div>}
            </div>
          </details>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 rounded-md bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Recargar
          </button>
          <button
            onClick={copyDetails}
            className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {copied ? 'Copiado' : 'Copiar detalles'}
          </button>
        </div>
      </div>
    </div>
  )
}
