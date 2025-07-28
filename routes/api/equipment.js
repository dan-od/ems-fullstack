const express = require('express');
const router = express.Router();
const pool = require('../../db');
const auth = require('../../middleware/auth');

// Get all equipment
router.get('/', auth, async (req, res) => {
  try {
    const equipment = await pool.query('SELECT * FROM equipment ORDER BY id DESC');
    res.json(equipment.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add new equipment
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, status, category } = req.body;
    const newEquipment = await pool.query(
      'INSERT INTO equipment (name, description, status, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, status, category]
    );
    res.json(newEquipment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update equipment
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, category } = req.body;
    const updateEquipment = await pool.query(
      'UPDATE equipment SET name = $1, description = $2, status = $3, category = $4 WHERE id = $5 RETURNING *',
      [name, description, status, category, id]
    );
    res.json(updateEquipment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete equipment
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM equipment WHERE id = $1', [id]);
    res.json({ msg: 'Equipment deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 