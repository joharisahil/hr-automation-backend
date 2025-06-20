const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/', (req, res) => {
  const { category, brand, dose, group_code, medicines } = req.body;

  db.query(
    'INSERT INTO barcode_groups (group_code, category, brand, dose) VALUES (?, ?, ?, ?)',
    [group_code, category, brand, dose],
    (err, result) => {
      if (err) return res.status(500).send(err);

      const values = medicines.map(med => [group_code, med.name, med.batch, med.expiry, med.stock]);

      db.query(
        'INSERT INTO medicines (group_code, name, batch, expiry, stock) VALUES ?',
        [values],
        (err2) => {
          if (err2) return res.status(500).send(err2);
          res.send('Group and medicines saved.');
        }
      );
    }
  );
});

router.get('/:groupCode/medicines', (req, res) => {
  const { groupCode } = req.params;

  db.query('SELECT * FROM medicines WHERE group_code = ?', [groupCode], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


module.exports = router;
