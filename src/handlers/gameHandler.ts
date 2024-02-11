import { LobbyModel } from '../models/lobbyModel';
import { ExtWebSocket } from '../types/webSocketTypes';
import { Message } from '../types/lobbyTypes';
import { startGameSchema } from '../schemas/gameSchema';
import { sendMessage } from '../utils/sendMessage';
import { WebSocketManager } from '../managers/webSocketManager';
import { WebSocketMessageEvent } from '../configs/webSocketConfig';
import { ParticipantModel } from '../models/participantModel';

export namespace GameHandler {
    export async function startGame(ws: ExtWebSocket, obj: Message): Promise<void> {
        try {
            const validation = startGameSchema.safeParse(obj);

            if (!validation?.success) {
                console.log(JSON.stringify(validation.error));
                console.log('createLobby validation failed');
                return;
            }

            const lobby = await LobbyModel.getLobbyById(String(obj.token));

            if (!lobby) {
                console.log('lobby not found');
                return;
            }

            if (lobby.host !== ws.id) {
                console.log('you are not host');
                return;
            }

            const participants = await ParticipantModel.getParticipants(lobby.id);

            for (const participant of participants) {
                if (participant.id === ws.id) continue;
                sendMessage(
                    WebSocketManager.getWebSocketSession(participant.id),
                    WebSocketMessageEvent.START_GAME,
                    lobby.id,
                    {}
                );
            }
        } catch (error) {
            console.log(error);
        }
    }
}
