import { z } from 'zod';

export const createSessionSchema = z.object({
    event: z.string().min(1),
    message: z.object({
        action: z.object({
            scenario: z.string().min(1),
            totalQuestions: z.number(),
            winPercentage: z.number(),
        }),
        type: z.string().min(1),
    }),
});
