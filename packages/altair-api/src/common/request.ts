import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Extract the authenticated user's ID from the request.
 * Throws UnauthorizedException if the user ID is not present.
 */
export function getUserId(req: Request): string {
  const userId = req?.user?.id;
  if (!userId) {
    throw new UnauthorizedException('User not authenticated');
  }
  return userId;
}
