import { z } from 'zod';

export const createLobbySchema = z.object({
    event: z.string().min(1),
    message: z.object({
        data: z.object({
            name: z.string().min(1),
            scenario: z.string().min(1),
            totalQuestions: z.number(),
            winPercentage: z.number(),
        }),
    }),
});

export const messageLobbySchema = z.object({
    event: z.string().min(1),
    token: z.string().min(1),
    message: z.object({
        data: z.record(z.any()),
        type: z.string().min(1),
    }),
});

export const joinLobbySchema = z.object({
    event: z.string().min(1),
    message: z.object({
        data: z.object({
            name: z.string().min(1),
            pin: z.string().min(1),
        }),
    }),
});
