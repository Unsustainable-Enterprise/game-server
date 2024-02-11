import { LobbyModel } from '../models/lobbyModel';
import { ParticipantModel } from '../models/participantModel';

export async function isHostOrParticipant(id: string): Promise<boolean> {
    const isHost = await LobbyModel.isHostInLobby(id);
    if (isHost) {
        return true;
    }

    const isParticipant = await ParticipantModel.isParticipant(id);
    if (isParticipant) {
        return true;
    }

    return false;
}
