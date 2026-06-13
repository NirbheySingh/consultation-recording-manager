import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecordingById, deleteRecording } from '../services/recordingService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const RecordingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchRecording = async () => {
      try {
        const response = await getRecordingById(id);
        setRecording(response.data.recording);
      } catch (error) {
        addToast(error.response?.data?.message || 'Failed to load recording', 'error');
        navigate('/recordings');
      } finally {
        setLoading(false);
      }
    };

    fetchRecording();
  }, [id, addToast, navigate]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = recording.fileUrl;
    link.download = recording.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Download started', 'success');
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecording(id);
      addToast('Recording deleted successfully', 'success');
      navigate('/recordings');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to delete recording', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="large" label="Loading recording..." />
      </div>
    );
  }

  if (!recording) return null;

  const isVideo = recording.mimeType?.startsWith('video/');

  return (
    <div className="page details-page">
      <div className="page-header">
        <div>
          <Link to="/recordings" className="back-link">
            ← Back to Recordings
          </Link>
          <h1>{recording.title}</h1>
          <p className="page-subtitle">{recording.clientName}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn btn-primary" onClick={handleDownload}>
            ⬇ Download
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="details-grid">
        <section className="media-section">
          <h2>Recording</h2>
          <div className="media-player-wrapper">
            {isVideo ? (
              <video controls className="media-player" src={recording.fileUrl}>
                Your browser does not support video playback.
              </video>
            ) : (
              <audio controls className="media-player audio" src={recording.fileUrl}>
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        </section>

        <section className="metadata-section">
          <h2>Details</h2>
          <dl className="metadata-list">
            <div className="metadata-item">
              <dt>Client Name</dt>
              <dd>{recording.clientName}</dd>
            </div>
            <div className="metadata-item">
              <dt>Consultation Title</dt>
              <dd>{recording.title}</dd>
            </div>
            <div className="metadata-item">
              <dt>Consultation Date</dt>
              <dd>{formatDate(recording.consultationDate)}</dd>
            </div>
            <div className="metadata-item">
              <dt>Category</dt>
              <dd>
                <span className="category-badge">{recording.category}</span>
              </dd>
            </div>
            <div className="metadata-item">
              <dt>Upload Date</dt>
              <dd>{formatDate(recording.createdAt)}</dd>
            </div>
            <div className="metadata-item">
              <dt>File Name</dt>
              <dd className="mono">{recording.fileName}</dd>
            </div>
            <div className="metadata-item">
              <dt>File Size</dt>
              <dd>{formatFileSize(recording.fileSize)}</dd>
            </div>
            <div className="metadata-item">
              <dt>Uploaded By</dt>
              <dd>{recording.uploadedBy?.name || 'Unknown'}</dd>
            </div>
            {recording.notes && (
              <div className="metadata-item full-width">
                <dt>Notes</dt>
                <dd className="notes-text">{recording.notes}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Recording?</h3>
            <p>
              This will permanently delete &quot;{recording.title}&quot; and its file. This action
              cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <LoadingSpinner size="small" /> : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordingDetails;
