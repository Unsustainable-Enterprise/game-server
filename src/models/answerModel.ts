import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';

export namespace AnswerModel {
    const db = new sqlite3.Database(dbName);

    export async function addAnswer(
        partyId: string,
        participantId: string,
        question: number,
        answer: number
    ): Promise<void> {
        const query = `
            INSERT INTO answers (participant_id, lobby_id, question, answer)
            VALUES (?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                db.run(query, [participantId, partyId, question, answer], (err) => {
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

    export async function removeAllAnswers(lobbyId: string): Promise<void> {
        const query = `DELETE FROM answers WHERE lobby_id = ?;`;

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

    export async function getQuestionAnswers(lobbyId: string, question: number): Promise<number[]> {
        const query = `SELECT answer FROM answers WHERE lobby_id = ? AND question = ?;`;

        return new Promise<number[]>((resolve, reject) => {
            db.all(query, [lobbyId, question], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map((row) => (row as { answer: number }).answer));
                }
            });
        });
    }
}
