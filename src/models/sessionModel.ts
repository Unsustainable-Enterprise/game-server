import sqlite3 from 'sqlite3';
import { Session } from '../configs/sessionConfig';

class SessionModel {
    private static instance: SessionModel | null = null;
    db: sqlite3.Database;

    private constructor() {
        this.db = new sqlite3.Database('sessions.db');
        this.initializeSchema();
    }

    public static getInstance() {
        if (SessionModel.instance === null) {
            SessionModel.instance = new SessionModel();
        }
        return SessionModel.instance;
    }

    private initializeSchema() {
        this.db.serialize(() => {
            this.db.run(
                'CREATE TABLE IF NOT EXISTS sessions (' +
                    'id TEXT PRIMARY KEY,' +
                    'pin TEXT,' +
                    'scenario TEXT,' +
                    'host TEXT,' +
                    'participants TEXT,' +
                    'totalQuestions INTEGER,' +
                    'winPercentage INTEGER' +
                    ')'
            );
        });
    }

    public insertSession(session: Session) {
        const stmt = this.db.prepare('INSERT INTO sessions VALUES (?, ?, ?, ?, ?, ?, ?)');
        stmt.run(
            session.id,
            session.pin,
            session.scenario,
            session.host,
            JSON.stringify(session.participants),
            session.totalQuestions,
            session.winPercentage
        );
        stmt.finalize();
    }

    public getSessionById(id: string, callback: (err: any, row: any) => void) {
        this.db.get('SELECT * FROM sessions WHERE id = ?', id, callback);
    }

    public closeDatabase() {
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            }
        });
    }
}

export default SessionModel.getInstance();
