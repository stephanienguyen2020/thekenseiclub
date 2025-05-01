import cron from 'node-cron';
import { daoService } from './services/daoService';

// Schedule task to check and close expired proposals every minute
cron.schedule('* * * * *', async () => {
    try {
        console.log('Checking for expired proposals...');
        await daoService.checkAndCloseExpiredProposals();
    } catch (error) {
        console.error('Error in scheduled task:', error);
    }
});

// Export the cron job for potential cleanup
export const scheduledTasks = {
    start: () => {
        console.log('Scheduled tasks started');
    },
    stop: () => {
        console.log('Scheduled tasks stopped');
    }
}; 