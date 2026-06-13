import React from 'react';

const LoadingSpinner = ({ size = 'medium', label = 'Loading...' }) => {
  return (
    <div className={`spinner-wrapper spinner-${size}`} role="status" aria-label={label}>
      <div className="spinner" />
      {size === 'large' && <p className="spinner-label">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
