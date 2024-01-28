import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';
import fs from 'fs';

const db = new sqlite3.Database(dbName);

export namespace DatabaseModel {
    export function init() {
        if (fs.existsSync(dbName)) {
            const deleteQueries = [
                'DELETE FROM lobbies;',
                'DELETE FROM participants;',
                'DELETE FROM answers;',
            ];

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
                        total_questions INTEGER,
                        win_percentage DECIMAL
                    );
                `,
            },
            {
                name: 'participants',
                query: `
                    CREATE TABLE IF NOT EXISTS participants (
                        id TEXT PRIMARY KEY,
                        lobby_id TEXT NOT NULL,
                        name TEXT NOT NULL,
                        score INTEGER
                );
                `,
            },
            {
                name: 'answers',
                query: `
                    CREATE TABLE IF NOT EXISTS answers (
                        id TEXT PRIMARY KEY,
                        participant_id TEXT NOT NULL,
                        lobby_id TEXT NOT NULL,
                        question INT NOT NULL,
                        answer INT NOT NULL
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
