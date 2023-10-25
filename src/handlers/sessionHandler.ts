import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sessions } from '../storage/sessionStorage';
import { Message, SessionMessageEvent, Session } from '../config/sessionConfig';
import { generatePin } from '../utils/generatePin';
import { createSessionSchema } from '../config/schema/sessionSchema';
import { sendMessage } from '../utils/sendMessage';

class sessionHandler {
    public createSession = (ws: WebSocket, obj: Message) => {
        const validation = createSessionSchema.safeParse(obj);

        if (!validation?.success) {
            console.log('createSession validation failed');
            return;
        }

        for (const session of sessions) {
            if (session.host === ws) {
                ws.send('You are already in a session!');
                return;
            }
        }

        if (obj.message.type === SessionMessageEvent.HOST) {
            const uniqueSessionId = uuidv4();
            const pin = generatePin();
            const scenario = obj.message.data.scenario.toString();
            const totalQuestions = Number(obj.message.data.totalQuestions);
            const winPercentage = Number(obj.message.data.winPercentage) ?? 50;

            sessions.push({
                id: uniqueSessionId,
                pin,
                scenario,
                host: ws,
                participants: [{ ws, score: 0 }],
                totalQuestions,
                winPercentage,
            });

            sendMessage(ws, uniqueSessionId, { pin });
        }
    };

    public messageSession = (ws: WebSocket, obj: Message) => {
        if (!obj?.token) {
            console.log('no token provided');
            return;
        }

        const session = sessions.find((session) => session.id === obj.token);

        if (!session) {
            console.log('session not found');
            return;
        }

        const data = obj.message.data;

        if (obj.message.type === SessionMessageEvent.HOST) {
            sendMessage(ws, obj.token, { data });
        } else if (obj.message.type === SessionMessageEvent.ALL) {
            for (const participant of session.participants) {
                sendMessage(participant.ws, obj.token, { data });
            }
        }
    };
}

export default new sessionHandler();
