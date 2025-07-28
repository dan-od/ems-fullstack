import React, { useState, useEffect } from 'react';
import EquipmentTable from '../Equipment/EquipmentTable';
import UserManagement from '../User/UserManagement';
import './Dashboard.css';

const DashboardHome = ({ userRole }) => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/requests/dashboard/pending', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch pending requests');
        const data = await response.json();
        setPendingRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, []);

  const getStatusBadgeClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'in-progress';
    }
  };

  return (
    <div className="dashboard-home">
      <header className="topbar">
        <h1>DASHBOARD</h1>
      </header>

      <div className="action-row">
        {(userRole === 'admin' || userRole === 'manager') && (
          <div className="action-buttons">
            <button className="action-btn">
              <i className="fas fa-plus"></i> Add Equipment
            </button>
            <button className="action-btn">
              <i className="fas fa-file-alt"></i> View All Logs
            </button>
            <button className="action-btn">
              <i className="fas fa-tools"></i> Equipment Maintenance
            </button>
          </div>
        )}
        <div className="search-container">
          <input 
            className="search-filter" 
            type="text" 
            placeholder="Search & Filter"
            aria-label="Search and filter equipment"
          />
        </div>
      </div>

      <div className="dashboard-content">
        {userRole === 'admin' ? (
          <section className="panel user-management">
            <h2>
              <i className="fas fa-users"></i> User Management
            </h2>
            <UserManagement />
          </section>
        ) : (
          <section className="panel recent-requests">
            <h2>
              <i className="fas fa-clipboard-list"></i> Recent Requests
            </h2>
            {loading ? (
              <div className="loading-indicator">
                <i className="fas fa-spinner fa-spin"></i> Loading requests...
              </div>
            ) : error ? (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="no-requests">No pending requests at the moment</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Equipment</th>
                      <th>Subject</th>
                      <th>Requested By</th>
                      <th>Priority</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map(request => (
                      <tr key={request.id}>
                        <td>{request.equipment_name || 'New Equipment'}</td>
                        <td>{request.subject}</td>
                        <td>{request.requested_by_name}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(request.priority)}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <section className="panel equipment-list">
          <h2>
            <i className="fas fa-boxes"></i> Equipment List
          </h2>
          <EquipmentTable />
        </section>
      </div>
    </div>
  );
};

export default DashboardHome;