const db = require('../db');

const Album = {
    getAll: (callback) => {
        const query = 'SELECT *, (SELECT COUNT(*) FROM photos WHERE album_id = albums.id) as photo_count FROM albums ORDER BY created_at DESC';
        db.query(query, callback);
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM albums WHERE id = ?';
        db.query(query, [id], callback);
    },

    add: (album, callback) => {
        const query = 'INSERT INTO albums (name, description) VALUES (?, ?)';
        db.query(query, [album.name, album.description || null], callback);
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM albums WHERE id = ?';
        db.query(query, [id], callback);
    }
};

module.exports = Album; 