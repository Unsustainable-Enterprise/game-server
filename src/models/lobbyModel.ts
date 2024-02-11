import { v4 as uuidv4 } from 'uuid';
import { Message, Participants, Lobby } from '../types/lobbyTypes';
import { generatePin } from '../utils/generatePin';
import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';
import { ParticipantModel } from './participantModel';
import { AnswerModel } from './answerModel';

export namespace LobbyModel {
    const db = new sqlite3.Database(dbName);

    export async function getLobby(lobbyId: string): Promise<Lobby> {
        const query = `SELECT * FROM lobbies WHERE id = ?;`;

        return new Promise<Lobby>((resolve, reject) => {
            db.get(query, [lobbyId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Lobby);
                }
            });
        });
    }

    export async function createLobby(lobbyData: Lobby): Promise<void> {
        const { id, pin, scenario, host, total_questions, win_percentage } = lobbyData;

        const query = `
            INSERT INTO lobbies (id, pin, scenario, host, total_questions, win_percentage)
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

    export async function removeLobby(lobbyId: string) {
        const query = `DELETE FROM lobbies WHERE id = ?;`;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [lobbyId], async (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        await ParticipantModel.removeAllParticipants(lobbyId);
                        await AnswerModel.removeAllAnswers(lobbyId);
                        resolve();
                    }
                });
            });
        } catch (error: any) {
            throw error;
        }
    }

    export async function isHostInLobby(host: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const query = 'SELECT COUNT(*) as count FROM lobbies WHERE host = ?';

            db.get(query, [host], (error, row: { count?: number }) => {
                if (error) {
                    console.error('Error:', error);
                    reject(error);
                } else {
                    const lobbyCount = row?.count || 0;
                    resolve(lobbyCount > 0);
                }
            });
        });
    }

    export async function getLobbyByPin(pin: string): Promise<Lobby> {
        const query = 'SELECT * FROM lobbies WHERE pin = ?';

        return new Promise<Lobby>((resolve, reject) => {
            db.get(query, [pin], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Lobby);
                }
            });
        });
    }

    export async function getLobbyById(token: string): Promise<Lobby> {
        const query = 'SELECT * FROM lobbies WHERE id = ?';

        return new Promise<Lobby>((resolve, reject) => {
            db.get(query, [token], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Lobby);
                }
            });
        });
    }

    export async function getLobbyByHost(host: string): Promise<Lobby> {
        const query = 'SELECT * FROM lobbies WHERE host = ?';

        return new Promise<Lobby>((resolve, reject) => {
            db.get(query, [host], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as Lobby);
                }
            });
        });
    }
}
