import { z } from 'zod';
import { WebSocketMessageEvent } from '../types/websocket-types';

export const startGameSchema = z.object({
    event: z.literal(WebSocketMessageEvent.START_GAME),
    token: z.string().min(1),
    message: z.object({}),
});
