import { PartyHandler } from '../handlers/party-handler';
import sqlite3 from 'sqlite3';
import { PartyModel } from '../models/party-model';
import { DatabaseModel } from '../models/database-model';

export async function generatePin(): Promise<string> {
    try {
        const pin = (Math.floor(Math.random() * 90000) + 10000).toString();

        if (await checkForDuplicate(pin)) {
            return generatePin();
        }

        return pin;
    } catch (error) {
        throw new Error('Error generating pin');
    }
}

async function checkForDuplicate(pin: string): Promise<boolean> {
    try {
        const db = new sqlite3.Database(DatabaseModel.getDbName());
        const partyModel = new PartyModel(db);

        const party = await partyModel.getPartyByPin(pin);

        db.close();

        if (party) {
            return true;
        }

        return false;
    } catch (error) {
        throw new Error('Error checking for duplicate pin');
    }
}
