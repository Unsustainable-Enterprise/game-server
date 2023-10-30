import WebSocket from 'ws';
import { Message } from '../configs/sessionConfig';
import { createLobbySchema, joinLobbySchema } from '../configs/schemas/sessionSchema';
import { sendMessage } from '../utils/sendMessage';
import { LobbyModel } from '../models/lobbyModel';
import { isLobbyExists } from '../utils/isLobbyExists';
import { ExtWebSocket } from '../configs/webSocketConfig';
import { LobbyManager } from '../managers/lobbyManager';
import { WebSocketManager } from '../managers/webSocketManager';

export namespace LobbyHandler {
    export async function createLobby(ws: ExtWebSocket, obj: Message) {
        const validation = createLobbySchema.safeParse(obj);

        if (!validation?.success) {
            console.log('createSession validation failed');
            return;
        }

        const session = await isLobbyExists(ws.id);

        if (session) {
            console.log('lobby exists');
            return;
        }

        const lobby = new LobbyModel(ws, obj);
        const lobbyData = lobby.getLobbyData();
        const id = lobbyData.id;
        const pin = lobbyData.pin;

        await lobby.insertLobbyData(lobbyData, (err: any) => {
            if (err) {
                console.error('Error inserting data:', err.message);
            } else {
                console.log('Data inserted successfully.');
            }
        });

        LobbyManager.addLobby(lobby);

        sendMessage(ws, id, { pin });
    }

    export async function joinLobby(ws: ExtWebSocket, obj: Message) {
        const validation = joinLobbySchema.safeParse(obj);

        if (!validation?.success) {
            console.log('joinLobby validation failed');
            return;
        }

        if (LobbyManager.findLobbyByParticipantId(ws.id) !== undefined) {
            console.log('you are already in lobby');
            return;
        }

        const lobby = LobbyManager.findlobbyByPin(obj.message.data.pin.toString());

        if (!lobby) {
            console.log('session not found');
            return;
        }

        await lobby.addParticipant(
            lobby.getLobbyData().id,
            ws,
            obj.message.data.name.toString(),
            (err: any) => {
                if (err) {
                    console.error('Error inserting data join:', err.message);
                } else {
                    console.log('Data inserted successfully.');
                }
            }
        );

        const data = {
            onParticipantJoin: true,
        };

        for (const participant of lobby.getLobbyData().participants) {
            sendMessage(
                WebSocketManager.getWebSocketSession(participant.id),
                lobby.getLobbyData().id,
                {
                    data,
                }
            );
        }
    }

    // export function messageSession(ws: WebSocket, obj: Message) {
    //     if (!obj?.token) {
    //         console.log('no token provided');
    //         return;
    //     }

    //     const validation = messageSessionSchema.safeParse(obj);

    //     if (!validation?.success) {
    //         console.log('createSession validation failed');
    //         return;
    //     }

    //     const lobby = sessions.find((session) => session.id === obj.token);

    //     if (!lobby) {
    //         console.log('session not found');
    //         return;
    //     }

    //     const data = obj.message.data;

    //     if (obj.message.type === LobbyMessageEvent.HOST) {
    //         sendMessage(ws, obj.token, { data });
    //     } else if (obj.message.type === LobbyMessageEvent.ALL) {
    //         for (const participant of lobby.participants) {
    //             sendMessage(participant.ws, obj.token, { data });
    //         }
    //     }
    // }

    // export function onDissconnet(ws: WebSocket) {
    //     for (const lobby of sessions) {
    //         const foundParticipant = lobby.participants.find(
    //             (participant: { ws: WebSocket }) => participant.ws === ws
    //         );

    //         if (foundParticipant) {
    //             if (lobby.host === ws) {
    //                 const data = {
    //                     onHostDisconnect: true,
    //                 };

    //                 disconnectMessage(ws, lobby.participants, lobby.id, { data });

    //                 sessions.splice(sessions.indexOf(lobby), 1);
    //                 console.log(`Deleted lobby ${lobby.id} because the host left`);
    //                 break;
    //             } else {
    //                 const data = {
    //                     onParticipantDisconnect: true,
    //                 };

    //                 disconnectMessage(ws, lobby.participants, lobby.id, { data });

    //                 lobby.participants.splice(lobby.participants.indexOf(foundParticipant), 1);
    //             }
    //             console.log(`Removed user from lobby ${lobby.id}`);
    //             break;
    //         }
    //     }
    // }

    // function disconnectMessage(
    //     disconnectedWs: WebSocket,
    //     participants: Participants[],
    //     token: string,
    //     data: object
    // ) {
    //     for (const participant of participants) {
    //         if (participant.ws === disconnectedWs) continue;
    //         sendMessage(participant.ws, token, data);
    //     }
    // }
}
