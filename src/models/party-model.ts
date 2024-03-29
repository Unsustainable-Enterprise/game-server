import { IsHost, PartyDb } from '../types/party-types';
import sqlite3 from 'sqlite3';
import { ParticipantModel } from './participant-model';
import { AnswerModel } from './answer-model';

export class PartyModel {
    private db: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this.db = db;
    }

    public async getParty(partyId: string): Promise<PartyDb> {
        const query = `SELECT * FROM parties WHERE id = ?;`;

        return new Promise<PartyDb>((resolve, reject) => {
            this.db.get(query, [partyId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as PartyDb);
                }
            });
        });
    }

    public async createParty(partyData: PartyDb): Promise<void> {
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

    public async getPartyIdByHost(hostId: string): Promise<string> {
        const query = 'SELECT id FROM parties WHERE host = ?';

        return new Promise<string>((resolve, reject) => {
            this.db.get(query, [hostId], (error, row: { id: string }) => {
                if (error) {
                    console.error('Error:', error);
                    reject(error);
                } else {
                    resolve(row?.id);
                }
            });
        });
    }

    public async getPartyByPin(pin: string): Promise<PartyDb> {
        const query = 'SELECT * FROM parties WHERE pin = ?';

        return new Promise<PartyDb>((resolve, reject) => {
            this.db.get(query, [pin], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as PartyDb);
                }
            });
        });
    }

    public async getPartyById(token: string): Promise<PartyDb> {
        const query = 'SELECT * FROM parties WHERE id = ?';

        return new Promise<PartyDb>((resolve, reject) => {
            this.db.get(query, [token], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as PartyDb);
                }
            });
        });
    }

    public async getPartyByHost(host: string): Promise<PartyDb> {
        const query = 'SELECT * FROM parties WHERE host = ?';

        return new Promise<PartyDb>((resolve, reject) => {
            this.db.get(query, [host], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as PartyDb);
                }
            });
        });
    }

    public async getAllPartyPlayerIds(
        partyId: string,
        participantModel: ParticipantModel
    ): Promise<string[]> {
        const query = 'SELECT host FROM lobbies WHERE id = ?';

        return new Promise<string[]>((resolve, reject) => {
            this.db.get(query, [partyId], async (err, row: { host: string }) => {
                if (err) {
                    reject(err);
                } else {
                    const participants = await participantModel.getParticipants(partyId);
                    const combinedResult = participants.map((participant) => participant.id);
                    combinedResult.push(row.host);
                    resolve(combinedResult);
                }
            });
        });
    }
}
