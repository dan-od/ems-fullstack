const express = require('express');
const router = express.Router();
const pool = require('../../db');
const auth = require('../../middleware/auth');

// Get all maintenance logs
router.get('/', auth, async (req, res) => {
  try {
    const logs = await pool.query(
      'SELECT ml.*, e.name as equipment_name, u.name as user_name FROM maintenance_logs ml ' +
      'JOIN equipment e ON ml.equipment_id = e.id ' +
      'JOIN users u ON ml.user_id = u.id ' +
      'ORDER BY ml.date DESC'
    );
    res.json(logs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add new maintenance log
router.post('/', auth, async (req, res) => {
  try {
    const { equipment_id, description, maintenance_type, date } = req.body;
    const newLog = await pool.query(
      'INSERT INTO maintenance_logs (equipment_id, user_id, description, maintenance_type, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [equipment_id, req.user.id, description, maintenance_type, date]
    );
    res.json(newLog.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update maintenance log
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, maintenance_type, date } = req.body;
    const updateLog = await pool.query(
      'UPDATE maintenance_logs SET description = $1, maintenance_type = $2, date = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [description, maintenance_type, date, id, req.user.id]
    );
    res.json(updateLog.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete maintenance log
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM maintenance_logs WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ msg: 'Maintenance log deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 