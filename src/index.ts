import express from 'express';
import { config } from './config/config';
import logger from './utils/logger';

const app = express();
app.use(express.json());



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