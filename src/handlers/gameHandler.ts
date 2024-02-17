import { PartyModel } from '../models/partyModel';
import { ExtWebSocket } from '../types/webSocketTypes';
import { Message } from '../types/partyTypes';
import { startGameSchema } from '../schemas/gameSchema';
import { sendMessage } from '../utils/sendMessage';
import { WebSocketManager } from '../managers/webSocketManager';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';
import { ParticipantModel } from '../models/participantModel';
import { PartyPoolManager } from '../managers/PartyPoolManager';

export namespace GameHandler {
    export async function startGame(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = startGameSchema.safeParse(obj);

            if (!validation?.success) {
                console.log('startGame validation failed');
                return;
            }

            const party = await PartyPoolManager.getPartyById(String(obj.token));

            if (!party) {
                console.log('party not found');
                return;
            }

            if (party.host !== ws.id) {
                console.log('you are not host');
                return;
            }

            const participants = await party.participantModel.getParticipants(party.id);

            for (const participant of participants) {
                if (participant.id === ws.id) continue;
                sendMessage(
                    WebSocketManager.getWebSocketSession(participant.id),
                    WebSocketMessageEvent.START_GAME,
                    party.id,
                    {}
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
}
