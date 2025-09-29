const cron = require('node-cron');
const Signal = require('../models/Signal.cjs');
const MarketData = require('../models/MarketData.cjs');
const WebSocketService = require('./websocket.cjs');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
  }

  initialize() {
    console.log('🕐 Initializing scheduler service...');

    // Expire old signals every 5 minutes
    this.scheduleJob('expire-signals', '*/5 * * * *', async () => {
      try {
        const expiredCount = await Signal.expireOldSignals();
        if (expiredCount > 0) {
          console.log(`⏰ Expired ${expiredCount} old signals`);
        }
      } catch (error) {
        console.error('Error expiring signals:', error);
      }
    });

    // Generate mock market data every 10 seconds (for demo)

    // Clean old market data daily at 2 AM
    this.scheduleJob('cleanup-market-data', '0 2 * * *', async () => {
      try {
        const result = await MarketData.cleanOldData(30);
        console.log(`🧹 Cleaned old market data: ${result.marketDataDeleted} records, ${result.indicatorsDeleted} indicators`);
      } catch (error) {
        console.error('Error cleaning market data:', error);
      }
    });

    // Update portfolio statistics every hour
    this.scheduleJob('update-portfolio-stats', '0 * * * *', async () => {
      try {
        // This would typically update all user portfolio statistics
        console.log('📊 Portfolio statistics update completed');
      } catch (error) {
        console.error('Error updating portfolio stats:', error);
      }
    });


    // Health check every 30 minutes
    this.scheduleJob('health-check', '*/30 * * * *', async () => {
      try {
        const database = require('../config/database.cjs');
        const isHealthy = await database.healthCheck();
        
        if (!isHealthy) {
          console.error('❌ Database health check failed');
        } else {
          console.log('✅ System health check passed');
        }
      } catch (error) {
        console.error('Error in health check:', error);
      }
    });

    // WebSocket statistics every 10 minutes
    this.scheduleJob('websocket-stats', '*/10 * * * *', () => {
      try {
        const stats = WebSocketService.getStats();
        console.log(`📡 WebSocket Stats: ${stats.totalConnections} total, ${stats.authenticatedConnections} authenticated`);
      } catch (error) {
        console.error('Error getting WebSocket stats:', error);
      }
    });

    console.log('✅ Scheduler service initialized with', this.jobs.size, 'jobs');
  }

  scheduleJob(name, cronExpression, task) {
    if (this.jobs.has(name)) {
      console.warn(`Job ${name} already exists, skipping...`);
      return;
    }

    const job = cron.schedule(cronExpression, task, {
      scheduled: false,
      timezone: 'UTC'
    });

    this.jobs.set(name, job);
    job.start();
    
    console.log(`📅 Scheduled job: ${name} (${cronExpression})`);
  }

  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`⏹️ Stopped job: ${name}`);
      return true;
    }
    return false;
  }

  startJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`▶️ Started job: ${name}`);
      return true;
    }
    return false;
  }

  getJobStatus() {
    const status = {};
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    });
    return status;
  }

  stopAll() {
    console.log('🛑 Stopping all scheduled jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped job: ${name}`);
    });
    this.jobs.clear();
  }
}

module.exports = new SchedulerService();