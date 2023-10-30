import { v4 as uuidv4 } from 'uuid';
import { Message, Participants, Lobby } from '../configs/sessionConfig';
import { generatePin } from '../utils/generatePin';
import sqlite3 from 'sqlite3';
import { ExtWebSocket } from '../configs/webSocketConfig';

export class LobbyModel {
    private id: string;
    private pin: string;
    private scenario: string;
    private host: string;
    private participants: Participants[];
    private totalQuestions: number;
    private winPercentage: number;

    constructor(ws: ExtWebSocket, obj: Message) {
        this.id = uuidv4();
        this.pin = generatePin();
        this.scenario = obj.message.data.scenario.toString();
        this.host = ws.id;
        this.participants = [{ id: ws.id, name: obj.message.data.name.toString(), score: 0 }];
        this.totalQuestions = Number(obj.message.data.totalQuestions);
        this.winPercentage = Number(obj.message.data.winPercentage) || 51;
    }

    db = new sqlite3.Database('mydatabase.db');

    public getLobbyData(): Lobby {
        return {
            id: this.id,
            pin: this.pin,
            scenario: this.scenario,
            host: this.host,
            participants: this.participants,
            totalQuestions: this.totalQuestions,
            winPercentage: this.winPercentage,
        };
    }

    public insertLobbyData(lobbyData: Lobby, callback: (err: Error | null) => void) {
        const { id, pin, scenario, host, participants, totalQuestions, winPercentage } = lobbyData;

        const lobbyQuery = `
            INSERT INTO lobbies (id, pin, scenario, host, totalQuestions, winPercentage)
            VALUES (?, ?, ?, ?, ?, ?);
        `;

        this.db.run(lobbyQuery, [id, pin, scenario, host, totalQuestions, winPercentage], (err) => {
            callback(err);
        });

        participants.forEach((participant) => {
            const participantQuery = `
            INSERT INTO participants (id, lobbyId , name, score)
            VALUES (?, ?, ?, ?);
        `;
            this.db.run(
                participantQuery,
                [participant.id, id, participant.name, participant.score],
                (err) => {
                    callback(err);
                }
            );
        });
    }

    public async addParticipant(
        lobbyId: string,
        ws: ExtWebSocket,
        name: string,
        callback: (err: Error | null) => void
    ) {
        const addParticipantQuery = `
            INSERT INTO participants (id, lobbyId, name, score)
            VALUES (?, ?, ?, ?);
        `;

        try {
            await new Promise<void>((resolve, reject) => {
                this.db.run(addParticipantQuery, [ws.id, lobbyId, name, 0], (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.participants.push({ id: ws.id, name, score: 0 });
                        resolve();
                    }
                });
            });

            callback(null);
        } catch (err: any) {
            callback(err);
        }
    }
}
