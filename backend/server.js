require("dotenv").config();

const app = require('./src/app.js');
const connectDB = require('./src/config/db.js');

async function startServer() {
try {
    await connectDB();
    app.listen(process.env.PORT,()=>{
        console.log("Server is running!");
    })
} catch (error) {
    console.log("Failed to start Server: ",error.message);
    exit(1);
}
}

startServer();