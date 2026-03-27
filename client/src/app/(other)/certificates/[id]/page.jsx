import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import logoDark from '@/assets/images/USAAC certificate-03-03.png'

// const BASE_URL = 'http://localhost:5020/api/v1'
const BASE_URL = 'https://api.usaac.us/api/v1/'

const CertificatePublicPage = () => {
  const { id } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await fetch(`${BASE_URL}/certs/${id}`)
        if (!res.ok) throw new Error('Certificate not found')
        const data = await res.json()
        setCert(data.cert)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCert()
  }, [id])

  const handleDownload = (url, filename) => {
    // Navigate to the backend download route which forces "Content-Disposition: attachment"
    window.location.href = `${BASE_URL}/certs/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <img src={logoDark} alt="Edvisors" style={styles.logo} />
        <div style={styles.verifiedBadge}>
          <span style={styles.checkmark}>✓</span>
          <span>Verified Certificate</span>
        </div>
      </header>

      {/* Card */}
      <main style={styles.main}>
        {loading && (
          <div style={styles.card}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Loading certificate…</p>
          </div>
        )}

        {error && !loading && (
          <div style={styles.card}>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.errorTitle}>Certificate Not Found</h2>
            <p style={styles.errorSub}>This certificate does not exist or has been removed.</p>
            <p style={{ ...styles.errorSub, fontSize: 13, opacity: 0.6 }}>ID: {id}</p>
          </div>
        )}

        {cert && !loading && (
          <div style={styles.card}>
            {/* Download buttons — QR-first when available */}
            <div style={styles.actions}>
              {cert.qrImageUrl && (
                <button type="button" style={styles.btnQrPrimary} onClick={() => handleDownload(cert.qrImageUrl, `certificate-qr-${cert._id}.png`)}>
                  ↓ Download with QR Code
                </button>
              )}
              <button
                type="button"
                style={cert.qrImageUrl ? styles.btnSecondary : styles.btnPrimary}
                onClick={() => handleDownload(cert.thumbnailUrl, `certificate-original-${cert._id}.png`)}>
                ↓ Download Certificate
              </button>
            </div>

            {/* Certificate image */}
            <div style={styles.imageWrapper}>
              <img src={cert.qrImageUrl || cert.thumbnailUrl} alt="Certificate" style={styles.certImage} />
            </div>

            {/* Description */}
            {cert.description && <div style={styles.description} dangerouslySetInnerHTML={{ __html: cert.description }} />}

            {/* Meta info */}
            <div style={styles.meta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Certificate ID</span>
                <span style={styles.metaValue}>{cert._id}</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Usaac All rights reserved.</p>
        <a href="https://usaac.us" style={styles.footerLink}>
          usaac.us
        </a>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 60%, #eef3ff 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    background: '#fff',
    borderBottom: '1px solid #e8edf5',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: 12,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  logo: {
    height: 32,
    objectFit: 'contain',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#374151',
    borderLeft: '1px solid #e0e7ef',
    paddingLeft: 12,
    marginLeft: 2,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    boxSizing: 'border-box',
    padding: '16px 16px 32px',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '22px 24px 26px',
    maxWidth: 640,
    width: '100%',
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
    animation: 'fadeUp 0.4s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  verifiedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'linear-gradient(90deg, #10b981, #059669)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: 100,
    boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 700,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #e8edf5',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  certImage: {
    width: '100%',
    display: 'block',
    objectFit: 'contain',
  },
  description: {
    width: '100%',
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 1.7,
    padding: '0 4px',
  },
  meta: {
    width: '100%',
    background: '#f8fafc',
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    border: '1px solid #e8edf5',
  },
  metaItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  metaValue: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
    textAlign: 'right',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
    width: '100%',
    maxWidth: 400,
  },
  btnQrPrimary: {
    width: '100%',
    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 45%, #818cf8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '14px 20px',
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.02em',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(67, 56, 202, 0.45), 0 2px 8px rgba(79, 70, 229, 0.25)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  btnPrimary: {
    width: '100%',
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
    transition: 'opacity 0.2s',
  },
  btnSecondary: {
    width: '100%',
    background: '#fff',
    color: '#4f46e5',
    border: '1.5px solid #c7d2fe',
    borderRadius: 10,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e8edf5',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 15,
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#fef2f2',
    color: '#ef4444',
    fontSize: 24,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #fecaca',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#111827',
  },
  errorSub: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  footer: {
    background: '#fff',
    borderTop: '1px solid #e8edf5',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    color: '#9ca3af',
  },
  footerLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: 500,
  },
}

export default CertificatePublicPage
