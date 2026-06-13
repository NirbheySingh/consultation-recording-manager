import React from 'react';
import { Link } from 'react-router-dom';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const RecordingCard = ({ recording }) => {
  const isVideo = recording.mimeType?.startsWith('video/');

  return (
    <div className="recording-card">
      <div className="recording-card-header">
        <span className={`media-badge ${isVideo ? 'video' : 'audio'}`}>
          {isVideo ? 'Video' : 'Audio'}
        </span>
        <span className="category-badge">{recording.category}</span>
      </div>

      <h3 className="recording-card-title">{recording.title}</h3>
      <p className="recording-card-client">{recording.clientName}</p>

      <div className="recording-card-meta">
        <span>Consultation: {formatDate(recording.consultationDate)}</span>
        <span>Uploaded: {formatDate(recording.createdAt)}</span>
      </div>

      <Link to={`/recordings/${recording._id}`} className="btn btn-primary btn-block">
        View Details
      </Link>
    </div>
  );
};

export default RecordingCard;
