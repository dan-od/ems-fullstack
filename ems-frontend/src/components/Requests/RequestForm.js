import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Requests.css';

const RequestForm = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [requestType, setRequestType] = useState('existing'); // 'existing' or 'new'
  const [formData, setFormData] = useState({
    equipment_id: '',
    is_new_equipment: false,
    new_equipment_name: '',
    new_equipment_description: '',
    subject: '',
    description: '',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/equipment', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        is_new_equipment: requestType === 'new',
        equipment_id: requestType === 'existing' ? formData.equipment_id : null
      };
  
      // For backward compatibility, remove new equipment fields if not needed
      if (requestType === 'existing') {
        delete payload.new_equipment_name;
        delete payload.new_equipment_description;
      }
  
      const response = await fetch('http://localhost:3001/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create request');
      }
      
      navigate('/dashboard/requests');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequestTypeChange = (type) => {
    setRequestType(type);
    setFormData(prev => ({
      ...prev,
      is_new_equipment: type === 'new',
      equipment_id: type === 'existing' ? prev.equipment_id : '',
      new_equipment_name: type === 'new' ? prev.new_equipment_name : '',
      new_equipment_description: type === 'new' ? prev.new_equipment_description : ''
    }));
  };

  return (
    <div className="request-form-container">
      <div className="request-form-header">
        <h1>New Equipment Request</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group request-type-group">
          <label>Request Type</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="requestType"
                checked={requestType === 'existing'}
                onChange={() => handleRequestTypeChange('existing')}
              />
              Existing Equipment
            </label>
            <label>
              <input
                type="radio"
                name="requestType"
                checked={requestType === 'new'}
                onChange={() => handleRequestTypeChange('new')}
              />
              New Equipment
            </label>
          </div>
        </div>

        {requestType === 'existing' ? (
          <div className="form-group">
            <label htmlFor="equipment_id">Equipment</label>
            <select
              id="equipment_id"
              name="equipment_id"
              value={formData.equipment_id}
              onChange={handleChange}
              required={requestType === 'existing'}
            >
              <option value="">Select Equipment</option>
              {equipment.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="new_equipment_name">Equipment Name</label>
              <input
                type="text"
                id="new_equipment_name"
                name="new_equipment_name"
                value={formData.new_equipment_name}
                onChange={handleChange}
                required={requestType === 'new'}
                placeholder="Name of the new equipment"
              />
            </div>
            <div className="form-group">
              <label htmlFor="new_equipment_description">Equipment Description</label>
              <textarea
                id="new_equipment_description"
                name="new_equipment_description"
                value={formData.new_equipment_description}
                onChange={handleChange}
                required={requestType === 'new'}
                placeholder="Description of the new equipment"
                rows="3"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Brief description of the request"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Detailed description of the request"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/dashboard/requests')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;