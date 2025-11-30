const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'User list' }));
router.get('/:id', (req, res) => res.json({ message: 'User detail' }));
router.put('/:id', (req, res) => res.json({ message: 'Update user' }));

module.exports = router;
