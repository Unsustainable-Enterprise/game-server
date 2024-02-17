import sqlite3 from 'sqlite3';
import fs from 'fs';

export namespace DatabaseModel {
    const dbName = 'database.db';
    const db = new sqlite3.Database(dbName);

    export function getDbName(): string {
        return dbName;
    }

    export async function init() {
        if (fs.existsSync(dbName)) {
            const deleteQueries = [
                'DROP TABLE IF EXISTS answers;',
                'DROP TABLE IF EXISTS participants;',
                'DROP TABLE IF EXISTS parties;',
            ];

            for (const deleteQuery of deleteQueries) {
                await runQuery(deleteQuery, 'Error deleting data');
            }
        }

        const tableDefinitions: { name: string; query: string }[] = [
            {
                name: 'parties',
                query: `
                    CREATE TABLE parties (
                        id TEXT PRIMARY KEY,
                        pin TEXT,
                        scenario TEXT,
                        host TEXT,
                        total_questions INTEGER,
                        win_percentage DECIMAL
                    );
                `,
            },
            {
                name: 'participants',
                query: `
                    CREATE TABLE participants (
                        id TEXT PRIMARY KEY,
                        party_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        score INTEGER
                );
                `,
            },
            {
                name: 'answers',
                query: `
                    CREATE TABLE answers (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        participant_id TEXT NOT NULL,
                        party_id TEXT NOT NULL,
                        question INT NOT NULL,
                        answer INT NOT NULL
                );
                `,
            },
        ];

        for (const { name, query } of tableDefinitions) {
            await runQuery(query, `Error creating table '${name}'`);
        }

        db.close();
    }

    function runQuery(query: string, errorMessage: string): Promise<void> {
        return new Promise((resolve, reject) => {
            db.run(query, (err) => {
                if (err) {
                    console.error(`${errorMessage}: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`Query executed: ${query}`);
                    resolve();
                }
            });
        });
    }
}
