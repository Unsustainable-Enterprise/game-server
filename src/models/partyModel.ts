import { v4 as uuidv4 } from 'uuid';
import { Message, Participants, Party } from '../types/partyTypes';
import { generatePin } from '../utils/generatePin';
import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';
import { ParticipantModel } from './participantModel';
import { AnswerModel } from './answerModel';

export namespace PartyModel {
    const db = new sqlite3.Database(dbName);

    export async function getParty(db: sqlite3.Database, partyId: string): Promise<Party> {
        const query = `SELECT * FROM parties WHERE id = ?;`;

        return new Promise<Party>((resolve, reject) => {
            db.get(query, [partyId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }

    export async function createParty(db: sqlite3.Database, partyData: Party): Promise<void> {
        const { id, pin, scenario, host, total_questions, win_percentage } = partyData;

        const query = `
            INSERT INTO parties (id, pin, scenario, host, total_questions, win_percentage)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [id, pin, scenario, host, total_questions, win_percentage], (err) => {
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

    export async function removeParty(db: sqlite3.Database, partyId: string) {
        const query = `DELETE FROM parties WHERE id = ?;`;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [partyId], async (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        await ParticipantModel.removeAllParticipants(partyId);
                        await AnswerModel.removeAllAnswers(partyId);
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    export async function isHostInParty(db: sqlite3.Database, host: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM parties WHERE host = ?';

            db.get(query, [host], (error, data: { count?: number }) => {
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

    export async function getPartyByPin(db: sqlite3.Database, pin: string): Promise<Party> {
        const query = 'SELECT * FROM parties WHERE pin = ?';

        return new Promise<Party>((resolve, reject) => {
            db.get(query, [pin], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }

    export async function getPartyById(db: sqlite3.Database, token: string): Promise<Party> {
        const query = 'SELECT * FROM parties WHERE id = ?';

        return new Promise<Party>((resolve, reject) => {
            db.get(query, [token], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }

    export async function getPartyByHost(db: sqlite3.Database, host: string): Promise<Party> {
        const query = 'SELECT * FROM parties WHERE host = ?';

        return new Promise<Party>((resolve, reject) => {
            db.get(query, [host], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Party);
                }
            });
        });
    }
}
