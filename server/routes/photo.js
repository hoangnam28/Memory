const express = require('express');
const multer = require('multer');
const Photo = require('../models/Photo');
const fileValidation = require('../middleware/fileValidation');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });


router.get('/', (req, res) => {
    Photo.getAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


router.get('/:id', (req, res) => {
    Photo.getById(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Photo not found' });
        res.json(results[0]);
    });
});


router.post('/upload', upload.single('photo'), fileValidation, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, description, album_id } = req.body;

    const photo = {
        title,
        description,
        photo_url: `/uploads/${req.file.filename}`,
        album_id
    };

    Photo.add(photo, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Photo uploaded successfully' });
    });
});


router.put('/:id', (req, res) => {
    const { title, description } = req.body;
    Photo.update(req.params.id, { title, description }, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Photo updated successfully' });
    });
});


router.delete('/:id', (req, res) => {
    // First get the photo to find the file path
    Photo.getById(req.params.id, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Photo not found' });

        const photoUrl = results[0].photo_url;
        const filePath = path.join(__dirname, '../../public', photoUrl);

        // Delete the file
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);

            // Delete from database
            Photo.delete(req.params.id, (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Photo deleted successfully' });
            });
        });
    });
});


router.get('/search/:term', (req, res) => {
    Photo.search(req.params.term, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


router.get('/album/:albumId', (req, res) => {
    Photo.getByAlbumId(req.params.albumId, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


module.exports = router;
