import { v4 as uuidv4 } from 'uuid';
import { Message, Participants, Lobby } from '../types/lobbyTypes';
import { generatePin } from '../utils/generatePin';
import sqlite3 from 'sqlite3';
import { ExtWebSocket } from '../types/webSocketTypes';
import { LobbyManager } from '../managers/lobbyManager';
import { dbName } from '../configs/dbConfig';

export class LobbyModel {
    private id: string;
    private pin: string;
    private scenario: string;
    private host: string;
    private participants: Participants[];
    private total_questions: number;
    private win_percentage: number;

    constructor(ws: ExtWebSocket, obj: Message) {
        this.id = uuidv4();
        this.pin = generatePin();
        this.scenario = obj.message.data.scenario.toString();
        this.host = ws.id;
        this.participants = [{ id: ws.id, name: obj.message.data.name.toString(), score: 0 }];
        this.total_questions = Number(obj.message.data.total_questions);
        this.win_percentage = Number(obj.message.data.win_percentage) || 51;
    }

    db = new sqlite3.Database(dbName);

    public getLobbyData(): Lobby {
        return {
            id: this.id,
            pin: this.pin,
            scenario: this.scenario,
            host: this.host,
            participants: this.participants,
            total_questions: this.total_questions,
            win_percentage: this.win_percentage,
        };
    }

    public insertLobbyData(lobbyData: Lobby, callback: (err: Error | null) => void) {
        const { id, pin, scenario, host, participants, total_questions, win_percentage } =
            lobbyData;

        const lobbyQuery = `
            INSERT INTO lobbies (id, pin, scenario, host, total_questions, win_percentage)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        this.db.run(
            lobbyQuery,
            [id, pin, scenario, host, total_questions, win_percentage],
            (err) => {
                callback(err);
            }
        );

        participants.forEach((participant) => {
            const participantQuery = `
            INSERT INTO participants (id, lobby_id , name, score)
            VALUES (?, ?, ?, ?);
        `;
            this.db.run(
                participantQuery,
                [participant.id, id, participant.name, participant.score],
                (err) => {
                    callback(err);
                }
            );
        });
    }

    public async addParticipant(
        lobbyId: string,
        ws: ExtWebSocket,
        name: string,
        callback: (err: Error | null) => void
    ) {
        const addParticipantQuery = `
            INSERT INTO participants (id, lobby_id, name, score)
            VALUES (?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(addParticipantQuery, [ws.id, lobbyId, name, 0], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.participants.push({ id: ws.id, name, score: 0 });
                        resolve();
                    }
                });
            });

            callback(null);
        } catch (err: any) {
            callback(err);
        }
    }

    public async removeParticipant(
        lobbyId: string,
        participantId: string,
        callback: (err: Error | null) => void
    ) {
        const deleteParticipantQuery = `
            DELETE FROM participants
            WHERE lobby_id = ? AND id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(deleteParticipantQuery, [lobbyId, participantId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        const index = this.participants.findIndex(
                            (participant) => participant.id === participantId
                        );
                        if (index !== -1) {
                            this.participants.splice(index, 1);
                        }
                        resolve();
                    }
                });
            });

            callback(null);
        } catch (err: any) {
            callback(err);
        }
    }

    public async removeLobby(id: string, callback: (err: Error | null) => void) {
        const deleteParticipantQuery = `
            DELETE FROM lobbies
            WHERE id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.removeAllParticipants(id, (removeParticipantsErr) => {
                    if (removeParticipantsErr) {
                        reject(removeParticipantsErr);
                    } else {
                        this.db.run(deleteParticipantQuery, [id], (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                LobbyManager.removeLobby(id);
                                resolve();
                            }
                        });
                    }
                });
            });

            this.db.close();

            callback(null);
        } catch (err: any) {
            callback(err);
        }
    }

    private async removeAllParticipants(lobbyId: string, callback: (err: Error | null) => void) {
        const deleteAllParticipantsQuery = `
            DELETE FROM participants
            WHERE lobby_id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(deleteAllParticipantsQuery, [lobbyId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            callback(null);
        } catch (err: any) {
            callback(err);
        }
    }
}
