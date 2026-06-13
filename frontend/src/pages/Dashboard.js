import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../services/recordingService';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import RecordingCard from '../components/RecordingCard';

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Dashboard = () => {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getStats();
        setStats(response.data);
      } catch (error) {
        addToast(error.response?.data?.message || 'Failed to load dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [addToast]);

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="large" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Overview of your consultation recordings</p>
        </div>
        <Link to="/recordings/new" className="btn btn-primary">
          + Upload Recording
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalRecordings || 0}</span>
            <span className="stat-label">Total Recordings</span>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">📤</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.uploadsThisMonth || 0}</span>
            <span className="stat-label">Uploads This Month</span>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">🏷</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.categoryStats?.length || 0}</span>
            <span className="stat-label">Active Categories</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Uploads</h2>
            <Link to="/recordings" className="link-muted">
              View all
            </Link>
          </div>

          {stats?.recentUploads?.length > 0 ? (
            <div className="recent-list">
              {stats.recentUploads.map((recording) => (
                <Link key={recording._id} to={`/recordings/${recording._id}`} className="recent-item">
                  <div className="recent-item-info">
                    <strong>{recording.title}</strong>
                    <span>{recording.clientName}</span>
                  </div>
                  <div className="recent-item-meta">
                    <span className="category-badge">{recording.category}</span>
                    <span className="recent-date">{formatDate(recording.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recordings yet. Upload your first consultation recording.</p>
              <Link to="/recordings/new" className="btn btn-primary">
                Upload Recording
              </Link>
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Category Breakdown</h2>
          </div>

          {stats?.categoryStats?.length > 0 ? (
            <div className="category-list">
              {stats.categoryStats.map((item) => (
                <div key={item.category} className="category-item">
                  <span className="category-name">{item.category}</span>
                  <div className="category-bar-wrapper">
                    <div
                      className="category-bar"
                      style={{
                        width: `${Math.max(
                          (item.count / stats.totalRecordings) * 100,
                          5
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="category-count">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state small">
              <p>Category statistics will appear after you upload recordings.</p>
            </div>
          )}
        </section>
      </div>

      {stats?.recentUploads?.length > 0 && (
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Quick Preview</h2>
          </div>
          <div className="recordings-grid">
            {stats.recentUploads.slice(0, 3).map((recording) => (
              <RecordingCard key={recording._id} recording={recording} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
