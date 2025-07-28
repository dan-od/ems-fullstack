const express = require('express');
const { authenticateJWT, checkRole } = require('../middleware/auth');
const pool = require('../config/db');
const router = express.Router();

// Get all requests
router.get('/', authenticateJWT(), async (req, res) => {
  try {
    // First check if the columns exist
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'requests' 
      AND column_name IN ('is_new_equipment', 'new_equipment_name')
    `);
    
    const hasNewEquipmentColumns = columnCheck.rows.some(row => 
      row.column_name === 'is_new_equipment'
    );

    let query;
    if (hasNewEquipmentColumns) {
      query = `
        SELECT 
          r.*,
          e.name as equipment_name,
          u1.name as requested_by_name,
          u2.name as approved_by_name,
          CASE 
            WHEN r.is_new_equipment THEN r.new_equipment_name 
            ELSE e.name 
          END as display_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN users u1 ON r.requested_by = u1.id
        LEFT JOIN users u2 ON r.approved_by = u2.id
        ORDER BY r.created_at DESC
      `;
    } else {
      query = `
        SELECT 
          r.*,
          e.name as equipment_name,
          u1.name as requested_by_name,
          u2.name as approved_by_name,
          e.name as display_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN users u1 ON r.requested_by = u1.id
        LEFT JOIN users u2 ON r.approved_by = u2.id
        ORDER BY r.created_at DESC
      `;
    }

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('GET requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get request by ID
router.get('/:id', authenticateJWT(), async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        r.*,
        e.name as equipment_name,
        u1.name as requested_by_name,
        u2.name as approved_by_name,
        CASE 
          WHEN r.is_new_equipment THEN r.new_equipment_name 
          ELSE e.name 
        END as display_name
      FROM requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN users u1 ON r.requested_by = u1.id
      LEFT JOIN users u2 ON r.approved_by = u2.id
      WHERE r.id = $1
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET request error:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Get pending requests (for dashboard)
// In requests.js, update the pending requests endpoint
router.get('/dashboard/pending', authenticateJWT(), async (req, res) => {
  try {
    // First check if the is_new_equipment column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'requests' 
      AND column_name = 'is_new_equipment'
    `);
    
    const hasNewEquipmentColumn = columnCheck.rows.length > 0;

    let query;
    if (hasNewEquipmentColumn) {
      query = `
        SELECT 
          r.id,
          r.subject,
          r.priority,
          r.created_at,
          CASE 
            WHEN r.is_new_equipment THEN r.new_equipment_name 
            ELSE e.name 
          END as equipment_name,
          u1.name as requested_by_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN users u1 ON r.requested_by = u1.id
        WHERE r.status = 'Pending'
        ORDER BY 
          CASE r.priority
            WHEN 'Urgent' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 4
          END,
          r.created_at DESC
        LIMIT 5
      `;
    } else {
      query = `
        SELECT 
          r.id,
          r.subject,
          r.priority,
          r.created_at,
          e.name as equipment_name,
          u1.name as requested_by_name
        FROM requests r
        LEFT JOIN equipment e ON r.equipment_id = e.id
        LEFT JOIN users u1 ON r.requested_by = u1.id
        WHERE r.status = 'Pending'
        ORDER BY 
          CASE r.priority
            WHEN 'Urgent' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 4
          END,
          r.created_at DESC
        LIMIT 5
      `;
    }

    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error('GET pending requests error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch pending requests',
      details: err.message 
    });
  }
});

// Create new request
router.post('/', authenticateJWT(), async (req, res) => {
  const { equipment_id, is_new_equipment, new_equipment_name, new_equipment_description, subject, description, priority } = req.body;
  
  try {
    // Validate request data
    if (is_new_equipment) {
      if (!new_equipment_name || !new_equipment_description) {
        return res.status(400).json({ error: 'New equipment name and description are required' });
      }
    } else {
      if (!equipment_id) {
        return res.status(400).json({ error: 'Equipment selection is required' });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO requests 
       (equipment_id, requested_by, is_new_equipment, new_equipment_name, new_equipment_description, subject, description, priority) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        is_new_equipment ? null : equipment_id, // Use null instead of empty string for new equipment
        req.user.id,
        is_new_equipment,
        is_new_equipment ? new_equipment_name : null,
        is_new_equipment ? new_equipment_description : null,
        subject,
        description,
        priority
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Update request status (approve/reject) - now handles new equipment creation
router.patch('/:id', authenticateJWT(), checkRole(['admin', 'manager']), async (req, res) => {
  const { status } = req.body;
  
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // First get the request details
    const requestQuery = await pool.query(
      `SELECT * FROM requests WHERE id = $1`,
      [req.params.id]
    );

    if (requestQuery.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = requestQuery.rows[0];

    // If approving a new equipment request, create the equipment
    if (status === 'Approved' && request.is_new_equipment) {
      // First create the new equipment
      const equipmentResult = await pool.query(
        `INSERT INTO equipment (name, description, created_by, created_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [request.new_equipment_name, request.new_equipment_description, req.user.id]
      );

      const newEquipment = equipmentResult.rows[0];

      // Then update the request
      const requestResult = await pool.query(
        `UPDATE requests 
         SET equipment_id = $1,
             status = $2,
             approved_by = $3,
             approved_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [newEquipment.id, status, req.user.id, req.params.id]
      );

      await pool.query('COMMIT');
      
      // Return both the updated request and the new equipment
      res.json({
        request: requestResult.rows[0],
        equipment: newEquipment
      });
    } else {
      // For existing equipment or rejected requests
      const { rows } = await pool.query(
        `UPDATE requests 
         SET status = $1, 
             approved_by = $2,
             approved_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 
         RETURNING *`,
        [status, req.user.id, req.params.id]
      );

      await pool.query('COMMIT');
      res.json(rows[0]);
    }
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Update request error:', err);
    res.status(500).json({ 
      error: 'Failed to update request',
      details: err.message
    });
  }
});

module.exports = router;