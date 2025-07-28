import React, { useState, useEffect } from 'react';
import { equipmentService } from '../../services/api';
import './MaintenanceLog.css';

const MaintenanceLog = ({ equipmentId, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [maintenanceType, setMaintenanceType] = useState('Routine');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentId || '');
  const userRole = localStorage.getItem('userRole');
  
  // Fetch equipment list for dropdown
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data } = await equipmentService.getAll();
        setEquipmentList(data);
        
        // If no equipmentId was provided but we have equipment in the list,
        // select the first one by default
        if (!selectedEquipmentId && data.length > 0) {
          setSelectedEquipmentId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch equipment list:', err);
      }
    };
    
    fetchEquipment();
    // Only run this effect once on component mount
  }, [[selectedEquipmentId]]); // We intentionally omit selectedEquipmentId to avoid infinite loop
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Make sure selectedEquipmentId is valid before making the request
        if (!selectedEquipmentId) {
          setLoading(false);
          setLogs([]);
          return;
        }
        
        const { data } = await equipmentService.getMaintenanceLogs(selectedEquipmentId);
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      // Make sure selectedEquipmentId is valid before making the request
      if (!selectedEquipmentId) {
        alert('Please select equipment first.');
        return;
      }
      
      // Simplify the data structure - remove equipment_id from the payload
      // as it's already in the URL
      const logData = {
        equipment_id: selectedEquipmentId, 
        maintenance_type: maintenanceType,
        description: description,
        date: new Date().toISOString().slice(0, 10)
      };

      console.log('Sending maintenance log data:', logData);
      
      await equipmentService.addMaintenanceLog(selectedEquipmentId, logData);

      // Re-fetch logs
      const { data } = await equipmentService.getMaintenanceLogs(selectedEquipmentId);
      setLogs(data);

      setMaintenanceType('Routine');
      setDescription('');
    } catch (err) {
      console.error('Add log error:', err.response?.data || err.message);
      alert(`Error 500: ${JSON.stringify(err.response?.data || err.message)}`);
    }
    
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && typeof onClose === 'function') {
      onClose();
    }
  };

  // Función para cerrar el modal
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      // Si onClose no es una función, intentamos cerrar el modal de otra manera
      const modalElement = document.querySelector('.modal-overlay');
      if (modalElement) {
        modalElement.style.display = 'none';
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Maintenance Logs</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        {['admin', 'manager', 'engineer'].includes(userRole) && (
          <form onSubmit={handleAddLog} className="log-form">
            <h3>Add New Log Entry</h3>
            
            <div className="form-group">
              <label>Select Equipment</label>
              <select
                value={selectedEquipmentId}
                onChange={(e) => setSelectedEquipmentId(e.target.value)}
                className="form-control"
                required
              >
                <option value="">-- Select Equipment --</option>
                {equipmentList.map(equipment => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Maintenance Type</label>
              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                className="form-control"
              >
                <option value="Routine">Routine Maintenance</option>
                <option value="Repair">Repair</option>
                <option value="Inspection">Inspection</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                placeholder="Enter maintenance details..."
                required
              />
            </div>

            <button type="submit" className="submit-button">Add Log Entry</button>
          </form>
        )}

        <div className="logs-container">
          <h3>Maintenance History</h3>
          {loading ? (
            <div className="loading">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="no-logs">No maintenance records found</div>
          ) : (
            <div className="logs-list">
              {logs.map(log => (
                <div key={log.id} className="log-entry">
                  <div className="log-header">
                    <span className="log-type">{log.maintenance_type}</span>
                    <span className="log-date">{new Date(log.date).toLocaleDateString()}</span>
                  </div>
                  <div className="log-body">
                    <p>{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              className="submit-button" 
              onClick={handleClose}
              style={{ backgroundColor: '#ff4d4f' }}
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceLog;
