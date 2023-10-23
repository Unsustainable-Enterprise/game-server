import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sessions } from '../storage/sessionStorage';
import { Message, SessionMessageEvent } from '../config/sessionConfig';
import { generatePin } from '../utils/generatePin';

class sessionHandler {
    public createSession = (ws: WebSocket) => {
        for (const session of sessions) {
            if (session.host === ws) {
                ws.send('You are already in a session!');
                return;
            }
        }

        const uniqueSessionId = uuidv4();
        const pin = generatePin();

        console.log(pin);

        sessions.push({
            id: uniqueSessionId,
            pin: pin,
            scenario: 'scenario',
            host: ws,
            participants: [ws],
        });

        ws.send(`Session initiated for session ID: ${uniqueSessionId}`);
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
                    participant.send(obj.message.action.toString());
                }
            }
        } else {
            console.log('no token provided');
        }
    };
}

export default new sessionHandler();
