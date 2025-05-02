import cron from 'node-cron';
import { daoService } from './services/daoService';

// Schedule task to run every minute
cron.schedule('* * * * *', async () => {
    try {
        console.log('Starting scheduled tasks...');
        
        // First, update vote statistics for all open proposals
        console.log('Updating vote statistics...');
        await daoService.updateVoteStatistics();
        
        // Then, check and close expired proposals
        console.log('Checking for expired proposals...');
        await daoService.checkAndCloseExpiredProposals();
        
        console.log('Scheduled tasks completed');
    } catch (error) {
        console.error('Error in scheduled tasks:', error);
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