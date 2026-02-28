require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(express.static(__dirname));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected");
});


// REGISTER
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err) => {
            if (err) return res.send("User exists");
            res.send("Registered successfully");
        });
});


// LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (results.length === 0) return res.send("User not found");

        const match = await bcrypt.compare(password, results[0].password);

        if (match) {
            req.session.user = username;
            res.send("success");
        } else {
            res.send("Wrong password");
        }
    });
});


// SESSION CHECK
app.get('/check', (req, res) => {
    if (req.session.user) {
        res.send(req.session.user);
    } else {
        res.send("Not logged in");
    }
});


// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send("Logged out");
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});