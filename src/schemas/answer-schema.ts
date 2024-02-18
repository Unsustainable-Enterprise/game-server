import { WebSocketMessageEvent } from '../types/websocket-types';
import { z } from 'zod';

export const displayQuestionResultsSchema = z.object({
    event: z.literal(WebSocketMessageEvent.DISPLAY_QUESTION_RESULTS),
    id: z.string().min(1),
    message: z.object({
        question: z.number(),
    }),
});

export const answerQuestionSchema = z.object({
    event: z.literal(WebSocketMessageEvent.ANSWER_QUESTION),
    id: z.string().min(1),
    message: z.object({
        question: z.number(),
        answer: z.string().min(1),
        is_correct: z.boolean(),
    }),
});
