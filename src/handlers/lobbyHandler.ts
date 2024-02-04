import { Message, Participants } from '../types/lobbyTypes';
import { LobbyMessageEvent } from '../configs/lobbyConfig';
import { createLobbySchema, joinLobbySchema, messageLobbySchema } from '../schemas/lobbySchema';
import { sendMessage } from '../utils/sendMessage';
import { LobbyModel } from '../models/lobbyModel';
import { isLobbyExists } from '../utils/isLobbyExists';
import { ExtWebSocket } from '../types/webSocketTypes';
import { LobbyManager } from '../managers/lobbyManager';
import { WebSocketManager } from '../managers/webSocketManager';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';

export namespace LobbyHandler {
    export async function createLobby(ws: ExtWebSocket, obj: Message) {
        const validation = createLobbySchema.safeParse(obj);

        if (!validation?.success) {
            console.log(JSON.stringify(validation.error));
            console.log('createLobby validation failed');
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
        const scenario = lobbyData.scenario;

        await lobby.insertLobbyData(lobbyData, (err: any) => {
            if (err) {
                console.error('Error inserting data:', err.message);
            } else {
                console.log('Data inserted successfully.');
            }
        });

        LobbyManager.addLobby(lobby);

        sendMessage(ws, WebSocketMessageEvent.CREATE_LOBBY, id, {
            pin,
            user_name: obj.message.data.name.toString(),
            scenario,
        });
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
            console.log('lobby not found');
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

        const participantsNames = lobby
            .getLobbyData()
            .participants.map((participant) => participant.name);

        sendMessage(ws, WebSocketMessageEvent.JOIN_LOBBY, lobby.getLobbyData().id, {
            success: true,
            user_name: obj.message.data.name.toString(),
            scenario: lobby.getLobbyData().scenario,
            participants: participantsNames,
        });

        for (const participant of lobby.getLobbyData().participants) {
            if (participant.id === ws.id) continue;
            sendMessage(
                WebSocketManager.getWebSocketSession(participant.id),
                WebSocketMessageEvent.PARTICIPANT_JOINED_LOBBY,
                lobby.getLobbyData().id,
                {
                    participants: participantsNames,
                }
            );
        }
    }

    export function startGame(ws: ExtWebSocket) {
        const lobby = LobbyManager.findLobbyByParticipantId(ws.id);

        if (!lobby) {
            console.log('lobby not found');
            return;
        }

        if (lobby.getLobbyData().host !== ws.id) {
            console.log('you are not host');
            return;
        }

        for (const participant of lobby.getLobbyData().participants) {
            if (participant.id === ws.id) continue;
            sendMessage(
                WebSocketManager.getWebSocketSession(participant.id),
                WebSocketMessageEvent.START_GAME,
                lobby.getLobbyData().id,
                {}
            );
        }
    }

    export function messageLobby(ws: ExtWebSocket, obj: Message) {
        if (!obj?.token) {
            console.log('no token provided');
            return;
        }

        const validation = messageLobbySchema.safeParse(obj);

        if (!validation?.success) {
            console.log('messageLobby validation failed');
            return;
        }

        const lobby = LobbyManager.findlobbyByToken(obj.token);

        if (!lobby) {
            console.log('session not found');
            return;
        }

        const data = obj.message.data;

        if (obj.message.type === LobbyMessageEvent.HOST) {
            sendMessage(ws, WebSocketMessageEvent.MESSAGE_LOBBY, obj.token, { data });
        } else if (obj.message.type === LobbyMessageEvent.ALL) {
            for (const participant of lobby.getLobbyData().participants) {
                sendMessage(
                    WebSocketManager.getWebSocketSession(participant.id),
                    WebSocketMessageEvent.MESSAGE_LOBBY,
                    lobby.getLobbyData().id,
                    {
                        ...data,
                    }
                );
            }
        }
    }

    export async function displayQuestionResults(ws: ExtWebSocket, obj: Message) {
        const lobby = LobbyManager.findLobbyByParticipantId(ws.id);

        if (!lobby) {
            console.log('session not found');
            return;
        }

        if (lobby.getLobbyData().host !== ws.id) {
            console.log('you are not host');
            return;
        }

        const questionAnswers = await lobby.getQuestionAnswers(
            lobby.getLobbyData().id,
            Number(obj.message.data.question)
        );

        const answers: number[] = questionAnswers.map((item) => item.answer);

        for (const participant of lobby.getLobbyData().participants) {
            sendMessage(
                WebSocketManager.getWebSocketSession(participant.id),
                WebSocketMessageEvent.DISPLAY_QUESTION_RESULTS,
                lobby.getLobbyData().id,
                {
                    answers,
                }
            );
        }
    }

    export async function answerQuestion(ws: ExtWebSocket, obj: Message) {
        if (!obj?.token) {
            console.log('no token provided');
            return;
        }

        const lobby = LobbyManager.findlobbyByToken(obj.token);

        if (!lobby) {
            console.log('session not found');
            return;
        }

        const data = obj.message.data;

        if (data?.is_correct) {
            const newScore = lobby.getParticipantScore(ws.id) + 1;
            await lobby.updateParticipantScore(
                lobby.getLobbyData().id,
                ws.id,
                newScore,
                (err: any) => {
                    if (err) {
                        console.error('Error inserting data:', err.message);
                    } else {
                        console.log('Data inserted successfully.');
                    }
                }
            );
        }

        await lobby.addAnswer(
            lobby.getLobbyData().id,
            ws.id,
            Number(data.question),
            Number(data.answer),
            (err: any) => {
                if (err) {
                    console.error('Error inserting data:', err.message);
                } else {
                    console.log('Data inserted successfully.');
                }
            }
        );

        sendMessage(
            WebSocketManager.getWebSocketSession(lobby.getLobbyData().host),
            WebSocketMessageEvent.ANSWER_QUESTION,
            lobby.getLobbyData().id,
            {
                participant_answered: true,
            }
        );
    }

    export async function onDisconnect(ws: ExtWebSocket) {
        const lobby = LobbyManager.findLobbyByParticipantId(ws.id);

        if (lobby) {
            if (lobby.getLobbyData().host === ws.id) {
                lobbyHostLeave(lobby);
                return;
            } else {
                lobbyParticipantLeave(lobby);
                return;
            }
        }

        function disconnectMessage(
            disconnectedWs: ExtWebSocket,
            participants: Participants[],
            token: string,
            data: object
        ) {
            for (const participant of participants) {
                if (participant.id === disconnectedWs.id) continue;
                sendMessage(
                    WebSocketManager.getWebSocketSession(participant.id),
                    WebSocketMessageEvent.LEAVE_LOBBY,
                    token,
                    data
                );
            }
        }

        async function lobbyHostLeave(lobby: LobbyModel) {
            disconnectMessage(ws, lobby.getLobbyData().participants, lobby.getLobbyData().id, {
                is_host: true,
            });

            await lobby.removeLobby(lobby.getLobbyData().id, (err: any) => {
                if (err) {
                    console.error('Error inserting data:', err.message);
                } else {
                    console.log('Data removed successfully.');
                }
            });
        }

        async function lobbyParticipantLeave(lobby: LobbyModel) {
            await lobby.removeParticipant(lobby.getLobbyData().id, ws.id, (err: any) => {
                if (err) {
                    console.error('Error inserting data:', err.message);
                } else {
                    console.log('Data removed successfully.');
                }
            });

            disconnectMessage(ws, lobby.getLobbyData().participants, lobby.getLobbyData().id, {
                is_host: false,
                participants: lobby.getLobbyData().participants.map((user) => user.name),
            });
        }
    }
}
