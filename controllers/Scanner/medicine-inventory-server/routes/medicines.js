const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.patch('/:id/update-stock', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  db.query('UPDATE medicines SET stock = stock - ? WHERE id = ?', [quantity, id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Stock updated');
  });
});

module.exports = router;
