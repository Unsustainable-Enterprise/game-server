import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';
import { ExtWebSocket } from '../types/webSocketTypes';
import { Participants } from '../types/lobbyTypes';

export namespace ParticipantModel {
    const db = new sqlite3.Database(dbName);

    export async function getParticipantScore(participantId: string): Promise<number> {
        const query = `SELECT score FROM participants WHERE id = ?;`;

        return new Promise<number>((resolve, reject) => {
            db.all(query, [participantId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve((rows[0] as { score: number })?.score);
                }
            });
        });
    }

    export async function addParticipant(lobbyId: string, id: string, name: string): Promise<void> {
        const query = `
            INSERT INTO participants (id, lobby_id, name, score)
            VALUES (?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [id, lobbyId, name, 0], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    export async function removeParticipant(lobbyId: string, participantId: string): Promise<void> {
        const query = `
            DELETE FROM participants 
            WHERE lobby_id = ? AND id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [lobbyId, participantId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    export async function updateParticipantScore(
        participantId: string,
        score: number
    ): Promise<void> {
        const query = `
            UPDATE participants
            SET score = ?
            WHERE id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [score, participantId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    export async function removeAllParticipants(lobbyId: string): Promise<void> {
        const query = `
            DELETE FROM participants
            WHERE lobby_id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [lobbyId], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    export async function isParticipant(participantId: string): Promise<boolean> {
        const query = `SELECT COUNT(*) as count FROM participants WHERE id = ?;`;

        return new Promise<boolean>((resolve, reject) => {
            db.all(query, [participantId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.length > 0);
                }
            });
        });
    }

    export async function getParticipants(lobbyId: string): Promise<Participants[]> {
        const query = `SELECT id, name, score FROM participants WHERE lobby_id = ?;`;

        return new Promise<Participants[]>((resolve, reject) => {
            db.all(query, [lobbyId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Participants[]);
                }
            });
        });
    }

    export async function getParticipantLobbyId(participantId: string): Promise<string> {
        const query = `SELECT lobby_id FROM participants WHERE id = ?;`;

        return new Promise<string>((resolve, reject) => {
            db.get(query, [participantId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as string);
                }
            });
        });
    }
}
