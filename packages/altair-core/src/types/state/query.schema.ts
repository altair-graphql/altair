import { z } from 'zod/v4';

export const httpVerbSchema = z.enum(['POST', 'GET', 'PUT', 'DELETE']);
