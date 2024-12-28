const express = require('express');
const Album = require('../models/Album');
const router = express.Router();

router.get('/', (req, res) => {
    Album.getAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

router.get('/:id', (req, res) => {
    Album.getById(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Album not found' });
        res.json(results[0]);
    });
});

router.post('/', (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Album name is required' });
    }

    Album.add({ name, description }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            message: 'Album created successfully',
            albumId: result.insertId
        });
    });
});

module.exports = router; 