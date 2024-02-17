import { Message, Participants } from '../types/partyTypes';
import { createPartySchema, joinPartySchema } from '../schemas/partySchema';
import { sendMessage } from '../utils/sendMessage';
import { PartyModel } from '../models/partyModel';
import { ExtWebSocket } from '../types/webSocketTypes';
import { WebSocketManager } from '../managers/webSocketManager';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';
import { generatePin } from '../utils/generatePin';
import { Party } from '../types/partyTypes';
import { v4 as uuidv4 } from 'uuid';
import { isHostOrParticipant } from '../utils/isHostOrParticipant';
import { ParticipantModel } from '../models/participantModel';
import { PartyPoolManager } from '../managers/PartyPoolManager';

export namespace PartyHandler {
    export async function createParty(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = createPartySchema.safeParse(obj);
            if (!validation?.success) {
                console.log('createParty validation failed');
                return;
            }

            const isPlaying = await isHostOrParticipant(ws.id);
            if (isPlaying) {
                console.log('You are already in party');
                return;
            }

            const party: Party = {
                id: uuidv4(),
                pin: await generatePin(),
                scenario: obj.message.data.scenario.toString(),
                host: ws.id,
                total_questions: 10,
                win_percentage: 0.5,
            };

            const partyPool = PartyPoolManager.addParty(party.id);
            await partyPool.partyModel.createParty(party);

            sendMessage(ws, WebSocketMessageEvent.CREATE_PARTY, party.id, {
                pin: party.pin,
                user_name: obj.message.data.name.toString(),
                scenario: party.scenario,
            });
        } catch (error) {
            console.log(error);
        }
    }

    export async function joinParty(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = joinPartySchema.safeParse(obj);

            if (!validation?.success) {
                console.log('joinParty validation failed');
                return;
            }

            const isPlaying = await isHostOrParticipant(ws.id);

            if (isPlaying) {
                console.log('You are already in party');
                return;
            }

            const partyPool = PartyPoolManager.findPartyById(obj.message.data.pin.toString());

            if (!partyPool) {
                console.log('party not found');
                return;
            }

            const party = await partyPool.partyModel.getPartyByPin(obj.message.data.pin.toString());

            if (!party) {
                console.log('party not found');
                return;
            }

            await partyPool.participantModel.addParticipant(
                party.id,
                ws.id,
                obj.message.data.name.toString()
            );

            const participants = await partyPool.participantModel.getParticipants(party.id);

            const participantsNames = participants.map((participant) => participant.name);

            sendMessage(ws, WebSocketMessageEvent.JOIN_PARTY, party.id, {
                success: true,
                user_name: obj.message.data.name.toString(),
                scenario: party.scenario,
                participants: participantsNames,
            });

            for (const player of participants) {
                if (player.id === ws.id) continue;
                sendMessage(
                    WebSocketManager.getWebSocketSession(player.id),
                    WebSocketMessageEvent.PARTICIPANT_JOINED_PARTY,
                    party.id,
                    {
                        participants: participantsNames,
                    }
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
}

//     export async function onDisconnect(ws: ExtWebSocket): Promise<void> {
//         let party: Party;
//         const isParticipant = await ParticipantModel.isParticipant(ws.id);

//         if (isParticipant) {
//             const partyId = await ParticipantModel.getParticipantLobbyId(ws.id);
//             party = await PartyModel.getPartyById(lobbyId);
//         }

//         const isHost = await PartyModel.isHostInParty(ws.id);

//         if (!isParticipant || !isHost) {
//             return;
//         }

//         party = await PartyModel.getPartyByHost(ws.id);

//         if (party) {
//             if (isHost) {
//                 partyHostLeave(party);
//                 return;
//             } else {
//                 partyParticipantLeave(party);
//                 return;
//             }
//         }

//         function disconnectMessage(
//             disconnectedWs: ExtWebSocket,
//             participants: Participants[],
//             token: string,
//             data: object
//         ) {
//             for (const participant of participants) {
//                 if (participant.id === disconnectedWs.id) continue;
//                 sendMessage(
//                     WebSocketManager.getWebSocketSession(participant.id),
//                     WebSocketMessageEvent.LEAVE_PARTY,
//                     token,
//                     data
//                 );
//             }
//         }

//         async function partyHostLeave(party: Party) {
//             disconnectMessage(ws, party.getLobbyData().participants, lobby.getLobbyData().id, {
//                 is_host: true,
//             });

//             await lobby.removeLobby(lobby.getLobbyData().id, (err: any) => {
//                 if (err) {
//                     console.error('Error inserting data:', err.message);
//                 } else {
//                     console.log('Data removed successfully.');
//                 }
//             });
//         }

//         async function lobbyParticipantLeave(lobby: Lobby) {
//             await lobby.removeParticipant(lobby.getLobbyData().id, ws.id, (err: any) => {
//                 if (err) {
//                     console.error('Error inserting data:', err.message);
//                 } else {
//                     console.log('Data removed successfully.');
//                 }
//             });

//             disconnectMessage(ws, lobby.getLobbyData().participants, lobby.getLobbyData().id, {
//                 is_host: false,
//                 participants: lobby.getLobbyData().participants.map((user) => user.name),
//             });
//         }
//     }
// }

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
