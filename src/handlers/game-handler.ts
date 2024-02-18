import { PartyModel } from '../models/party-model';
import { ExtWebSocket } from '../types/websocket-types';
import { Message } from '../types/party-types';
import { startGameSchema } from '../schemas/game-schema';
import { sendMessage } from '../utils/send-message';
import { WebSocketManager } from '../managers/websocket-manager';
import { WebSocketMessageEvent } from '../types/websocket-types';
import { ParticipantModel } from '../models/participant-model';
import { PartyPoolManager } from '../managers/party-pool-manager';

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
