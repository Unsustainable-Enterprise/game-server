import { z } from 'zod';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';

export const createPartySchema = z.object({
    event: z.literal(WebSocketMessageEvent.CREATE_PARTY),
    message: z.object({
        data: z.object({
            name: z.string().min(1),
            scenario: z.string().min(1),
            total_questions: z.number(),
            win_percentage: z.number(),
        }),
    }),
});

export const joinPartySchema = z.object({
    event: z.literal(WebSocketMessageEvent.LEAVE_PARTY),
    message: z.object({
        data: z.object({
            name: z.string().min(1),
            pin: z.string().min(1),
        }),
    }),
});
