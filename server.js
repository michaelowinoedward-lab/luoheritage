require('dotenv').config();
const express = require('express');

// Start Discord bot
require('./bot');

const app = express();

// Serve website
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Website running on port " + PORT);
});