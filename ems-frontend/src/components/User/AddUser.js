import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './UserManagement.css'; // Reusing the same styles

const AddUser = () => {
  const navigate = useNavigate();
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'engineer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = newUser;
      const { data } = await api.post('/users', userData);
      
      setSuccessMessage('User created successfully!');
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'engineer'
      });
      
      // Redirect to user management page after 2 seconds
      setTimeout(() => {
        navigate('/dashboard/user-management');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user');
      console.error('Create user error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-management">
      <h2>Add New User</h2>
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="role-info">
        <p>Select a role for the new user:</p>
        <ul>
          <li><strong>Admin:</strong> Full system access, can manage all users and settings</li>
          <li><strong>Manager:</strong> Can manage equipment, requests, and view reports</li>
          <li><strong>Engineer:</strong> Can view equipment and submit maintenance requests</li>
        </ul>
      </div>
      
      <form onSubmit={handleSubmit} className="add-user-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={newUser.name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={newUser.email}
            onChange={handleChange}
            required
            placeholder="Enter email address"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={newUser.password}
            onChange={handleChange}
            required
            placeholder="Enter password (min. 6 characters)"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={newUser.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm password"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={newUser.role}
            onChange={handleChange}
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="engineer">Engineer</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/dashboard/user-management')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser; 