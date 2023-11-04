import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';

const db = new sqlite3.Database(dbName);

export namespace DatabaseModel {
    export function init() {
        const tableDefinitions: { name: string; query: string }[] = [
            {
                name: 'lobbies',
                query: `
                    CREATE TABLE IF NOT EXISTS lobbies (
                        id TEXT PRIMARY KEY,
                        pin TEXT,
                        scenario TEXT,
                        host TEXT,
                        totalQuestions INTEGER,
                        winPercentage DECIMAL
                    );
                `,
            },
            {
                name: 'participants',
                query: `
                    CREATE TABLE IF NOT EXISTS participants (
                        id TEXT PRIMARY KEY,
                        lobbyId TEXT NOT NULL,
                        name TEXT NOT NULL,
                        score INTEGER
                );
                `,
            },
        ];

        tableDefinitions.forEach(({ name, query }) => {
            db.run(query, (err) => {
                if (err) {
                    console.error(`Error creating table '${name}': ${err.message}`);
                } else {
                    console.log(`Table '${name}' created.`);
                }
            });
        });

        db.close();
    }
}
