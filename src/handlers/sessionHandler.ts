import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sessions } from '../storage/sessionStorage';

class sessionHandler {
    public createSession = (ws: WebSocket) => {
        for (const session of sessions) {
            if (session.host === ws) {
                ws.send('You are already in a session!');
                return;
            }
        }

        const uniqueSessionId = uuidv4();

        sessions.push({
            id: uniqueSessionId,
            pin: '1234',
            scenario: 'scenario',
            host: ws,
            participants: [],
        });

        ws.send(`Session initiated for session ID: ${uniqueSessionId}`);
    };
}

export default new sessionHandler();
