import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';

const db = new sqlite3.Database(dbName);

export async function isLobbyExists(host: string): Promise<boolean> {
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
