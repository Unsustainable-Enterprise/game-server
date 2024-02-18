import { PartyDb, Message, Participants, Party } from '../types/party-types';
import { createPartySchema, joinPartySchema } from '../schemas/party-schema';
import { sendMessage } from '../utils/send-message';
import { ExtWebSocket } from '../types/websocket-types';
import { WebSocketManager } from '../managers/websocket-manager';
import { WebSocketMessageEvent } from '../types/websocket-types';
import { generatePin } from '../utils/generate-pin';
import { v4 as uuidv4 } from 'uuid';
import { isPlayerInParty } from '../utils/player-in-party';
import { PartyPoolManager } from '../managers/party-pool-manager';

export namespace PartyHandler {
    export async function createParty(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = createPartySchema.safeParse(obj);
            if (!validation?.success) {
                console.log('createParty validation failed');
                return;
            }

            const partyStatus = await isPlayerInParty(ws.id);
            if (partyStatus.isHost || partyStatus.isParticipant) {
                console.log('You are already in party');
                return;
            }

            const partyData: PartyDb = {
                id: uuidv4(),
                pin: await generatePin(),
                scenario: obj.message.data.scenario.toString(),
                host: ws.id,
                total_questions: 10,
                win_percentage: 0.5,
            };

            const party = PartyPoolManager.addParty(partyData.id, partyData.pin);
            await party.partyModel.createParty(partyData);

            sendMessage(ws, WebSocketMessageEvent.CREATE_PARTY, partyData.id, {
                pin: partyData.pin,
                user_name: obj.message.data.name.toString(),
                scenario: partyData.scenario,
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

            const partyStatus = await isPlayerInParty(ws.id);

            if (partyStatus.isHost || partyStatus.isParticipant) {
                console.log('You are already in party');
                return;
            }

            const party = await PartyPoolManager.getPartyByPin(obj.message.data.pin.toString());

            if (!party) {
                console.log('party1 not found');
                return;
            }

            await party.participantModel.addParticipant(
                party.id,
                ws.id,
                obj.message.data.name.toString()
            );

            const participants = await party.participantModel.getParticipants(party.id);

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

    export async function onDisconnect(ws: ExtWebSocket): Promise<void> {
        const partyStatus = await isPlayerInParty(ws.id);

        if (!partyStatus.isHost && !partyStatus.isParticipant) {
            return;
        }

        const party = await PartyPoolManager.getPartyById(partyStatus.id);

        if (party) {
            if (partyStatus.isHost) {
                return await hostLeft(party);
            } else {
                return participantLeft(party);
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
                    WebSocketMessageEvent.LEAVE_PARTY,
                    token,
                    data
                );
            }
        }

        async function hostLeft(party: Party) {
            const participants = await party.participantModel.getParticipants(party.id);

            disconnectMessage(ws, participants, party.id, {
                is_host: true,
            });

            await party.partyModel.removeParty(party.id, party.participantModel, party.answerModel);
        }

        async function participantLeft(party: Party) {
            await party.participantModel.removeParticipant(party.id, ws.id);
        }
    }
}
