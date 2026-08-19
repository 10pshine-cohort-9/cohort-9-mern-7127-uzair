const cron = require('node-cron');
const Note = require('../models/Note');

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const startTrashPurgeJob = () => {
  cron.schedule('0 0 * * *', async () => {
    const cutoff = new Date(Date.now() - SEVEN_DAYS);

    try {
      const result = await Note.deleteMany({ deletedAt: { $ne: null, $lt: cutoff } });
      console.log(`Trash purge: deleted ${result.deletedCount} note(s)`);
    } catch (error) {
      console.error('Trash purge failed:', error);
    }
  });
};

module.exports = startTrashPurgeJob;