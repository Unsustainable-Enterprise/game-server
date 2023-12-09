import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';
import fs from 'fs';

const db = new sqlite3.Database(dbName);

export namespace DatabaseModel {
    export function init() {
        if (fs.existsSync(dbName)) {
            const deleteQueries = ['DELETE FROM lobbies;', 'DELETE FROM participants;'];

            deleteQueries.forEach((deleteQuery) => {
                db.run(deleteQuery, (err) => {
                    if (err) {
                        console.error(`Error deleting data: ${err.message}`);
                    } else {
                        console.log(`Data deleted.`);
                    }
                });
            });
        }

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
