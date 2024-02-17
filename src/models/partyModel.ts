import { Party } from '../types/partyTypes';
import sqlite3 from 'sqlite3';
import { ParticipantModel } from './participantModel';
import { AnswerModel } from './answerModel';

export class PartyModel {
    private db: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this.db = db;
    }

    public async getParty(partyId: string): Promise<Party> {
        const query = `SELECT * FROM parties WHERE id = ?;`;

        return new Promise<Party>((resolve, reject) => {
            this.db.get(query, [partyId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }

    public async createParty(partyData: Party): Promise<void> {
        const { id, pin, scenario, host, total_questions, win_percentage } = partyData;

        const query = `
            INSERT INTO parties (id, pin, scenario, host, total_questions, win_percentage)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(
                    query,
                    [id, pin, scenario, host, total_questions, win_percentage],
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        } catch (error: any) {
            throw error;
        }
    }

    public async removeParty(
        partyId: string,
        participantModel: ParticipantModel,
        answerModel: AnswerModel
    ): Promise<void> {
        const query = `DELETE FROM parties WHERE id = ?;`;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(query, [partyId], async (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        await participantModel.removeAllParticipants(partyId);
                        await answerModel.removeAllAnswers(partyId);
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    public async isHostInParty(host: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM parties WHERE host = ?';

            this.db.get(query, [host], (error, data: { count?: number }) => {
                if (error) {
                    console.error('Error:', error);
                    reject(error);
                } else {
                    const partyIdCount = data?.count || 0;
                    resolve(partyIdCount > 0);
                }
            });
        });
    }

    public async getPartyByPin(pin: string): Promise<Party> {
        const query = 'SELECT * FROM parties WHERE pin = ?';

        return new Promise<Party>((resolve, reject) => {
            this.db.get(query, [pin], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }

    public async getPartyById(token: string): Promise<Party> {
        const query = 'SELECT * FROM parties WHERE id = ?';

        return new Promise<Party>((resolve, reject) => {
            this.db.get(query, [token], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }

    public async getPartyByHost(host: string): Promise<Party> {
        const query = 'SELECT * FROM parties WHERE host = ?';

        return new Promise<Party>((resolve, reject) => {
            this.db.get(query, [host], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }
}
