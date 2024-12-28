const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const photoRoutes = require('./routes/photo');
const albumRoutes = require('./routes/album');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();


app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


app.use('/api/photos', photoRoutes);
app.use('/api/albums', albumRoutes);


const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
