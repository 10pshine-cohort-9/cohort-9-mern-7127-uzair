const mongoose = require('mongoose');

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log("MongoDB connected!");
    }
    catch(err){
        console.log("Mongoose Connection Error: ",err.message);
    }
}

module.exports = connectDB;