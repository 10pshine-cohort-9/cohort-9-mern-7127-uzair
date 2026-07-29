const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.DB_URL);
        logger.info("MongoDB connected!");
    }
    catch(err){
        throw new Error(err.message);
    }
}

module.exports = connectDB;