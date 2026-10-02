import { Queue } from 'bullmq';
import { createRedisConnection } from './redis';

export const QUEUE_NAME = 'conversions';

export interface ConversionJobData {
  jobId: string;
  toolId: string;
  options?: Record<string, unknown>;
}

export const conversionQueue = new Queue<ConversionJobData>(QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 200,
    removeOnFail: 1000,
  },
});
