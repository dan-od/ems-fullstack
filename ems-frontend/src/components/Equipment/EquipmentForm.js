import React, { useState } from 'react';
import { equipmentService } from '../../services/api';
import './Equipment.css';

const EquipmentForm = (props) => {
  // Default props to prevent errors
  const { 
    equipment = null, 
    onClose = null, 
    onSuccess = null 
  } = props;

  // State to control visibility of the component itself
  const [isVisible, setIsVisible] = useState(true);
  
  const [formData, setFormData] = useState(equipment || {
    name: '',
    description: '',
    status: 'Operational',
    location: '',
    last_maintained: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Safe function to close the modal
  const handleClose = () => {
    // If onClose prop exists, call it
    if (typeof onClose === 'function') {
      onClose();
    } else {
      // Otherwise just hide this component
      setIsVisible(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Format the date properly for the API
    const formattedData = {
      ...formData,
      last_maintained: formData.last_maintained ? new Date(formData.last_maintained).toISOString() : null
    };
    
    try {
      if (equipment) {
        await equipmentService.update(equipment.id, formattedData);
      } else {
        await equipmentService.create(formattedData);
      }
      
      // Show success popup instead of alert
      setPopupMessage('✅ ¡Saved Successfully!');
      setShowPopup(true);
      
      // Close popup and modal after 1.5 seconds
      setTimeout(() => {
        setShowPopup(false);
        // Only call onSuccess if it exists and is a function
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        handleClose(); // Use our safe close method
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setPopupMessage('❌ Error saving the equipment.');
      setShowPopup(true);
      
      // Only close the popup after error, not the whole modal
      setTimeout(() => {
        setShowPopup(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  // Custom popup component
  const Popup = ({ message }) => (
    <div className="custom-popup">
      <div className="popup-content">
        {message}
      </div>
    </div>
  );

  // Don't render anything if component is not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={(e) => {
      // Close modal when clicking on the overlay (outside the modal)
      if (e.target.className === 'modal-overlay') {
        handleClose();
      }
    }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{equipment ? 'Edit' : 'Add'} Equipment</h2>
          {/* Add a close button to the header */}
          <button 
            type="button" 
            className="close-btn"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-group">
            <label>Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Operational">Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Maintained</label>
            <input
              type="date"
              value={formData.last_maintained ? (typeof formData.last_maintained === 'string' ? formData.last_maintained.split('T')[0] : '') : ''}
              onChange={(e) => setFormData({ ...formData, last_maintained: e.target.value })}
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Save'}
            </button>
          </div>
        </form>
        
        {/* Custom popup that appears instead of alert */}
        {showPopup && <Popup message={popupMessage} />}
      </div>
    </div>
  );
};

export default EquipmentForm;