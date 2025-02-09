import { config } from '../config/config';
import logger from './logger';

export async function withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxAttempts: number = config.retryAttempts
): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            const delay = config.retryDelay * Math.pow(2, attempt - 1);
            logger.warn(`${context} failed attempt ${attempt}/${maxAttempts}. Retrying in ${delay}ms`, {
                error: lastError.message,
                attempt,
                maxAttempts
            });
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw lastError;
}
