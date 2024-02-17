import { PartyModel } from '../models/partyModel';
import { ParticipantModel } from '../models/participantModel';
import sqlite3 from 'sqlite3';
import { dbName } from '../configs/dbConfig';

export async function isHostOrParticipant(id: string): Promise<boolean> {
    const db = new sqlite3.Database(dbName);
    try {
        const isHost = await PartyModel.isHostInParty(db, id);
        if (isHost) {
            console.log('isHost', isHost);
            return true;
        }

        const isParticipant = await ParticipantModel.isParticipant(id);
        if (isParticipant) {
            console.log('isParticipant', isParticipant);
            return true;
        }

        return false;
    } catch (error) {
        console.log(error);
        return false;
    } finally {
        db.close();
    }
}
