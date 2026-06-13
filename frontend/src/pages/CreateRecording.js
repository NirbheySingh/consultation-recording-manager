import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRecording, CATEGORIES } from '../services/recordingService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.mp4', '.mov'];

const CreateRecording = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    clientName: '',
    title: '',
    consultationDate: '',
    notes: '',
    category: 'General',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.clientName.trim()) newErrors.clientName = 'Client name is required';
    if (!formData.title.trim()) newErrors.title = 'Consultation title is required';
    if (!formData.consultationDate) newErrors.consultationDate = 'Consultation date is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!file) newErrors.file = 'Recording file is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return 'No file selected';

    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return 'Invalid file type. Allowed: mp3, wav, mp4, mov';
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 100MB';
    }

    return null;
  };

  const handleFileSelect = (selectedFile) => {
    const fileError = validateFile(selectedFile);
    if (fileError) {
      addToast(fileError, 'error');
      return;
    }
    setFile(selectedFile);
    if (errors.file) setErrors((prev) => ({ ...prev, file: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setUploading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append('file', file);
    data.append('clientName', formData.clientName.trim());
    data.append('title', formData.title.trim());
    data.append('consultationDate', new Date(formData.consultationDate).toISOString());
    data.append('notes', formData.notes.trim());
    data.append('category', formData.category);

    try {
      const response = await createRecording(data, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      addToast('Recording uploaded successfully!', 'success');
      navigate(`/recordings/${response.data.recording._id}`);
    } catch (error) {
      addToast(error.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="page create-page">
      <div className="page-header">
        <div>
          <h1>Upload Recording</h1>
          <p className="page-subtitle">Add a new consultation recording with metadata</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form" noValidate>
        <div className="form-grid">
          <div className="form-section">
            <h2>Recording File</h2>

            <div
              className={`dropzone ${dragOver ? 'drag-over' : ''} ${errors.file ? 'input-error-border' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.mp4,.mov,audio/*,video/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                hidden
              />
              {file ? (
                <div className="file-preview">
                  <span className="file-icon">🎵</span>
                  <div>
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <span className="dropzone-icon">📁</span>
                  <p>Drag & drop your recording here, or click to browse</p>
                  <span className="dropzone-hint">Supports mp3, wav, mp4, mov (max 100MB)</span>
                </>
              )}
            </div>
            {errors.file && <span className="error-text">{errors.file}</span>}

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="progress-text">{uploadProgress}% uploaded</span>
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Consultation Details</h2>

            <div className="form-group">
              <label htmlFor="clientName">Client Name *</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Enter client name"
                className={errors.clientName ? 'input-error' : ''}
                disabled={uploading}
              />
              {errors.clientName && <span className="error-text">{errors.clientName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="title">Consultation Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter consultation title"
                className={errors.title ? 'input-error' : ''}
                disabled={uploading}
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="consultationDate">Consultation Date *</label>
                <input
                  type="date"
                  id="consultationDate"
                  name="consultationDate"
                  value={formData.consultationDate}
                  onChange={handleChange}
                  className={errors.consultationDate ? 'input-error' : ''}
                  disabled={uploading}
                />
                {errors.consultationDate && (
                  <span className="error-text">{errors.consultationDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'input-error' : ''}
                  disabled={uploading}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the consultation..."
                rows={4}
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/recordings')}
            disabled={uploading}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={uploading}>
            {uploading ? (
              <>
                <LoadingSpinner size="small" /> Uploading...
              </>
            ) : (
              'Upload Recording'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecording;
