import { z } from 'zod';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';

export const createLobbySchema = z.object({
    event: z.literal(WebSocketMessageEvent.CREATE_LOBBY),
    message: z.object({
        data: z.object({
            name: z.string().min(1),
            scenario: z.string().min(1),
            total_questions: z.number(),
            win_percentage: z.number(),
        }),
    }),
});

export const joinLobbySchema = z.object({
    event: z.literal(WebSocketMessageEvent.LEAVE_LOBBY),
    message: z.object({
        data: z.object({
            name: z.string().min(1),
            pin: z.string().min(1),
        }),
    }),
});
