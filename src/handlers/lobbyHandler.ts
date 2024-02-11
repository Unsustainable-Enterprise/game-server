import { Message, Participants } from '../types/lobbyTypes';
import { LobbyMessageEvent } from '../configs/lobbyConfig';
import { createLobbySchema, joinLobbySchema } from '../schemas/lobbySchema';
import { sendMessage } from '../utils/sendMessage';
import { LobbyModel } from '../models/lobbyModel';
import { ExtWebSocket } from '../types/webSocketTypes';
import { WebSocketManager } from '../managers/webSocketManager';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';
import { generatePin } from '../utils/generatePin';
import { Lobby } from '../types/lobbyTypes';
import { v4 as uuidv4 } from 'uuid';
import { isHostOrParticipant } from '../utils/isNotHostOrParticipant';
import { ParticipantModel } from '../models/participantModel';

export namespace LobbyHandler {
    export async function createLobby(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = createLobbySchema.safeParse(obj);
            if (!validation?.success) {
                console.log(JSON.stringify(validation.error));
                console.log('createLobby validation failed');
                return;
            }

            const isPlaying = await isHostOrParticipant(ws.id);
            if (isPlaying) {
                console.log('You are already in lobby');
                return;
            }

            const lobby: Lobby = {
                id: uuidv4(),
                pin: generatePin(),
                scenario: obj.message.data.scenario.toString(),
                host: ws.id,
                total_questions: 10,
                win_percentage: 0.5,
            };

            await LobbyModel.createLobby(lobby);

            sendMessage(ws, WebSocketMessageEvent.CREATE_LOBBY, lobby.id, {
                pin: lobby.pin,
                user_name: obj.message.data.name.toString(),
                scenario: lobby.scenario,
            });
        } catch (error) {
            console.log(error);
        }
    }

    export async function joinLobby(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = joinLobbySchema.safeParse(obj);

            if (!validation?.success) {
                console.log('joinLobby validation failed');
                return;
            }

            const isPlaying = await isHostOrParticipant(ws.id);

            if (isPlaying) {
                console.log('You are already in lobby');
                return;
            }

            const lobby = await LobbyModel.getLobbyByPin(obj.message.data.pin.toString());

            if (!lobby) {
                console.log('lobby not found');
                return;
            }

            await ParticipantModel.addParticipant(
                lobby.id,
                ws.id,
                obj.message.data.name.toString()
            );
            const participants = await ParticipantModel.getParticipants(lobby.id);

            const participantsNames = participants.map((participant) => participant.name);

            sendMessage(ws, WebSocketMessageEvent.JOIN_LOBBY, lobby.id, {
                success: true,
                user_name: obj.message.data.name.toString(),
                scenario: lobby.scenario,
                participants: participantsNames,
            });

            for (const player of participants) {
                if (player.id === ws.id) continue;
                sendMessage(
                    WebSocketManager.getWebSocketSession(player.id),
                    WebSocketMessageEvent.PARTICIPANT_JOINED_LOBBY,
                    lobby.id,
                    {
                        participants: participantsNames,
                    }
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    export async function onDisconnect(ws: ExtWebSocket): Promise<void> {
        let lobby: Lobby;
        const isParticipant = await ParticipantModel.isParticipant(ws.id);

        if (isParticipant) {
            const lobbyId = await ParticipantModel.getParticipantLobbyId(ws.id);
            lobby = await LobbyModel.getLobbyById(lobbyId);
        }

        const isHost = await LobbyModel.isHostInLobby(ws.id);

        if (!isParticipant || !isHost) {
            return;
        }

        lobby = await LobbyModel.getLobbyByHost(ws.id);

        if (lobby) {
            if (isHost) {
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

        async function lobbyHostLeave(lobby: Lobby) {
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

        async function lobbyParticipantLeave(lobby: Lobby) {
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

//     export async function displayQuestionResults(ws: ExtWebSocket, obj: Message) {
//         const lobby = LobbyManager.findLobbyByParticipantId(ws.id);

//         if (!lobby) {
//             console.log('session not found');
//             return;
//         }

//         if (lobby.getLobbyData().host !== ws.id) {
//             console.log('you are not host');
//             return;
//         }

//         const questionAnswers = await lobby.getQuestionAnswers(
//             lobby.getLobbyData().id,
//             Number(obj.message.data.question)
//         );

//         const answers: number[] = questionAnswers.map((item) => item.answer);

//         for (const participant of lobby.getLobbyData().participants) {
//             sendMessage(
//                 WebSocketManager.getWebSocketSession(participant.id),
//                 WebSocketMessageEvent.DISPLAY_QUESTION_RESULTS,
//                 lobby.getLobbyData().id,
//                 {
//                     answers,
//                 }
//             );
//         }
//     }

//     export async function answerQuestion(ws: ExtWebSocket, obj: Message) {
//         if (!obj?.token) {
//             console.log('no token provided');
//             return;
//         }

//         const lobby = LobbyManager.findlobbyByToken(obj.token);

//         if (!lobby) {
//             console.log('session not found');
//             return;
//         }

//         const data = obj.message.data;

//         if (data?.is_correct) {
//             const newScore = lobby.getParticipantScore(ws.id) + 1;
//             await lobby.updateParticipantScore(
//                 lobby.getLobbyData().id,
//                 ws.id,
//                 newScore,
//                 (err: any) => {
//                     if (err) {
//                         console.error('Error inserting data:', err.message);
//                     } else {
//                         console.log('Data inserted successfully.');
//                     }
//                 }
//             );
//         }

//         await lobby.addAnswer(
//             lobby.getLobbyData().id,
//             ws.id,
//             Number(data.question),
//             Number(data.answer),
//             (err: any) => {
//                 if (err) {
//                     console.error('Error inserting data:', err.message);
//                 } else {
//                     console.log('Data inserted successfully.');
//                 }
//             }
//         );

//         sendMessage(
//             WebSocketManager.getWebSocketSession(lobby.getLobbyData().host),
//             WebSocketMessageEvent.ANSWER_QUESTION,
//             lobby.getLobbyData().id,
//             {
//                 participant_answered: true,
//             }
//         );
//     }
