import logger from './logger';

export class RateLimiter {
    private requestTimes: Map<string, number[]>;
    private windowMs: number;
    private maxRequests: number;

    constructor(windowMs: number = 1000, maxRequests: number = 2) {
        this.requestTimes = new Map();
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    async waitForToken(key: string): Promise<void> {
        const now = Date.now();
        let times = this.requestTimes.get(key) || [];
        
        // Remove old timestamps
        times = times.filter(time => time > now - this.windowMs);
        
        if (times.length >= this.maxRequests) {
            const oldestTime = times[0];
            const waitTime = oldestTime + this.windowMs - now;
            logger.debug(`Rate limit hit for ${key}, waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.waitForToken(key);
        }
        
        times.push(now);
        this.requestTimes.set(key, times);
    }
}

export const shopifyRateLimiter = new RateLimiter(1000, 2); // 2 requests per second
export const backMarketRateLimiter = new RateLimiter(1000, 5); // 5 requests per second
