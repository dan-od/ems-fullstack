import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Requests.css';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role when component mounts
    const userData = JSON.parse(localStorage.getItem('user'));
    setUserRole(userData?.role || '');
    
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update request');
      fetchRequests(); // Refresh the list
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  // Only show approve/reject buttons for admins and managers
  const showActionButtons = ['admin', 'manager'].includes(userRole);

  return (
    <div className="requests-container">
      <div className="requests-header">
        <h1>Equipment Requests</h1>
        <button 
          className="new-request-btn"
          onClick={() => navigate('/dashboard/new-request')}
        >
          New Request
        </button>
      </div>

      <div className="requests-list">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Equipment</th>
              <th>Requested By</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Request Date</th>
              {showActionButtons && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.id}</td>
                <td>{request.equipment_name}</td>
                <td>{request.requested_by_name}</td>
                <td>{request.subject}</td>
                <td>
                  <span className={`status-badge ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>{new Date(request.created_at).toLocaleDateString()}</td>
                {showActionButtons && (
                  <td>
                    <div className="action-buttons">
                      {request.status === 'Pending' && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() => handleStatusChange(request.id, 'Approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleStatusChange(request.id, 'Rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/dashboard/requests/${request.id}`)}
                      >
                        View
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestList;