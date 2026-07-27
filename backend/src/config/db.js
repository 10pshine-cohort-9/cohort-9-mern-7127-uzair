const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB connected!");
    }
    catch(err){
        throw new Error(err.message);
    }
}

module.exports = connectDB;