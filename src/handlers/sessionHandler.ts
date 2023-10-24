import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sessions } from '../storage/sessionStorage';
import { Message, SessionMessageEvent, Session } from '../config/sessionConfig';
import { generatePin } from '../utils/generatePin';
import { z } from 'zod';

class sessionHandler {
    public createSession = (ws: WebSocket, obj: Message) => {
        for (const session of sessions) {
            if (session.host === ws) {
                ws.send('You are already in a session!');
                return;
            }
        }

        const createSessionSchema = z.object({
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

        const validation = createSessionSchema.safeParse(obj);

        if (validation?.success && obj.message.type === SessionMessageEvent.HOST) {
            const uniqueSessionId = uuidv4();
            const pin = generatePin();
            const scenario = obj.message.action.scenario.toString();
            const totalQuestions = Number(obj.message.action.totalQuestions);
            const winPercentage = Number(obj.message.action.winPercentage) ?? 50;

            sessions.push({
                id: uniqueSessionId,
                pin,
                scenario,
                host: ws,
                participants: [{ ws, score: 0 }],
                totalQuestions,
                winPercentage,
            });

            ws.send(`Session initiated for session ID: ${uniqueSessionId}`);
        }
    };

    public messageSession = (ws: WebSocket, obj: Message) => {
        if (obj?.token) {
            const session = sessions.find((session) => session.id === obj.token);

            if (!session) {
                console.log('not found');
                ws.send('Session does not exist!');
                return;
            }

            if (obj.message.type === SessionMessageEvent.HOST) {
                session.host.send(obj.message.toString());
            } else if (obj.message.type === SessionMessageEvent.ALL) {
                for (const participant of session.participants) {
                    participant.ws.send(obj.message.action.toString());
                }
            }
        } else {
            console.log('no token provided');
        }
    };
}

export default new sessionHandler();
