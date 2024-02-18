import sqlite3 from 'sqlite3';
import { ExtWebSocket } from '../types/websocket-types';
import { Participants } from '../types/party-types';

export class ParticipantModel {
    private db: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this.db = db;
    }

    public async addParticipant(partyId: string, id: string, name: string): Promise<void> {
        const query = `
            INSERT INTO participants (id, party_id, name, score)
            VALUES (?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(query, [id, partyId, name, 0], (err) => {
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

    public async removeParticipant(partyId: string, participantId: string): Promise<void> {
        const query = `
            DELETE FROM participants 
            WHERE party_id = ? AND id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(query, [partyId, participantId], (err) => {
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

    public async removeAllParticipants(partyId: string): Promise<void> {
        const query = `
            DELETE FROM participants
            WHERE party_id = ?;
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(query, [partyId], (err) => {
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

    public async getPartyIdByParticipant(participantId: string): Promise<string> {
        const query = `SELECT party_id FROM participants WHERE id = ?;`;

        return new Promise((resolve, reject) => {
            this.db.get(query, [participantId], (error, row: { party_id: string }) => {
                if (error) {
                    console.error('Error:', error);
                    reject(error);
                } else {
                    resolve(row?.party_id);
                }
            });
        });
    }

    public async getParticipants(partyId: string): Promise<Participants[]> {
        const query = `SELECT id, name, score FROM participants WHERE party_id = ?;`;

        return new Promise<Participants[]>((resolve, reject) => {
            this.db.all(query, [partyId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as Participants[]);
                }
            });
        });
    }

    public async getParticipantPartyId(participantId: string): Promise<string> {
        const query = `SELECT party_id FROM participants WHERE id = ?;`;

        return new Promise<string>((resolve, reject) => {
            this.db.get(query, [participantId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as string);
                }
            });
        });
    }
}
