import { LobbyModel } from '../models/lobbyModel';

export namespace LobbyManager {
    const lobbies: LobbyModel[] = [];

    export function addLobby(lobby: LobbyModel): void {
        lobbies.push(lobby);
    }

    export function removeLobby(lobbyId: string): void {
        const index = lobbies.findIndex((lobby) => lobby.getLobbyData().id === lobbyId);

        if (index !== -1) {
            lobbies.splice(index, 1);
        }
    }

    export function findlobbyByPin(pin: string): LobbyModel | undefined {
        return lobbies.find((item) => item.getLobbyData().pin === pin);
    }

    export function findLobbyByParticipantId(participantId: string): LobbyModel | undefined {
        return lobbies.find((lobby) =>
            lobby
                .getLobbyData()
                .participants.some((participant) => participant.id === participantId)
        );
    }
}
