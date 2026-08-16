require("dotenv").config();
const logger = require('./src/utils/logger');
const startTrashPurgeJob = require('./jobs/autoTrash');

const app = require('./src/app');
const connectDB = require('./src/config/db');

startTrashPurgeJob();

async function startServer() {
try {
    await connectDB();
    app.listen(process.env.PORT,()=>{
        logger.info(`Server is running on PORT ${process.env.PORT}`);
    })
} catch (error) {
    logger.error("Failed to start Server: ",error.message);
    exit(1);
}
}

startServer();