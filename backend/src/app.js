const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler'); 


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use('/uploads', express.static('uploads', {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
  }
}));
app.use(pinoHttp({logger}));

app.use('/auth', authRoutes);
app.use('/notes', notesRoutes);

app.get("/",(req,res)=>{
    res.send("App is working!");
});

app.use((req,res)=>{
  res.status(404).json({message: "Route not found!"});
});

app.use(errorHandler);

module.exports = app;