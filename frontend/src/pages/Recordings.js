import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getRecordings, CATEGORIES } from '../services/recordingService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import RecordingCard from '../components/RecordingCard';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Recordings = () => {
  const { addToast } = useToast();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('desc');
  const [viewMode, setViewMode] = useState('cards');

  const fetchRecordings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;

      const response = await getRecordings(params);
      setRecordings(response.data.recordings);
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to load recordings', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, addToast]);

  useEffect(() => {
    const debounce = setTimeout(fetchRecordings, 300);
    return () => clearTimeout(debounce);
  }, [fetchRecordings]);

  return (
    <div className="page recordings-page">
      <div className="page-header">
        <div>
          <h1>Recordings</h1>
          <p className="page-subtitle">Browse, search, and manage all consultation recordings</p>
        </div>
        <Link to="/recordings/new" className="btn btn-primary">
          + Upload Recording
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by client name or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        <div className="view-toggle">
          <button
            type="button"
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
            aria-label="Card view"
          >
            ▦
          </button>
          <button
            type="button"
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
            aria-label="Table view"
          >
            ☰
          </button>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">
          <LoadingSpinner size="large" label="Loading recordings..." />
        </div>
      ) : recordings.length === 0 ? (
        <div className="empty-state">
          <p>No recordings found. Try adjusting your filters or upload a new recording.</p>
          <Link to="/recordings/new" className="btn btn-primary">
            Upload Recording
          </Link>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="recordings-grid">
          {recordings.map((recording) => (
            <RecordingCard key={recording._id} recording={recording} />
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="recordings-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Title</th>
                <th>Category</th>
                <th>Consultation Date</th>
                <th>Upload Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((recording) => (
                <tr key={recording._id}>
                  <td>{recording.clientName}</td>
                  <td>{recording.title}</td>
                  <td>
                    <span className="category-badge">{recording.category}</span>
                  </td>
                  <td>{formatDate(recording.consultationDate)}</td>
                  <td>{formatDate(recording.createdAt)}</td>
                  <td>
                    <Link to={`/recordings/${recording._id}`} className="btn btn-sm btn-outline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Recordings;
