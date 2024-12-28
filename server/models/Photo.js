const db = require('../db'); 

const Photo = {
    getAll: (callback) => {
        const query = 'SELECT * FROM photos ORDER BY created_at DESC';
        db.query(query, callback);
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM photos WHERE id = ?';
        db.query(query, [id], callback);
    },

    add: (photo, callback) => {
        const query = 'INSERT INTO photos (title, description, photo_url, album_id) VALUES (?, ?, ?, ?)';
        
        // Add console.log to debug
        console.log('Executing query:', query);
        console.log('With values:', [photo.title, photo.description, photo.photo_url, photo.album_id]);
        
        db.query(query, [photo.title, photo.description, photo.photo_url, photo.album_id], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return callback(err);
            }
            callback(null, result);
        });
    },

    update: (id, photo, callback) => {
        const query = 'UPDATE photos SET title = ?, description = ? WHERE id = ?';
        db.query(query, [photo.title, photo.description, id], callback);
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM photos WHERE id = ?';
        db.query(query, [id], callback);
    },

    search: (term, callback) => {
        const query = 'SELECT * FROM photos WHERE title LIKE ? OR description LIKE ?';
        const searchTerm = `%${term}%`;
        db.query(query, [searchTerm, searchTerm], callback);
    },

    getByAlbumId: (albumId, callback) => {
        const query = 'SELECT * FROM photos WHERE album_id = ? ORDER BY created_at DESC';
        db.query(query, [albumId], callback);
    }
};

module.exports = Photo;
