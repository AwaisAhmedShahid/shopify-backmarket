import dotenv from 'dotenv';
import { config } from './config/config';
import express from 'express';
import { SyncManager } from './jobs/sync-manager';
import logger from './utils/logger';
import { MemoryStore } from './storage/memory-store';


dotenv.config();

const app = express();
app.use(express.json());

// Initialize sync manager
const syncManager = new SyncManager();
syncManager.startSync();

// Health check endpoint with sync status
app.get('/health', (req, res) => {
    const store = MemoryStore.getInstance();
    const failedImports = store.getFailedImports();

    res.status(200).json({
        status: 'healthy',
        failedImports: failedImports.length,
        failedImportIds: failedImports,
        lastSyncTime: syncManager.getLastSyncTime(),
        version: '1.0.0'
    });
});

// Start server
app.listen(config.server.port, '0.0.0.0', () => {
    logger.info(`Server started on port ${config.server.port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});