import cron from 'node-cron'

// Run every 5 mins
cron.schedule('*/5 * * * * *', () => {
    console.log("Running price snapshot job")
    // insertPriceSnapshots().catch(console.error)

})
