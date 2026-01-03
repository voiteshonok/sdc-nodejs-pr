const express = require('express');
const path = require('path');

const app = express();
const port = 3001; // Different port to avoid conflict with index4.js

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend.html'));
});

app.listen(port, () => {
    console.log(`Frontend server running on http://localhost:${port}`);
    console.log(`Make sure your API server (index4.js) is running on port 3000`);
});

