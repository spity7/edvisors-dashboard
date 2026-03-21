import { useState } from 'react'
import { Link } from 'react-router-dom'
import ReactTable from '@/components/Table'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGlobalContext } from '@/context/useGlobalContext'
import Swal from 'sweetalert2'

// const BASE_URL = 'http://localhost:5020/api/v1'
const BASE_URL = 'https://api.usaac.us/api/v1/'

/* ─── Lightbox Modal ─────────────────────────────────────────── */
const ImagePreviewModal = ({ image, onClose }) => {
  if (!image) return null

  const handleDownload = () => {
    window.location.href = `${BASE_URL}/certs/download?url=${encodeURIComponent(image.url)}&filename=${encodeURIComponent(image.filename)}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.78)',
          zIndex: 1055,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Modal box — stop propagation so clicking inside doesn't close */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: 12,
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #e9ecef',
            }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#495057' }}>{image.label}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-sm btn-soft-primary" title="Download" onClick={handleDownload}>
                <IconifyIcon icon="bx:download" className="fs-18" />
                <span style={{ marginLeft: 4, fontSize: 13 }}>Download</span>
              </button>
              <button type="button" className="btn btn-sm btn-soft-secondary" title="Close" onClick={onClose}>
                <IconifyIcon icon="bx:x" className="fs-18" />
              </button>
            </div>
          </div>

          {/* Image */}
          <div style={{ padding: 16, overflow: 'auto', textAlign: 'center' }}>
            <img src={image.url} alt={image.label} style={{ maxWidth: '80vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: 8 }} />
          </div>
        </div>
      </div>
    </>
  )
}

/* ─── Clickable image thumbnail ──────────────────────────────── */
const ThumbImg = ({ src, alt, badge, badgeColor, onClick }) => (
  <div className="d-flex flex-column align-items-center gap-1" style={{ cursor: src ? 'zoom-in' : 'default' }} onClick={() => src && onClick()}>
    {src ? (
      <img
        src={src}
        alt={alt}
        className="img-fluid rounded"
        style={{
          width: 60,
          height: 60,
          objectFit: 'contain',
          border: '1px solid #dee2e6',
          transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13,110,253,0.35)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      />
    ) : (
      <div
        className="bg-light d-flex align-items-center justify-content-center rounded"
        style={{ width: 60, height: 60, border: '1px solid #dee2e6' }}>
        <IconifyIcon icon={badge === 'QR' ? 'bx:qr' : 'bx:image'} className="text-muted fs-4" />
      </div>
    )}
    <span className={`badge bg-${badgeColor}`} style={{ fontSize: '0.6rem' }}>
      {badge}
    </span>
  </div>
)

/* ─── Main table component ───────────────────────────────────── */
const CertsListTable = ({ certs }) => {
  const { deleteCert } = useGlobalContext()
  const [previewImage, setPreviewImage] = useState(null)

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the cert!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    })

    if (result.isConfirmed) {
      try {
        await deleteCert(id)
        Swal.fire('Deleted!', 'Cert has been deleted.', 'success')
        window.location.reload()
      } catch (error) {
        Swal.fire('Error', error?.response?.data?.message || 'Delete failed', 'error')
      }
    }
  }

  const columns = [
    {
      header: 'Images',
      cell: ({
        row: {
          original: { _id, thumbnailUrl, qrImageUrl, description },
        },
      }) => (
        <div className="d-flex align-items-center gap-3">
          {/* Original thumbnail */}
          <ThumbImg
            src={thumbnailUrl}
            alt={description}
            badge="Original"
            badgeColor="primary"
            onClick={() =>
              setPreviewImage({
                url: thumbnailUrl,
                label: 'Original Certificate Image',
                filename: `cert-original-${_id}.png`,
              })
            }
          />

          {/* QR-stamped image */}
          <ThumbImg
            src={qrImageUrl}
            alt="QR Certificate"
            badge="QR"
            badgeColor="secondary"
            onClick={() =>
              setPreviewImage({
                url: qrImageUrl,
                label: 'QR Certificate Image',
                filename: `cert-qr-${_id}.png`,
              })
            }
          />

          {/* Description */}
          <div className="flex-grow-1">
            <span className="fs-13 text-muted" dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        </div>
      ),
    },
    {
      header: 'Action',
      cell: ({
        row: {
          original: { _id },
        },
      }) => (
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-soft-danger" title="Delete Cert" onClick={() => handleDelete(_id)}>
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </div>
      ),
    },
  ]

  const pageSizeList = [5, 10, 20, 50]
  return (
    <>
      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      <ReactTable
        columns={columns}
        data={certs}
        rowsPerPageList={pageSizeList}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  )
}
export default CertsListTable
