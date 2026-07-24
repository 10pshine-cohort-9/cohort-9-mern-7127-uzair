require("dotenv").config();

const app = require('./src/app.js');
const connectDB = require('./src/config/db.js');

await connectDB();

const PORT = process.env.PORT;

app.listen(PORT, ()=>{
    console.log(`Server Running on ${PORT}`);
});