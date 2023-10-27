import { v4 as uuidv4 } from 'uuid';
import WebSocket from 'ws';
import { sessions } from '../storage/sessionStorage';
import { Message, SessionMessageEvent, Participants } from '../config/sessionConfig';
import { generatePin } from '../utils/generatePin';
import {
    createSessionSchema,
    messageSessionSchema,
    joinSessionSchema,
} from '../config/schema/sessionSchema';
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

        const uniqueSessionId = uuidv4();
        const pin = generatePin();
        const scenario = obj.message.data.scenario.toString();
        const totalQuestions = Number(obj.message.data.totalQuestions);
        const winPercentage = Number(obj.message.data.winPercentage) ?? 51;
        const name = obj.message.data.name.toString();

        sessions.push({
            id: uniqueSessionId,
            pin,
            scenario,
            host: ws,
            participants: [{ ws, name, score: 0 }],
            totalQuestions,
            winPercentage,
        });

        sendMessage(ws, uniqueSessionId, { pin });
    };

    public joinSession = (ws: WebSocket, obj: Message) => {
        const validation = joinSessionSchema.safeParse(obj);

        if (!validation?.success) {
            console.log('joinSession validation failed');
            return;
        }

        const lobby = sessions.find((session) => session.pin === obj.message.data.pin);

        if (!lobby) {
            console.log('session not found');
            return;
        }

        const data = {
            onParticipantJoin: true,
        };

        for (const participant of lobby.participants) {
            sendMessage(participant.ws, lobby.id, { data });
        }

        const name = obj.message.data.name.toString();

        lobby.participants.push({ ws, name, score: 0 });
    };

    public messageSession = (ws: WebSocket, obj: Message) => {
        if (!obj?.token) {
            console.log('no token provided');
            return;
        }

        const validation = messageSessionSchema.safeParse(obj);

        if (!validation?.success) {
            console.log('createSession validation failed');
            return;
        }

        const lobby = sessions.find((session) => session.id === obj.token);

        if (!lobby) {
            console.log('session not found');
            return;
        }

        const data = obj.message.data;

        if (obj.message.type === SessionMessageEvent.HOST) {
            sendMessage(ws, obj.token, { data });
        } else if (obj.message.type === SessionMessageEvent.ALL) {
            for (const participant of lobby.participants) {
                sendMessage(participant.ws, obj.token, { data });
            }
        }
    };

    public onDissconnet = (ws: WebSocket) => {
        for (const lobby of sessions) {
            const foundParticipant = lobby.participants.find(
                (participant) => participant.ws === ws
            );

            if (foundParticipant) {
                if (lobby.host === ws) {
                    const data = {
                        onHostDisconnect: true,
                    };

                    this.disconnectMessage(ws, lobby.participants, lobby.id, { data });

                    sessions.splice(sessions.indexOf(lobby), 1);
                    console.log(`Deleted lobby ${lobby.id} because the host left`);
                    break;
                } else {
                    const data = {
                        onParticipantDisconnect: true,
                    };

                    this.disconnectMessage(ws, lobby.participants, lobby.id, { data });

                    lobby.participants.splice(lobby.participants.indexOf(foundParticipant), 1);
                }
                console.log(`Removed user from lobby ${lobby.id}`);
                break;
            }
        }
    };

    private disconnectMessage = (
        disconnectedWs: WebSocket,
        participants: Participants[],
        token: string,
        data: object
    ) => {
        for (const participant of participants) {
            if (participant.ws === disconnectedWs) continue;
            sendMessage(participant.ws, token, data);
        }
    };
}

export default new sessionHandler();
