import { PartyHandler } from '../handlers/partyHandler';
import sqlite3 from 'sqlite3';
import { PartyModel } from '../models/partyModel';
import { dbName } from '../configs/dbConfig';

export async function generatePin() {
    const pin = (Math.floor(Math.random() * 90000) + 10000).toString();
    if (await checkForDuplicate(pin)) {
        return generatePin();
    }
    return pin;
}

async function checkForDuplicate(pin: string): Promise<boolean> {
    const db = new sqlite3.Database(dbName);
    const party = await PartyModel.getPartyByPin(db, pin);

    db.close();

    if (party) {
        return true;
    }

    return false;
}
