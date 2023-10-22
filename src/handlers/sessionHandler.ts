import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';

class sessionHandler {
    public initiateSession = (ws: WebSocket) => {
        console.log('hello');
        const uniqueSessionId = uuidv4();
        console.log(uniqueSessionId);
        ws.send(`Session initiated for session ID: ${uniqueSessionId}`);
    };
}

export default new sessionHandler();
