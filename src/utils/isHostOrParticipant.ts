import { PartyModel } from '../models/partyModel';
import { ParticipantModel } from '../models/participantModel';
import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';

export async function isHostOrParticipant(id: string): Promise<boolean> {
    const db = new sqlite3.Database(dbName);
    try {
        const db = new sqlite3.Database(dbName);
        const partyModel = new PartyModel(db);
        const participantModel = new ParticipantModel(db);

        const isHost = await partyModel.isHostInParty(id);
        if (isHost) {
            return true;
        }

        const isParticipant = await participantModel.isParticipant(id);
        if (isParticipant) {
            return true;
        }

        return false;
    } catch (error) {
        throw new Error('Error checking for host or participant');
    } finally {
        db.close();
    }
}
