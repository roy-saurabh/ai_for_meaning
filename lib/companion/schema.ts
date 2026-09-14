import { z } from 'zod';
import { COMPANION_STAGES, COMPANION_USER_TEXT_MAX } from './types';

/** Server-side request schema for /api/companion. */
export const companionInputSchema = z
  .object({
    stage: z.enum(COMPANION_STAGES),
    weather: z.string().trim().max(40).optional(),
    movement: z.enum(['storm', 'stillness', 'song']).optional(),
    userText: z.string().max(COMPANION_USER_TEXT_MAX).optional(),
  })
  .strict();
