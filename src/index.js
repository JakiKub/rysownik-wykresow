require('dotenv').config();
const express = require('express');
const path = require('path');

const { rysownik } = require('./rysownik');

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/wykres", async (req, res) => {
    try {
        const buffer = await rysownik(req.body);
        res.set("Content-Type", "image/png");
        res.send(buffer);
    } catch (err) { 
        res.status(400).json({ error: err.message})
    }
});

app.listen(3002, '0.0.0.0', () => {
    console.log("serwer chodzi");
});