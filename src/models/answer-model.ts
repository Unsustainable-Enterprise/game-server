import sqlite3 from 'sqlite3';

export class AnswerModel {
    private db: sqlite3.Database;

    constructor(db: sqlite3.Database) {
        this.db = db;
    }

    public async addAnswer(
        partyId: string,
        participantId: string,
        question: number,
        answer: number,
        isCorrect: boolean
    ): Promise<void> {
        const query = `
            INSERT INTO answers (participant_id, party_id, question, answer, correct)
            VALUES (?, ?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(query, [participantId, partyId, question, answer, isCorrect], (err) => {
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

    public async removeAllAnswers(partyId: string): Promise<void> {
        const query = `DELETE FROM answers WHERE party_id = ?;`;

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

    public async getQuestionAnswers(partyId: string, question: number): Promise<number[]> {
        const query = `SELECT answer FROM answers WHERE party_id = ? AND question = ?;`;

        return new Promise<number[]>((resolve, reject) => {
            this.db.all(query, [partyId, question], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map((row) => (row as { answer: number }).answer));
                }
            });
        });
    }
}
