const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');


const app = express();

app.use(express.json());
app.use(cors());
app.use(pinoHttp({logger}));

app.use('/auth', authRoutes);

app.get("/",(req,res)=>{
    res.send("App is working!");
});

module.exports = app;